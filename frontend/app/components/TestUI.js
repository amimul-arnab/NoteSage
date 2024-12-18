import React, { memo } from 'react';

const TestUI = memo(({ deck, onLearn }) => {
  if (!deck) return null;
 
  const {
    title = 'Untitled Deck',
    description = 'No description available',
    cards = [],
    underglowColor,
  } = deck;
 
  const totalCards = cards.length || 1;
 
  const currentProgress = {
    mastered: cards.filter(c => c.mastered).length,
    learned: cards.filter(c => c.learned && !c.mastered).length,
    unfamiliar: totalCards - (cards.filter(c => c.mastered).length + cards.filter(c => c.learned && !c.mastered).length)
  };
 
  const masteredPercentage = (currentProgress.mastered / totalCards) * 100;
  const learnedPercentage = (currentProgress.learned / totalCards) * 100;
 
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
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-gray-600">{masteredPercentage.toFixed(0)}% Mastered</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="relative w-full h-full">
              <div
                className="absolute top-0 left-0 h-full bg-[#61cc03] transition-all duration-300"
                style={{ width: `${masteredPercentage}%` }}
              />
              <div
                className="absolute top-0 left-0 h-full bg-blue-400 transition-all duration-300"
                style={{ width: `${learnedPercentage}%` }}
              />
            </div>
          </div>
        </div>
 
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-xl font-bold text-[#61cc03]">{currentProgress.mastered}</p>
            <p className="text-sm text-gray-600">Mastered</p>
          </div>
          <div>
            <p className="text-xl font-bold text-blue-400">{currentProgress.learned}</p>
            <p className="text-sm text-gray-600">Learned</p>
          </div>
          <div>
            <p className="text-xl font-bold text-gray-400">{currentProgress.unfamiliar}</p>
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