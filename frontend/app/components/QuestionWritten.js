import { useState } from 'react';
import ProgressBar from './ProgressBar';

const QuestionWritten = ({ 
  term, 
  correctAnswer, 
  onAnswer,
  progress: { totalCards, learnedCount, masteredCount }
}) => {
  const [input, setInput] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Levenshtein Distance algorithm for string similarity
  const calculateLevenshteinDistance = (str1, str2) => {
    const track = Array(str2.length + 1).fill(null).map(() =>
      Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) track[0][i] = i;
    for (let j = 0; j <= str2.length; j++) track[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        track[j][i] = Math.min(
          track[j][i - 1] + 1,
          track[j - 1][i] + 1,
          track[j - 1][i - 1] + indicator
        );
      }
    }
    
    return track[str2.length][str1.length];
  };

  // Calculate similarity percentage
  const calculateSimilarity = (input, answer) => {
    const s1 = input.toLowerCase().trim();
    const s2 = answer.toLowerCase().trim();
    
    if (s1 === s2) return 1;
    
    const maxLength = Math.max(s1.length, s2.length);
    if (maxLength === 0) return 1;
    
    const distance = calculateLevenshteinDistance(s1, s2);
    return 1 - (distance / maxLength);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (showFeedback || !input.trim()) return;

    const similarity = calculateSimilarity(input, correctAnswer);
    const correct = similarity >= 0.8; // 80% similarity threshold
    
    setIsCorrect(correct);
    setShowFeedback(true);

    setTimeout(() => {
      onAnswer(correct);
      setInput('');
      setShowFeedback(false);
      setIsCorrect(false);
    }, 1500);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-center mb-2">
          Write the correct answer
        </h2>
        <div className="text-center text-sm text-gray-500 mb-4">
          (case insensitive, typos allowed)
        </div>
        <div className="text-xl text-center p-4 bg-gray-50 rounded-lg">
          {term}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={showFeedback}
            placeholder="Type your answer here"
            className={`
              w-full p-4 rounded-lg border-2 transition-all duration-300
              ${showFeedback && isCorrect ? 'border-green-500 bg-green-50' : ''}
              ${showFeedback && !isCorrect ? 'border-red-500 bg-red-50' : ''}
              ${!showFeedback ? 'border-gray-200 focus:border-[#61cc03] focus:ring-1 focus:ring-[#61cc03]' : ''}
              outline-none
            `}
          />
          {showFeedback && (
            <div className={`
              absolute right-4 top-4 font-bold
              ${isCorrect ? 'text-green-500' : 'text-red-500'}
            `}>
              {isCorrect ? '✓' : '✗'}
            </div>
          )}
        </div>

        {showFeedback && !isCorrect && (
          <div className="text-center text-gray-600">
            Correct answer: {correctAnswer}
          </div>
        )}

        <button
          type="submit"
          disabled={!input.trim() || showFeedback}
          className={`
            w-full py-3 rounded-lg font-medium transition-all duration-300
            ${!input.trim() || showFeedback 
              ? 'bg-gray-300 cursor-not-allowed' 
              : 'bg-[#61cc03] hover:bg-[#52ab02] text-white'}
          `}
        >
          Submit Answer
        </button>
      </form>

      <ProgressBar
        totalCards={totalCards}
        learnedCount={learnedCount}
        masteredCount={masteredCount}
        className="mt-6"
        showLabels={false}
      />
    </div>
  );
};

export default QuestionWritten;