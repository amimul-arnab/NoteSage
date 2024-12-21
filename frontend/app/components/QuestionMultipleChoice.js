import { useState } from 'react';
import { shuffle } from 'lodash';
import ProgressBar from './ProgressBar';
import withProgressTracking from './withProgressTracking';

const QuestionMultipleChoice = ({ 
  term,  // This will be the question (term or definition)
  correctAnswer, // This will be the correct answer (definition if term is question, vice versa)
  distractors, // These should match the type of correctAnswer
  onAnswer,
  progress: { totalCards, learnedCount, masteredCount },
  deckTitle,
  isTermQuestion // indicates if term is the question (true) or answer (false)
}) => {
  const [selected, setSelected] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [options] = useState(() => 
    shuffle([
      { text: correctAnswer, isCorrect: true },
      ...distractors.map(d => ({ text: d, isCorrect: false }))
    ])
  );

  // Validation check
  if (!term || !correctAnswer || !distractors?.length) {
    console.error('Missing required props:', { term, correctAnswer, distractors });
    return null;
  }

  const handleSelect = (option) => {
    if (showFeedback) return;
    
    setSelected(option);
    setShowFeedback(true);
    
    // Delay to show feedback
    setTimeout(() => {
      onAnswer(option.isCorrect);
      setSelected(null);
      setShowFeedback(false);
    }, 1500);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">{deckTitle}</h1>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-center mb-2">Choose the correct answer</h2>
        <div className="text-xl text-center p-6 bg-gray-50 rounded-lg">
          {term}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {options.map((option, index) => {
          const isSelected = selected === option;
          const showCorrect = showFeedback && option.isCorrect;
          const showIncorrect = showFeedback && isSelected && !option.isCorrect;

          return (
            <button
              key={index}
              onClick={() => handleSelect(option)}
              disabled={showFeedback}
              className={`
                p-4 rounded-lg text-left transition-all relative
                ${!showFeedback ? 'hover:bg-gray-50 active:bg-gray-100' : ''}
                ${showCorrect ? 'bg-green-100 border-green-500 border-2' : ''}
                ${showIncorrect ? 'bg-red-100 border-red-500 border-2' : ''}
                ${isSelected && !showFeedback ? 'border-blue-500 border-2' : ''}
                ${!isSelected && !showFeedback ? 'border border-gray-200' : ''}
              `}
            >
              <div className="flex items-start">
                <span className="font-medium mr-2">
                  {String.fromCharCode(65 + index)})
                </span>
                <span className="flex-1">{option.text}</span>
              </div>

              {/* Feedback icons */}
              {showFeedback && (option.isCorrect || isSelected) && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  {option.isCorrect ? (
                    <span className="text-green-500 text-xl">✓</span>
                  ) : (
                    isSelected && <span className="text-red-500 text-xl">✗</span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* New Progress Bar */}
      <ProgressBar
        totalCards={totalCards}
        learnedCount={learnedCount}
        masteredCount={masteredCount}
        className="mt-8"
        showLabels={false}
      />
    </div>
  );
};

export default withProgressTracking(QuestionMultipleChoice);