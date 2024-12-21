import React, { memo } from 'react';
import ProgressBar from './ProgressBar';

const TestUI = memo(({ deck, onLearn }) => {
  if (!deck || !deck.cards || deck.cards.length === 0) {
    return (
      <div className="text-center">
        <p className="text-lg text-gray-500">No cards available in this deck.</p>
      </div>
    );
  }

  const {
    title = 'Untitled Deck',
    description = 'No description available',
    underglowColor,
    cards = [],
  } = deck;

  // Calculate progress counts
  const totalCards = cards.length;
  const progressCounts = deck.progress_counts || {
    learned: 0,
    mastered: 0,
    unfamiliar: totalCards,
    total: totalCards
  };

  // Calculate percentages for progress bar
  const progress = {
    learned: Math.round((progressCounts.learned / totalCards) * 100) || 0,
    mastered: Math.round((progressCounts.mastered / totalCards) * 100) || 0,
    unfamiliar: Math.round((progressCounts.unfamiliar / totalCards) * 100) || 0
  };

  return (
    <div
      className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
      style={{
        boxShadow: underglowColor ? `0 4px 20px ${underglowColor}` : undefined,
      }}
    >
      <div className="mb-4">
        <h3 className="text-2xl font-bold mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>

      <div className="space-y-4">
        <div>
          <ProgressBar
            totalCards={totalCards}
            learnedCount={progressCounts.learned}
            masteredCount={progressCounts.mastered}
            className="mb-4"
          />

          {/* Progress Stats */}
          <div className="grid grid-cols-3 gap-2 text-center mt-4">
            <div className="bg-[#61cc03] bg-opacity-10 rounded-lg p-3">
              <p className="text-xl font-bold text-[#61cc03]">
                {progressCounts.mastered}
                <span className="text-sm text-gray-500">/{totalCards}</span>
              </p>
              <p className="text-sm text-gray-600">Mastered</p>
            </div>
            <div className="bg-blue-100 rounded-lg p-3">
              <p className="text-xl font-bold text-blue-500">
                {progressCounts.learned}
                <span className="text-sm text-gray-500">/{totalCards}</span>
              </p>
              <p className="text-sm text-gray-600">Learning</p>
            </div>
            <div className="bg-gray-100 rounded-lg p-3">
              <p className="text-xl font-bold text-gray-500">
                {progressCounts.unfamiliar}
                <span className="text-sm text-gray-500">/{totalCards}</span>
              </p>
              <p className="text-sm text-gray-600">New</p>
            </div>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-2">
            Overall Progress: {Math.round((progressCounts.mastered + progressCounts.learned) / totalCards * 100)}%
          </p>
        </div>

        {/* Learn Button */}
        <button
          onClick={onLearn}
          className="w-full bg-[#61cc03] text-white py-3 rounded-lg hover:bg-[#52ab02] transition-colors mt-6"
        >
          {progressCounts.mastered === totalCards ? 'Review Mastered' : 'Continue Learning'}
        </button>
      </div>
    </div>
  );
});

TestUI.displayName = 'TestUI';

export default TestUI;