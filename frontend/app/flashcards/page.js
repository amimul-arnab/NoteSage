'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FlashcardsGrid from '../components/FlashcardsGrid';
import Navbar from '../components/Navbar';

export default function FlashcardsPage() {
  const [decks, setDecks] = useState([]);
  const [isNavOpen, setIsNavOpen] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const savedDecks = localStorage.getItem('flashcards-decks');
    if (savedDecks) {
      setDecks(JSON.parse(savedDecks));
    }
  }, []);

  return (
    <>
      <Navbar
        activePage="flashcards"
        isOpen={isNavOpen}
        onToggle={(state) => setIsNavOpen(state)}
      />
      
      {/* Main content that starts exactly at navbar edge */}
      <main 
        className={`transition-all duration-300 ease-in-out ${
          isNavOpen ? 'ml-64' : 'ml-20'
        }`}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-semibold">Your Decks</h1>
            <div className="flex gap-4">
              <button
                onClick={() => router.push('/flashcards/edit/new')}
                className="bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600"
              >
                + ADD NEW
              </button>
            </div>
          </div>
          
          <FlashcardsGrid decks={decks} />
        </div>
      </main>
    </>
  );
}