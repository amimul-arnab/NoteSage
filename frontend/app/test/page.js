"use client";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";

export default function TestPage() {
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
      <Navbar isOpen={isOpen} onToggle={handleToggleNavbar} activePage="test" />
      <div className={`p-10 w-full bg-[#f9faf9] transition-all duration-300 ${marginLeft}`}>
        <h1 className="text-4xl font-bold">This is the Test Page</h1>
      </div>
    </div>
  );
}
