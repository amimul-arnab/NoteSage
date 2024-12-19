import React, { memo } from 'react';
import ProgressBar from './ProgressBar';

const TestUI = memo(({ deck, progress = { learned: 0, mastered: 0, unfamiliar: 0 }, onLearn }) => {
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
  } = deck;

  const totalCards = deck.cards.length || 1;

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
        <ProgressBar
          totalCards={totalCards}
          learnedCount={progress.learned}
          masteredCount={progress.mastered}
          className="mb-4"
        />

        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-xl font-bold text-[#61cc03]">{progress.mastered}/{totalCards}</p>
            <p className="text-sm text-gray-600">Mastered</p>
          </div>
          <div>
            <p className="text-xl font-bold text-blue-400">{progress.learned}/{totalCards}</p>
            <p className="text-sm text-gray-600">Learned</p>
          </div>
          <div>
            <p className="text-xl font-bold text-gray-400">{progress.unfamiliar}/{totalCards}</p>
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
