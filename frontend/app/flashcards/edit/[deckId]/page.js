'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import FlashcardWizard from '../../../components/FlashcardWizard';

export default function EditDeckPage() {
  const router = useRouter();
  const params = useParams();
  const [deck, setDeck] = useState(null);

  useEffect(() => {
    if (params.deckId !== 'new') {
      // Load existing deck from localStorage
      const savedDecks = JSON.parse(localStorage.getItem('flashcards-decks') || '[]');
      const existingDeck = savedDecks.find(d => d.id === params.deckId);
      if (existingDeck) {
        setDeck(existingDeck);
      }
    }
  }, [params.deckId]);

  const handleSave = async (updatedDeck) => {
    try {
      // Get current decks from localStorage
      const savedDecks = JSON.parse(localStorage.getItem('flashcards-decks') || '[]');
      
      if (params.deckId === 'new') {
        // Creating new deck
        const newDeck = {
          ...updatedDeck,
          id: Date.now().toString(), // Generate unique ID
          createdAt: new Date().toISOString()
        };
        savedDecks.push(newDeck);
      } else {
        // Updating existing deck
        const index = savedDecks.findIndex(d => d.id === params.deckId);
        if (index !== -1) {
          savedDecks[index] = {
            ...updatedDeck,
            id: params.deckId,
            updatedAt: new Date().toISOString()
          };
        }
      }

      // Save back to localStorage
      localStorage.setItem('flashcards-decks', JSON.stringify(savedDecks));
      router.push('/flashcards');
    } catch (error) {
      console.error('Error saving deck:', error);
      alert('Failed to save deck. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this deck?')) return;

    try {
      const savedDecks = JSON.parse(localStorage.getItem('flashcards-decks') || '[]');
      const updatedDecks = savedDecks.filter(d => d.id !== params.deckId);
      localStorage.setItem('flashcards-decks', JSON.stringify(updatedDecks));
      router.push('/flashcards');
    } catch (error) {
      console.error('Error deleting deck:', error);
      alert('Failed to delete deck. Please try again.');
    }
  };

  const handleClose = () => {
    if (confirm('Are you sure you want to leave? Any unsaved changes will be lost.')) {
      router.push('/flashcards');
    }
  };

  return (
    <FlashcardWizard
      existingDeck={deck}
      onSave={handleSave}
      onDelete={handleDelete}
      onClose={handleClose}
    />
  );
}