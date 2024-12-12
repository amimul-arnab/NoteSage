"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FlashcardsGrid from '../components/FlashcardsGrid';
import Navbar from '../components/Navbar';

export default function FlashcardsPage() {
  const [decks, setDecks] = useState([]);
  const [isNavOpen, setIsNavOpen] = useState(true);
  const router = useRouter();

  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }

    // Fetch decks from the backend
    fetch('http://localhost:5000/flashcards/decks', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      if (data.decks) {
        setDecks(data.decks);
      } else if (data.error) {
        console.error(data.error);
      }
    })
    .catch(err => console.error('Error fetching decks:', err));
  }, [token, router]);

  return (
    <>
      <Navbar
        activePage="flashcards"
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