import React, { memo } from 'react';

const TestUI = memo(({ deck, onLearn }) => {
  const { title, description, progress, underglowColor } = deck;
  const totalCards = deck.cards.length;
  
  // Calculate percentages for progress bars
  const masteredPercentage = (progress.mastered / totalCards) * 100;
  const learnedPercentage = (progress.learned / totalCards) * 100;
  
  return (
    <div 
      className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
      style={{
        boxShadow: underglowColor ? `0 4px 20px ${underglowColor}` : undefined
      }}
    >
      <div className="mb-4">
        <h3 className="text-2xl font-bold mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-gray-600">{masteredPercentage.toFixed(0)}% Mastered</span>
          </div>
          {/* Progress Bar */}
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="relative w-full h-full">
              {/* Mastered Progress (Green) */}
              <div 
                className="absolute top-0 left-0 h-full bg-[#61cc03] transition-all duration-300"
                style={{ width: `${masteredPercentage}%` }}
              />
              {/* Learned Progress (Blue) */}
              <div 
                className="absolute top-0 left-0 h-full bg-blue-400 transition-all duration-300"
                style={{ width: `${learnedPercentage}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-xl font-bold text-[#61cc03]">{progress.mastered}</p>
            <p className="text-sm text-gray-600">Mastered</p>
          </div>
          <div>
            <p className="text-xl font-bold text-blue-400">{progress.learned}</p>
            <p className="text-sm text-gray-600">Learned</p>
          </div>
          <div>
            <p className="text-xl font-bold text-gray-400">{progress.unfamiliar}</p>
            <p className="text-sm text-gray-600">Unfamiliar</p>
          </div>
        </div>

        <button
          onClick={onLearn}
          className="w-full bg-[#61cc03] text-white py-3 rounded-lg hover:bg-[#52ab02] transition-colors"
        >
          Learn
        </button>
      </div>
    </div>
  );
});

TestUI.displayName = 'TestUI';

export default TestUI;