'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import FlashcardView from '../../../components/FlashcardView';

export default function DeckViewPage() {
  const params = useParams();
  const router = useRouter();
  const [deck, setDeck] = useState(null);
  
  useEffect(() => {
    if (params.deckId) {
      const savedDecks = JSON.parse(localStorage.getItem('flashcards-decks') || '[]');
      const currentDeck = savedDecks.find(d => d.id === params.deckId);
      
      if (currentDeck) {
        setDeck(currentDeck);
      } else {
        router.push('/flashcards');
      }
    }
  }, [params.deckId]);

  if (!deck) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <FlashcardView
        cards={deck.cards}
        title={deck.title}
        description={deck.description}
        underglowColor={deck.underglowColor}
      />
    </div>
  );
}