"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import FlashcardView from '../../../components/FlashcardView';

export default function DeckViewPage() {
    const params = useParams();
    const router = useRouter();
    const [deck, setDeck] = useState(null);
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

    useEffect(() => {
      if (!token) {
        router.push('/login');
        return;
      }
    
      const { deckId } = params;
    
      if (deckId) {
        fetch(`http://localhost:5000/flashcards/decks/${deckId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => {
          if (!res.ok) {
            if (res.status === 404) {
              router.push('/flashcards');
            }
            throw new Error(`HTTP error ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          setDeck(data);
        })
        .catch(error => {
          console.error('Error fetching deck:', error);
          router.push('/flashcards');
        });
      }
    }, [params.deckId, token, router]);

    if (!deck) return <div>Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <FlashcardView
                cards={deck.cards || []}
                title={deck.title}
                description={deck.description}
                underglowColor={deck.underglowColor}
            />
        </div>
    );
}