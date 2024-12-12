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
    const learnedCount = cards.filter(c => c.learned && !c.mastered).length;
    const masteredCount = cards.filter(c => c.mastered).length;
    const unfamiliarCount = totalCards - learnedCount - masteredCount;

    return {
      learned: (learnedCount / totalCards) * 100,
      mastered: (masteredCount / totalCards) * 100,
      unfamiliar: (unfamiliarCount / totalCards) * 100,
      counts: {
        learned: learnedCount,
        mastered: masteredCount,
        unfamiliar: unfamiliarCount
      }
    };
  };

  const saveProgress = (updatedDeck) => {
    if (!updatedDeck) return;

    try {
      const decks = JSON.parse(localStorage.getItem('test-decks') || '[]');
      const deckIndex = decks.findIndex(d => d.id === updatedDeck.id);
      
      const newProgress = calculateProgress(updatedDeck.cards);
      updatedDeck.progress = newProgress.counts;
      
      decks[deckIndex] = updatedDeck;
      localStorage.setItem('test-decks', JSON.stringify(decks));
      
      setProgress({
        learned: newProgress.learned,
        mastered: newProgress.mastered,
        unfamiliar: newProgress.unfamiliar
      });
      setDeck(updatedDeck);
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
      card.wrongStreak = 0;

      if (card.mastered) {
        card.consecutiveCorrect = Math.min(card.consecutiveCorrect + 1, 2);
      } else if (card.learned) {
        card.consecutiveCorrect++;
        if (card.consecutiveCorrect >= 3) {
          card.mastered = true;
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
      const decks = JSON.parse(localStorage.getItem('test-decks') || '[]');
      const currentDeck = decks.find(d => d.id === params.deckId);
      
      if (!currentDeck) {
        router.push('/test');
        return;
      }

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
      saveProgress(currentDeck);
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
            onClick={() => router.push('/test')}
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
        onClick={() => router.push('/test')}
        className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-200 transition-colors"
      >
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
