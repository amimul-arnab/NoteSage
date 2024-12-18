'use client';

import { useState, useEffect, lazy, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import TestUI from '../components/TestUI';

const ImportModal = lazy(() => import('../components/ImportModal'));

export default function TestPage() {
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [importedDecks, setImportedDecks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  // Fetch imported decks from the backend on mount
  useEffect(() => {
    const fetchDecks = async () => {
      try {
        const response = await fetch('http://localhost:5000/flashcards/decks', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch decks');
        const data = await response.json();
        setImportedDecks(data.decks || []);
      } catch (error) {
        console.error('Error fetching imported decks:', error);
      }
    };

    if (token) fetchDecks();
  }, [token]);

  // Save imported decks to localStorage when they change
  useEffect(() => {
    if (importedDecks.length > 0) {
      localStorage.setItem('test-decks', JSON.stringify(importedDecks));
    }
  }, [importedDecks]);

  const handleImportDeck = (deck) => {
    if (importedDecks.some((d) => d._id === deck._id)) {
      alert('This deck has already been imported.');
      return;
    }

    if (deck.cards.length < 10) {
      alert('Deck must have at least 10 cards to be imported.');
      return;
    }

    const deckWithProgress = {
      ...deck,
      progress: {
        learned: 0,
        mastered: 0,
        unfamiliar: deck.cards.length,
      },
    };

    setImportedDecks((prev) => [...prev, deckWithProgress]);
    setIsModalOpen(false);
  };

  return (
    <>
      <Navbar
        activePage="test"
        isOpen={isNavOpen}
        onToggle={(state) => setIsNavOpen(state)}
      />

      <main
        className={`transition-all duration-300 ease-in-out ${
          isNavOpen ? 'ml-64' : 'ml-20'
        }`}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold">Test Your Knowledge</h1>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#61cc03] text-white px-6 py-2 rounded-full hover:bg-[#52ab02] transition-colors"
            >
              Import Deck
            </button>
          </div>

          {importedDecks.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <p className="text-xl text-gray-600 mb-4">
                No decks imported yet. Start by importing a flashcard deck!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {importedDecks.map((deck) => (
                <TestUI
                  key={deck._id}
                  deck={deck}
                  onLearn={() => router.push(`/test/${deck._id}`)}
                />
              ))}
            </div>
          )}

          {isModalOpen && (
            <Suspense fallback={<div>Loading...</div>}>
              <ImportModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onImport={handleImportDeck}
              />
            </Suspense>
          )}
        </div>
      </main>
    </>
  );
}
