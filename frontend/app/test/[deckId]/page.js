// app/test/[testId]/page.js

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { shuffle } from 'lodash';
import { X } from 'lucide-react';
import QuestionMultipleChoice from '../../components/QuestionMultipleChoice';
import QuestionTrueFalse from '../../components/QuestionTrueFalse';
import QuestionWritten from '../../components/QuestionWritten';
import ProgressBar from '../../components/ProgressBar';

// SaveModal Component
const SaveModal = ({ isOpen, onClose, status, error }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-sm w-full mx-4">
        <div className="text-center">
          {status === 'saving' && (
            <div className="mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2">Saving progress...</p>
            </div>
          )}
          {status === 'success' && (
            <div className="mb-4">
              <div className="text-green-500 text-4xl mb-2">✓</div>
              <p>Progress saved successfully!</p>
            </div>
          )}
          {status === 'error' && (
            <div className="mb-4">
              <div className="text-red-500 text-4xl mb-2">⚠</div>
              <p>Error saving progress</p>
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {status === 'error' ? 'Try Again' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Constants for question type probabilities
const QUESTION_TYPES = {
  MULTIPLE_CHOICE: { type: 'multiple-choice', probability: 45 },
  TRUE_FALSE: { type: 'true-false', probability: 35 },
  WRITTEN: { type: 'written', probability: 20 },
};

const STREAK_THRESHOLDS = {
  MASTERY: 3,
  LEARNED: 1,
  DEMOTION: -2,
};

const DynamicTestPage = () => {
  const params = useParams();
  const router = useRouter();
  const [deck, setDeck] = useState(null);
  const [currentCard, setCurrentCard] = useState(null);
  const [questionType, setQuestionType] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [saveError, setSaveError] = useState('');
  const [progress, setProgress] = useState({
    learned: 0,
    mastered: 0,
    unfamiliar: 0,
  });
  const [cardStates, setCardStates] = useState(new Map());
  const [distractors, setDistractors] = useState([]);
  const [isTermQuestion, setIsTermQuestion] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Utility function to get random question type based on probabilities
  const getRandomQuestionType = () => {
    const random = Math.random() * 100;
    if (random < QUESTION_TYPES.MULTIPLE_CHOICE.probability) {
      return QUESTION_TYPES.MULTIPLE_CHOICE.type;
    }
    if (
      random <
      QUESTION_TYPES.MULTIPLE_CHOICE.probability +
        QUESTION_TYPES.TRUE_FALSE.probability
    ) {
      return QUESTION_TYPES.TRUE_FALSE.type;
    }
    return QUESTION_TYPES.WRITTEN.type;
  };

  // Get alternative content for True/False questions
  const getAlternativeContent = (
    currentDeck,
    currentCard,
    isDefinition = true
  ) => {
    if (!currentDeck?.cards?.length || !currentCard) {
      console.error('Missing deck or card data for alternative content');
      return '';
    }

    const otherCards = currentDeck.cards.filter((c) => c.id !== currentCard.id);
    if (!otherCards.length) {
      console.error('No other cards available for alternatives');
      return isDefinition ? currentCard.definition : currentCard.term;
    }

    const randomCard =
      otherCards[Math.floor(Math.random() * otherCards.length)];
    return isDefinition ? randomCard.definition : randomCard.term;
  };

  // Calculate progress based on card states
  const calculateProgress = (cards) => {
    const totalCards = cards.length;
    const learned = cards.filter((c) => c.learned && !c.mastered).length;
    const mastered = cards.filter((c) => c.mastered).length;
    const unfamiliar = totalCards - learned - mastered;

    return {
      learned: (learned / totalCards) * 100,
      mastered: (mastered / totalCards) * 100,
      unfamiliar: (unfamiliar / totalCards) * 100,
      counts: {
        learned,
        mastered,
        unfamiliar,
      },
    };
  };

  // Save all progress to the server
  const saveAllProgress = async () => {
    try {
      if (!deck) return { success: false, error: 'No deck data' };

      const states = Array.from(cardStates.entries());
      const currentProgress = {
        learned: states
          .filter(([_, state]) => state.status === 'learned')
          .map(([index]) => index),
        mastered: states
          .filter(([_, state]) => state.status === 'mastered')
          .map(([index]) => index),
        unfamiliar: states
          .filter(([_, state]) => state.status === 'unfamiliar')
          .map(([index]) => index),
      };

      console.log('Preparing to save progress:', currentProgress);

      const cardStatesObj = {};
      cardStates.forEach((state, index) => {
        cardStatesObj[index] = {
          streak: state.streak,
          status: state.status,
          lastAnswered: state.lastAnswered,
        };
      });

      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `http://localhost:5000/flashcards/decks/${params.deckId}/progress`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            progress: currentProgress,
            cardStates: cardStatesObj,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        console.error('Error saving progress:', error);
        return { success: false, error: error.message || 'Failed to save progress' };
      }

      console.log('Progress saved successfully');
      return { success: true };
    } catch (error) {
      console.error('Error in saveAllProgress:', error);
      return { success: false, error: error.message };
    }
  };

  // Save progress and update UI accordingly
  const saveProgress = async (updatedDeck) => {
    if (!updatedDeck) return;

    try {
      setSaveStatus('saving');
      setShowSaveModal(true);

      const states = Array.from(cardStates.entries());
      const currentProgress = {
        learned: states
          .filter(([_, state]) => state.status === 'learned')
          .map(([index]) => index),
        mastered: states
          .filter(([_, state]) => state.status === 'mastered')
          .map(([index]) => index),
        unfamiliar: states
          .filter(([_, state]) => state.status === 'unfamiliar')
          .map(([index]) => index),
      };

      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `http://localhost:5000/flashcards/decks/${params.deckId}/progress`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            progress: currentProgress,
            cardStates: Object.fromEntries(cardStates),
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save progress');
      }

      const totalCards = updatedDeck.cards.length;
      setProgress({
        learned: (currentProgress.learned.length / totalCards) * 100,
        mastered: (currentProgress.mastered.length / totalCards) * 100,
        unfamiliar: (currentProgress.unfamiliar.length / totalCards) * 100,
      });

      setDeck({ ...updatedDeck });
      setSaveStatus('success');

      // Auto-close success message after 1.5 seconds
      setTimeout(() => {
        setShowSaveModal(false);
      }, 1500);
    } catch (error) {
      console.error('Error saving progress:', error);
      setSaveStatus('error');
      setSaveError(error.message);
    }
  };

  // Reset all progress
  const resetProgress = () => {
    if (!deck) return;

    const updatedDeck = { ...deck };
    updatedDeck.cards = updatedDeck.cards.map((card) => ({
      ...card,
      learned: false,
      mastered: false,
      consecutiveCorrect: 0,
      wrongStreak: 0,
    }));

    // Reset cardStates
    const initialCardStates = new Map();
    updatedDeck.cards.forEach((_, index) => {
      initialCardStates.set(index, {
        streak: 0,
        status: 'unfamiliar',
        lastAnswered: null,
      });
    });
    setCardStates(initialCardStates);

    updatedDeck.progress = {
      learned: 0,
      mastered: 0,
      unfamiliar: updatedDeck.cards.length,
    };

    saveProgress(updatedDeck);
    setProgress({ learned: 0, mastered: 0, unfamiliar: 100 });
    console.log('Progress reset successfully');
  };

  // Handle user's answer
  const handleAnswer = (isCorrect) => {
    if (!deck || !currentCard) return;

    const cardIndex = deck.cards.findIndex((c) => c.id === currentCard.id);
    setCardStates((prevStates) => {
      const newStates = new Map(prevStates);
      const currentState =
        newStates.get(cardIndex) || {
          streak: 0,
          status: 'unfamiliar',
          lastAnswered: null,
        };

      let newStreak = isCorrect
        ? currentState.streak + 1
        : currentState.streak - 1;
      let newStatus = currentState.status;

      if (
        newStreak >= STREAK_THRESHOLDS.MASTERY &&
        newStatus === 'learned'
      ) {
        newStatus = 'mastered';
      } else if (
        newStreak >= STREAK_THRESHOLDS.LEARNED &&
        newStatus === 'unfamiliar'
      ) {
        newStatus = 'learned';
      } else if (newStreak <= STREAK_THRESHOLDS.DEMOTION) {
        newStatus =
          newStatus === 'mastered' ? 'learned' : 'unfamiliar';
        newStreak = 0;
      }

      newStates.set(cardIndex, {
        streak: newStreak,
        status: newStatus,
        lastAnswered: new Date(),
      });

      // Update deck
      const updatedDeck = { ...deck };
      updatedDeck.cards = updatedDeck.cards.map((card, index) => {
        if (index === cardIndex) {
          return {
            ...card,
            learned: newStatus === 'learned' || newStatus === 'mastered',
            mastered: newStatus === 'mastered',
            consecutiveCorrect: newStreak,
          };
        }
        return card;
      });

      // Save progress and select next card using the updated deck
      saveProgress(updatedDeck);
      selectNextCard(updatedDeck);

      return newStates;
    });
  };

  // Select the next card to display
  const selectNextCard = (currentDeck) => {
    if (!currentDeck?.cards?.length) return;

    try {
      const unfamiliarCards = currentDeck.cards.filter(
        (card) => !card.learned && !card.mastered
      );
      const learnedCards = currentDeck.cards.filter(
        (card) => card.learned && !card.mastered
      );
      const masteredCards = currentDeck.cards.filter(
        (card) => card.mastered
      );

      let availableCards =
        unfamiliarCards.length > 0
          ? unfamiliarCards
          : learnedCards.length > 0
          ? learnedCards
          : masteredCards;

      if (currentCard && availableCards.length > 1) {
        availableCards = availableCards.filter(
          (card) => card.id !== currentCard.id
        );
      }

      if (availableCards.length === 0) {
        setError('No available cards to display.');
        return;
      }

      const selectedCard =
        availableCards[Math.floor(Math.random() * availableCards.length)];
      const type = getRandomQuestionType();
      const showTerm = Math.random() >= 0.5;

      setQuestionType(type);
      setIsTermQuestion(showTerm);

      if (type === QUESTION_TYPES.MULTIPLE_CHOICE.type) {
        const otherCards = currentDeck.cards.filter(
          (c) => c.id !== selectedCard.id
        );
        const answersFromOtherCards = shuffle(otherCards)
          .slice(0, 3)
          .map((c) =>
            showTerm ? c.definition : c.term
          );

        setDistractors(answersFromOtherCards);
      }

      setCurrentCard(selectedCard);
    } catch (error) {
      console.error('Error selecting next card:', error);
      setError('Failed to select next card');
    }
  };

  // Load deck data, utilizing localStorage for caching
  const loadDeck = async () => {
    try {
      setLoading(true);
      const cachedDeck = localStorage.getItem(`deck_${params.deckId}`);

      if (cachedDeck) {
        const currentDeck = JSON.parse(cachedDeck);
        initializeDeck(currentDeck);
      } else {
        const token = localStorage.getItem('access_token');
        const response = await fetch(
          `http://localhost:5000/flashcards/decks/${params.deckId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) {
          const error = await response.json();
          console.error('Failed to load deck:', error);
          setError(error.message || 'Failed to load deck');
          return;
        }

        const currentDeck = await response.json();
        currentDeck.cards = currentDeck.cards.map((card) => ({
          ...card,
          learned: card.learned || false,
          mastered: card.mastered || false,
          consecutiveCorrect: card.consecutiveCorrect || 0,
          wrongStreak: card.wrongStreak || 0,
        }));

        localStorage.setItem(
          `deck_${params.deckId}`,
          JSON.stringify(currentDeck)
        );
        initializeDeck(currentDeck);
      }
    } catch (error) {
      console.error('Error loading deck:', error);
      setError('Failed to load deck');
    } finally {
      setLoading(false);
    }
  };

  // Initialize deck and related states
  const initializeDeck = (currentDeck) => {
    const initialCardStates = new Map();
    currentDeck.cards.forEach((card, index) => {
      const status = card.mastered
        ? 'mastered'
        : card.learned
        ? 'learned'
        : 'unfamiliar';
      initialCardStates.set(index, {
        streak: card.consecutiveCorrect || 0,
        status,
        lastAnswered: null,
      });
    });

    setCardStates(initialCardStates);
    const newProgress = calculateProgress(currentDeck.cards);
    setProgress({
      learned: newProgress.learned,
      mastered: newProgress.mastered,
      unfamiliar: newProgress.unfamiliar,
    });

    setDeck(currentDeck);
    selectNextCard(currentDeck);
  };

  // Handle manual "Learn" action (if applicable)
  const handleLearn = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `http://localhost:5000/flashcards/decks/${params.deckId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        console.error('Failed to fetch deck progress:', error);
        return;
      }

      const updatedDeck = await response.json();
      console.log('Fetched deck progress:', updatedDeck);

      // Update the deck state with the latest progress
      updatedDeck.cards = updatedDeck.cards.map((card) => ({
        ...card,
        learned: card.learned || false,
        mastered: card.mastered || false,
        consecutiveCorrect: card.consecutiveCorrect || 0,
        wrongStreak: card.wrongStreak || 0,
      }));

      setDeck(updatedDeck);

      // Recalculate and update progress
      const totalCards = updatedDeck.cards.length;
      const learned = updatedDeck.cards.filter(
        (c) => c.learned && !c.mastered
      ).length;
      const mastered = updatedDeck.cards.filter(
        (c) => c.mastered
      ).length;

      setProgress({
        learned: (learned / totalCards) * 100,
        mastered: (mastered / totalCards) * 100,
        unfamiliar:
          ((totalCards - (learned + mastered)) / totalCards) * 100,
      });

      // Navigate to the learning screen
      router.push(`/test/${params.deckId}`);
    } catch (error) {
      console.error('Error in handleLearn:', error);
    }
  };

  // Load deck on component mount or when deckId changes
  useEffect(() => {
    loadDeck();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.deckId]);

  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  // Render error state
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

  // If deck or currentCard is not available, render nothing
  if (!deck || !currentCard) return null;

  // Common props for question components
  const commonProps = {
    term: isTermQuestion ? currentCard.term : currentCard.definition,
    correctAnswer: isTermQuestion ? currentCard.definition : currentCard.term,
    onAnswer: handleAnswer,
    progress: {
      totalCards: deck.cards.length,
      learnedCount: Array.from(cardStates.values()).filter(
        (state) => state.status === 'learned'
      ).length,
      masteredCount: Array.from(cardStates.values()).filter(
        (state) => state.status === 'mastered'
      ).length,
    },
    deckTitle: deck.title,
    isTermQuestion,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex justify-center items-center relative">
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
            alternativeContent={getAlternativeContent(
              deck,
              currentCard,
              isTermQuestion
            )}
            isCorrectPair={Math.random() >= 0.5}
          />
        )}

        {questionType === QUESTION_TYPES.WRITTEN.type && (
          <QuestionWritten {...commonProps} />
        )}

        {/* Save Progress Button */}
        <button
          onClick={async () => {
            setShowSaveModal(true);
            setSaveStatus('saving');

            const result = await saveAllProgress();

            if (result.success) {
              setSaveStatus('success');
              // Wait for 1 second to show success message
              setTimeout(() => {
                setShowSaveModal(false);
                router.push('/test');
              }, 1000);
            } else {
              setSaveStatus('error');
              setSaveError(result.error || 'Failed to save progress');
            }
          }}
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
      <ProgressBar
        totalCards={deck.cards.length}
        learnedCount={
          cardStates
            ? Array.from(cardStates.values()).filter(
                (state) => state.status === 'learned'
              ).length
            : 0
        }
        masteredCount={
          cardStates
            ? Array.from(cardStates.values()).filter(
                (state) => state.status === 'mastered'
              ).length
            : 0
        }
        className="fixed bottom-0 left-0 w-full"
        showLabels={false}
      />

      {/* Save Modal */}
      <SaveModal
        isOpen={showSaveModal}
        onClose={() => {
          if (saveStatus === 'success') {
            router.push('/test');
          }
          setShowSaveModal(false);
        }}
        status={saveStatus}
        error={saveError}
      />
    </div>
  );
};

export default DynamicTestPage;
