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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Fetch imported decks from the backend on mount
  useEffect(() => {
    const fetchDecks = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('access_token');
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await fetch('http://localhost:5000/flashcards/decks', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch decks');
        }

        const data = await response.json();
        setImportedDecks(data.decks || []);
      } catch (error) {
        console.error('Error fetching imported decks:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDecks();
  }, [router]);

  const handleImportDeck = async (deck) => {
    try {
      if (importedDecks.some((d) => d._id === deck._id)) {
        alert('This deck has already been imported.');
        return;
      }

      if (deck.cards.length < 10) {
        alert('Deck must have at least 10 cards to be imported.');
        return;
      }

      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:5000/flashcards/decks/${deck._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...deck,
          progress: {
            learned: [],
            mastered: [],
            unfamiliar: Array.from({ length: deck.cards.length }, (_, i) => i)
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to import deck');
      }

      setImportedDecks(prev => [...prev, deck]);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error importing deck:', error);
      alert('Failed to import deck. Please try again.');
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center min-h-screen text-red-500">{error}</div>;
  }

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
                  progress={{
                    learned: deck.progress_counts?.learned || 0,
                    mastered: deck.progress_counts?.mastered || 0,
                    unfamiliar: deck.progress_counts?.unfamiliar || 0,
                    total: deck.progress_counts?.total || deck.cards.length
                  }}
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