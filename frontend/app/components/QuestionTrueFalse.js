import { useState } from 'react';

const QuestionTrueFalse = ({ 
  term, 
  definition,
  alternativeContent,
  isTermQuestion,
  isCorrectPair, 
  onAnswer,
  progress,
  deckTitle 
}) => {
  const [selected, setSelected] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  // Ensure we have all required content
  if (!term || !definition || !alternativeContent) {
    console.error('Missing required content:', { term, definition, alternativeContent });
    return null;
  }

  // Determine which content to display based on isTermQuestion and isCorrectPair
  const questionContent = isTermQuestion ? term : definition;
  const answerContent = isCorrectPair 
    ? (isTermQuestion ? definition : term)
    : alternativeContent;

  const handleSelect = (answer) => {
    if (showFeedback) return;
    
    setSelected(answer);
    setShowFeedback(true);
    
    const isCorrect = answer === isCorrectPair;
    
    setTimeout(() => {
      onAnswer(isCorrect);
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

      <h2 className="text-2xl font-bold text-center mb-6">
        Choose if this is true or false
      </h2>
      
      <div className="space-y-6 mb-8">
        {/* Question Content */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg text-gray-600 mb-2">
            {isTermQuestion ? 'Term' : 'Definition'}
          </h3>
          <div className="text-2xl">
            {questionContent}
          </div>
        </div>

        {/* Answer Content */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg text-gray-600 mb-2">
            {isTermQuestion ? 'Definition' : 'Term'}
          </h3>
          <div className="text-xl">
            {answerContent}
          </div>
        </div>
      </div>

      {/* True/False Buttons */}
      <div className="grid grid-cols-2 gap-4">
        {['TRUE', 'FALSE'].map((option) => {
          const isSelected = selected === (option === 'TRUE');
          const showCorrect = showFeedback && (option === 'TRUE') === isCorrectPair;
          const showIncorrect = showFeedback && isSelected && (option === 'TRUE') !== isCorrectPair;

          return (
            <button
              key={option}
              onClick={() => handleSelect(option === 'TRUE')}
              disabled={showFeedback}
              className={`
                p-4 rounded-lg text-center transition-all font-medium text-lg
                ${!showFeedback ? 'hover:bg-gray-50 active:bg-gray-100' : ''}
                ${showCorrect ? 'bg-green-100 border-green-500 border-2' : ''}
                ${showIncorrect ? 'bg-red-100 border-red-500 border-2' : ''}
                ${isSelected && !showFeedback ? 'border-blue-500 border-2' : ''}
                ${!isSelected && !showFeedback ? 'border border-gray-200' : ''}
              `}
            >
              {option}
            </button>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="mt-8">
        <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          {/* Mastered Progress (Green) */}
          <div
            className="absolute h-full bg-[#61cc03] transition-all duration-300"
            style={{ width: `${progress?.mastered || 0}%` }}
          />
          {/* Learned Progress (Blue) */}
          <div
            className="absolute h-full bg-blue-400 transition-all duration-300"
            style={{ width: `${progress?.learned || 0}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default QuestionTrueFalse;