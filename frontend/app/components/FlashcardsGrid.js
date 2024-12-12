import React from 'react';
import DeckCard from './DeckCard';

const FlashcardsGrid = ({ decks = [] }) => {
  if (!decks?.length) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-xl text-gray-600">No decks created yet. Start by creating one!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {decks.map((deck) => (
        <DeckCard key={deck._id} {...deck} />
      ))}
    </div>
  );
};

export default FlashcardsGrid;