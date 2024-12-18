'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { shuffle } from 'lodash';
import { X } from 'lucide-react';
import QuestionMultipleChoice from '../../components/QuestionMultipleChoice';
import QuestionTrueFalse from '../../components/QuestionTrueFalse';
import QuestionWritten from '../../components/QuestionWritten';

// Constants for question type probabilities
const QUESTION_TYPES = {
  MULTIPLE_CHOICE: { type: 'multiple-choice', probability: 45 },
  TRUE_FALSE: { type: 'true-false', probability: 35 },
  WRITTEN: { type: 'written', probability: 20 }
};

const DynamicTestPage = () => {
  const params = useParams();
  console.log("Params object:", params);
  console.log("Deck ID:", params.deckId);
  const router = useRouter();
  const [deck, setDeck] = useState(null);
  const [currentCard, setCurrentCard] = useState(null);
  const [questionType, setQuestionType] = useState(null);
  const [progress, setProgress] = useState({ 
    learned: 0, 
    mastered: 0, 
    unfamiliar: 0 
  });
  const [distractors, setDistractors] = useState([]);
  const [isTermQuestion, setIsTermQuestion] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getRandomQuestionType = () => {
    const random = Math.random() * 100;
    if (random < QUESTION_TYPES.MULTIPLE_CHOICE.probability) {
      return QUESTION_TYPES.MULTIPLE_CHOICE.type;
    }
    if (random < QUESTION_TYPES.MULTIPLE_CHOICE.probability + QUESTION_TYPES.TRUE_FALSE.probability) {
      return QUESTION_TYPES.TRUE_FALSE.type;
    }
    return QUESTION_TYPES.WRITTEN.type;
  };

  const getAlternativeContent = (currentDeck, currentCard, isDefinition = true) => {
    if (!currentDeck?.cards?.length || !currentCard) {
      console.error('Missing deck or card data for alternative content');
      return '';
    }

    const otherCards = currentDeck.cards.filter(c => c.id !== currentCard.id);
    if (!otherCards.length) {
      console.error('No other cards available for alternatives');
      return isDefinition ? currentCard.definition : currentCard.term;
    }

    const randomCard = otherCards[Math.floor(Math.random() * otherCards.length)];
    return isDefinition ? randomCard.definition : randomCard.term;
  };

  const calculateProgress = (cards) => {
    const totalCards = cards.length;
    
    // Count unique card IDs in each state
    const learned = cards.filter(c => c.learned && !c.mastered).length;
    const mastered = cards.filter(c => c.mastered).length;
    const unfamiliar = totalCards - learned - mastered;
  
    return {
      learned: (learned / totalCards) * 100,
      mastered: (mastered / totalCards) * 100,
      unfamiliar: (unfamiliar / totalCards) * 100,
      counts: {
        learned,
        mastered,
        unfamiliar
      }
    };
  };

  const saveProgress = async (updatedDeck) => {
    if (!updatedDeck) return;
  
    try {
      // Calculate current card counts
      const currentProgress = {
        learned: updatedDeck.cards.filter(c => c.learned && !c.mastered).length,
        mastered: updatedDeck.cards.filter(c => c.mastered).length,
        unfamiliar: updatedDeck.cards.filter(c => !c.learned && !c.mastered).length
      };
  
      // Backend save
      const token = localStorage.getItem('access_token');
      await fetch(`http://localhost:5000/flashcards/decks/${params.deckId}/progress`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          progress: currentProgress
        })
      });
  
      setProgress({
        learned: (currentProgress.learned / updatedDeck.cards.length) * 100,
        mastered: (currentProgress.mastered / updatedDeck.cards.length) * 100,
        unfamiliar: (currentProgress.unfamiliar / updatedDeck.cards.length) * 100
      });
      setDeck({...updatedDeck, progress: currentProgress});
  
    } catch (error) {
      console.error('Error saving progress:', error);
      setError('Failed to save progress');
    }
  };

  const resetProgress = () => {
    if (!deck) return;
  
    const updatedDeck = { ...deck };
    updatedDeck.cards = updatedDeck.cards.map(card => ({
      ...card,
      learned: false,
      mastered: false,
      consecutiveCorrect: 0,
      wrongStreak: 0
    }));
  
    updatedDeck.progress = {
      learned: 0,
      mastered: 0,
      unfamiliar: updatedDeck.cards.length
    };
  
    saveProgress(updatedDeck); // Ensure this updates localStorage and state
    setProgress({ learned: 0, mastered: 0, unfamiliar: 100 });
    console.log('Progress reset successfully');
  };
  

  const handleAnswer = (isCorrect) => {
    if (!deck || !currentCard) return;
  
    const updatedDeck = { ...deck };
    const cardIndex = updatedDeck.cards.findIndex(c => c.id === currentCard.id);
    const card = updatedDeck.cards[cardIndex];
  
    if (isCorrect) {
      // Reset wrong streak on correct answer
      card.wrongStreak = 0;
      
      if (card.mastered) {
        card.consecutiveCorrect = Math.min((card.consecutiveCorrect || 0) + 1, 2);
      } else if (card.learned) {
        card.consecutiveCorrect = (card.consecutiveCorrect || 0) + 1;
        if (card.consecutiveCorrect >= 3) {
          card.mastered = true;
          // Keep learned status when mastering
          card.learned = true;
        }
      } else {
        card.learned = true;
        card.consecutiveCorrect = 1;
      }
    } else {
      card.consecutiveCorrect = 0;
      card.wrongStreak = (card.wrongStreak || 0) + 1;
  
      if (card.wrongStreak >= 2) {
        if (card.mastered) {
          card.mastered = false;
          // Demote to learned
          card.learned = true;
        } else if (card.learned) {
          card.learned = false;
        }
      }
    }
  
    saveProgress(updatedDeck);
    selectNextCard(updatedDeck);
  };

  const selectNextCard = (currentDeck) => {
    if (!currentDeck?.cards?.length) return;

    try {
      const unfamiliarCards = currentDeck.cards.filter(card => 
        !card.learned && !card.mastered
      );
      const learnedCards = currentDeck.cards.filter(card => 
        card.learned && !card.mastered
      );
      const masteredCards = currentDeck.cards.filter(card => 
        card.mastered
      );
      
      let availableCards = unfamiliarCards.length > 0 
        ? unfamiliarCards 
        : learnedCards.length > 0 
          ? learnedCards 
          : masteredCards;

      if (currentCard && availableCards.length > 1) {
        availableCards = availableCards.filter(card => card.id !== currentCard.id);
      }

      const selectedCard = availableCards[Math.floor(Math.random() * availableCards.length)];
      const type = getRandomQuestionType();
      const showTerm = Math.random() >= 0.5;
      
      setQuestionType(type);
      setIsTermQuestion(showTerm);

      if (type === QUESTION_TYPES.MULTIPLE_CHOICE.type) {
        const otherCards = currentDeck.cards.filter(c => c.id !== selectedCard.id);
        const answersFromOtherCards = shuffle(otherCards)
          .slice(0, 3)
          .map(c => showTerm ? c.definition : c.term);
          
        setDistractors(answersFromOtherCards);
      }

      setCurrentCard(selectedCard);
    } catch (error) {
      console.error('Error selecting next card:', error);
      setError('Failed to select next card');
    }
  };

  const loadDeck = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:5000/flashcards/decks/${params.deckId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
  
      if (!response.ok) {
        throw new Error('Failed to load deck');
      }
  
      const currentDeck = await response.json();
  
      currentDeck.cards = currentDeck.cards.map(card => ({
        ...card,
        learned: card.learned || false,
        mastered: card.mastered || false,
        consecutiveCorrect: card.consecutiveCorrect || 0,
        wrongStreak: card.wrongStreak || 0
      }));
  
      const newProgress = calculateProgress(currentDeck.cards);
      setProgress({
        learned: newProgress.learned,
        mastered: newProgress.mastered,
        unfamiliar: newProgress.unfamiliar
      });
  
      setDeck(currentDeck);
      selectNextCard(currentDeck);
    } catch (error) {
      console.error('Error loading deck:', error);
      setError('Failed to load deck');
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    loadDeck();
  }, [params.deckId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">{error}</p>
          <button
            onClick={() => router.push(`/test/${deckId}`)}
            className="text-blue-500 hover:underline"
          >
            Return to Test Page
          </button>
        </div>
      </div>
    );
  }

  if (!deck || !currentCard) return null;

  const commonProps = {
    term: isTermQuestion ? currentCard.term : currentCard.definition,
    correctAnswer: isTermQuestion ? currentCard.definition : currentCard.term,
    onAnswer: handleAnswer,
    progress,
    deckTitle: deck.title,
    isTermQuestion
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
    <div className="flex justify-center items-center">
      {questionType === QUESTION_TYPES.MULTIPLE_CHOICE.type && (
        <QuestionMultipleChoice
          {...commonProps}
          distractors={distractors}
        />
      )}
      
      {questionType === QUESTION_TYPES.TRUE_FALSE.type && (
        <QuestionTrueFalse
          {...commonProps}
          term={currentCard.term}
          definition={currentCard.definition}
          alternativeContent={getAlternativeContent(deck, currentCard, isTermQuestion)}
          isCorrectPair={Math.random() >= 0.5}
        />
      )}
      
      {questionType === QUESTION_TYPES.WRITTEN.type && (
        <QuestionWritten {...commonProps} />
      )}
  
        <button
          onClick={() => {
            if (deck) {
              saveProgress(deck);
            }
            router.push('/test');
          }}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-200 transition-colors">
          <X size={24} />
        </button>
    </div>
  
    {/* Clear Progress Button */}
    <button
      onClick={resetProgress}
      className="fixed bottom-6 right-6 p-3 bg-gray-100 text-gray-700 rounded shadow hover:bg-gray-200 transition-all"
    >
      Clear Progress
    </button>
  
    {/* Progress Bar */}
    <div className="fixed bottom-0 left-0 w-full h-2">
      <div className="relative w-full h-full bg-gray-200">
        {/* Mastered Progress (Green) */}
        <div
          className="absolute h-full bg-[#61cc03] transition-all duration-300"
          style={{ width: `${progress.mastered}%` }}
        />
        {/* Learned Progress (Blue) */}
        <div
          className="absolute h-full bg-blue-400 transition-all duration-300"
          style={{ width: `${progress.learned}%` }}
        />
      </div>
    </div>
  </div>     
  );
};

export default DynamicTestPage;
