'use client';

import { useState, useEffect, lazy, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import TestUI from '../components/TestUI';

// Lazy load the modal for better initial page load
const ImportModal = lazy(() => import('../components/ImportModal'));

export default function TestPage() {
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [importedDecks, setImportedDecks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  // Load saved test decks on mount
  useEffect(() => {
    const savedDecks = localStorage.getItem('test-decks');
    if (savedDecks) {
      setImportedDecks(JSON.parse(savedDecks));
    }
  }, []);

  // Save decks whenever they change
  useEffect(() => {
    if (importedDecks.length > 0) {
      localStorage.setItem('test-decks', JSON.stringify(importedDecks));
    }
  }, [importedDecks]);

  const handleImportDeck = (deck) => {
    // Check if deck already exists
    if (importedDecks.some(d => d.id === deck.id)) {
      alert('This deck has already been imported.');
      return;
    }

    // Validate deck has minimum 10 cards
    if (deck.cards.length < 10) {
      alert('Deck must have at least 10 cards to be imported.');
      return;
    }

    // Add initial progress tracking
    const deckWithProgress = {
      ...deck,
      progress: {
        learned: 0,
        mastered: 0,
        unfamiliar: deck.cards.length
      }
    };

    setImportedDecks(prev => [...prev, deckWithProgress]);
    setIsModalOpen(false);
  };

  return (
    <>
      <Navbar
        activePage="test"
        isOpen={isNavOpen}
        onToggle={(state) => setIsNavOpen(state)}
      />
      
      <main className={`transition-all duration-300 ease-in-out ${
        isNavOpen ? 'ml-64' : 'ml-20'
      }`}>
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
                  key={deck.id}
                  deck={deck}
                  onLearn={() => router.push(`/test/${deck.id}`)}
                />
              ))}
            </div>
          )}

          {/* Modal */}
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