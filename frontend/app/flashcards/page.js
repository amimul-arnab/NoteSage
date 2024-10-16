"use client";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";

export default function FlashcardsPage() {
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const storedState = localStorage.getItem('navbarOpen');
    setIsOpen(storedState === 'true');
  }, []);

  const handleToggleNavbar = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    localStorage.setItem('navbarOpen', newState);
  };

  const marginLeft = isOpen ? 'ml-64' : 'ml-20';

  return (
    <div className="flex">
      <Navbar isOpen={isOpen} onToggle={handleToggleNavbar} activePage="flashcards" />
      <div className={`p-10 w-full bg-[#f9faf9] transition-all duration-300 ${marginLeft}`}>
        <h1 className="text-4xl font-bold">This is the Flashcards Page</h1>
      </div>
    </div>
  );
}
