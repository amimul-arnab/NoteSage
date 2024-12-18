"use client";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import Navbar from "../components/Navbar";
import NotebookDisplay from "../components/NotebookDisplay";
import TestUI from "../components/TestUI";
import DeckCard from "../components/DeckCard";
import AddNew from "../components/AddNew";

export default function MainPage() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const [userName, setUserName] = useState("");
  const [flashcards, setFlashcards] = useState([]);
  const [notes, setNotes] = useState([]);
  const [tests, setTests] = useState([]);

  useEffect(() => {
    const storedState = localStorage.getItem('navbarOpen');
    setIsOpen(storedState === 'true');
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      // Fetch user data
      const userRes = await fetch("http://localhost:5000/auth/me", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const userData = await userRes.json();
      setUserName(userData.full_name || userData.email?.split("@")[0] || "User");

      // Fetch all data in parallel
      const [flashcardsRes, notesRes] = await Promise.all([
        fetch("http://localhost:5000/flashcards/decks", {
          headers: { "Authorization": `Bearer ${token}` }
        }),
        fetch("http://localhost:5000/notes/list", {
          headers: { "Authorization": `Bearer ${token}` }
        })
      ]);

      const [flashcardsData, notesData] = await Promise.all([
        flashcardsRes.json(),
        notesRes.json()
      ]);

      setFlashcards(flashcardsData.decks || []);
      setNotes(notesData.notes || []);
      // Tests will be derived from flashcards
      setTests(flashcardsData.decks || []);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  const handleToggleNavbar = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    localStorage.setItem('navbarOpen', newState);
  };

  const marginLeft = isOpen ? 'ml-64' : 'ml-20';

  return (
    <div className="flex">
      <Navbar isOpen={isOpen} onToggle={handleToggleNavbar} activePage="home" />
      <div className={`p-10 w-full bg-[#f9faf9] flex flex-col gap-16 transition-all duration-300 ${marginLeft}`}>
        <h1 className="text-6xl font-bold mb-10">
          Hello <span className="text-[#61cc03] font-bold">{userName}</span>
        </h1>

        <section className="w-full">
          <h2 className="text-4xl mb-6">Continue Learning</h2>
          <div className="flex gap-8 overflow-visible flex-wrap">
            <AddNew onClick={() => router.push('/flashcards')} />
            {flashcards.slice(0, 3).map(deck => (
              <DeckCard key={deck._id} {...deck} />
            ))}
          </div>
        </section>

        <section className="w-full">
          <h2 className="text-4xl mb-6">View Notes</h2>
          <div className="flex gap-8 overflow-visible flex-wrap">
            <AddNew onClick={() => router.push('/notes')} />
            {notes.slice(0, 3).map(note => (
              <NotebookDisplay
                key={note._id}
                {...note}
                onEdit={() => router.push(`/notes/edit/${note._id}`)}
              />
            ))}
          </div>
        </section>

        <section className="w-full">
          <h2 className="text-4xl mb-6">Test Yourself</h2>
          <div className="flex gap-8 overflow-visible flex-wrap">
            <AddNew onClick={() => router.push('/test')} />
            {tests.slice(0, 3).map(test => (
              <TestUI
                key={test._id}
                deck={test}
                onLearn={() => router.push(`/test/${test._id}`)}
              />
            ))}
          </div>
        </section>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .${marginLeft} {
            margin-left: 0;
          }
          .p-10 {
            padding: 1.5rem;
          }
          .text-6xl {
            font-size: 2.5rem;
          }
          .text-4xl {
            font-size: 1.75rem;
          }
        }
        @media (max-width: 480px) {
          .p-10 {
            padding: 1rem;
          }
          .text-6xl {
            font-size: 2rem;
          }
          .text-4xl {
            font-size: 1.5rem;
          }
          .flex {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}