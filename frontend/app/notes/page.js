// /Users/amimularnab/notesage/frontend/app/notes/page.js
"use client";
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import AddNotebook from '../components/AddNotebook';
import NotebookDisplay from '../components/NotebookDisplay';

export default function NotesPage() {
  const [isOpen, setIsOpen] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [notebooks, setNotebooks] = useState([]);

  useEffect(() => {
    const savedNotebooks = JSON.parse(localStorage.getItem('notebooks')) || [];
    setNotebooks(savedNotebooks);
  }, []);

  const handleToggleNavbar = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    localStorage.setItem('navbarOpen', newState);
  };

  const handleAddNotebook = (notebook) => {
    const updatedNotebooks = [...notebooks, { ...notebook, id: Date.now() }];
    setNotebooks(updatedNotebooks);
    localStorage.setItem('notebooks', JSON.stringify(updatedNotebooks)); // Save to localStorage
    setShowPopup(false);
  };

  const handleClearNotebooks = () => {
    setNotebooks([]);
    localStorage.removeItem('notebooks'); // Clear all notebooks
  };

  return (
    <div className="flex">
      <Navbar isOpen={isOpen} onToggle={handleToggleNavbar} activePage="notes" />
      <div className={`p-10 w-full bg-[#f9faf9] min-h-screen transition-all duration-300 ${isOpen ? 'ml-64' : 'ml-20'}`}>
        <h1 className="text-4xl font-bold">View Your Notebooks</h1>
        
        <div className="flex justify-between mt-6">
          <button className="border px-4 py-2 rounded bg-gray-100" onClick={() => alert('Sorting not yet implemented')}>Sort</button>
          <div className="flex gap-2">
            <button className="bg-green-500 text-white rounded px-4 py-2" onClick={() => setShowPopup(true)}>
              + Add New
            </button>
            <button className="bg-red-500 text-white rounded px-4 py-2" onClick={handleClearNotebooks}>
              Clear All
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
          {notebooks.length > 0 ? (
            notebooks.map((notebook, index) => (
              <NotebookDisplay key={index} {...notebook} />
            ))
          ) : (
            <p>No notebooks yet. Add a new notebook to get started.</p>
          )}
        </div>

        {showPopup && <AddNotebook onCreateNotebook={handleAddNotebook} onClose={() => setShowPopup(false)} />}
      </div>
    </div>
  );
}
