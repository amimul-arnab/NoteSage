// frontend/app/flashcards/page.js
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FlashcardsGrid from '../components/FlashcardsGrid';
import Navbar from '../components/Navbar';
import GenerateFromNoteModal from '../components/GenerateFromNoteModal';

export default function FlashcardsPage() {
  const [decks, setDecks] = useState([]);
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  const fetchDecks = async () => {
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/flashcards/decks', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.decks) {
        setDecks(data.decks);
      } else if (data.error) {
        console.error(data.error);
      }
    } catch (err) {
      console.error('Error fetching decks:', err);
    }
  };

  useEffect(() => {
    fetchDecks();
  }, [token, router]);

  const handleGenerateFromNote = async (noteId) => {
    if (!token) {
      alert('You must be logged in to generate flashcards.');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/flashcards/generate_from_note', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ note_id: noteId })
      });

      const data = await res.json();
      if (!res.ok) {
        console.error('Error generating flashcards:', data.error);
        alert('Failed to generate flashcards.');
      } else {
        alert('Flashcards generated successfully!');
        setIsModalOpen(false);
        // Re-fetch decks to show the newly created deck
        await fetchDecks();
      }
    } catch (error) {
      console.error('Error generating flashcards from note:', error);
      alert('An error occurred while generating flashcards.');
    }
  };

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
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600"
              >
                Generate from Note
              </button>
            </div>
          </div>
          
          <FlashcardsGrid decks={decks} />
        </div>
      </main>

      <GenerateFromNoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onGenerate={handleGenerateFromNote}
      />
    </>
  );
}
