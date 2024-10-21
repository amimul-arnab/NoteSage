// /Users/amimularnab/notesage/frontend/app/notes/page.js
"use client";
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import AddNotebook from '../components/AddNotebook';
import NotebookDisplay from '../components/NotebookDisplay';
import EditNotebook from '../components/EditNotebook';

export default function NotesPage() {
  const [isOpen, setIsOpen] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [notebooks, setNotebooks] = useState([]);
  const [editNotebook, setEditNotebook] = useState(null);

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
    const updatedNotebooks = [...notebooks, { ...notebook }];
    setNotebooks(updatedNotebooks);
    localStorage.setItem('notebooks', JSON.stringify(updatedNotebooks)); // Save to localStorage
    setShowPopup(false);
    console.log('Adding Notebook:', notebook);
  };

  const handleEditNotebook = (notebook) => {
    setEditNotebook(notebook); // Set the notebook to be edited
    setShowEdit(true); // Show the edit popup
  };

  const handleDeleteNotebook = (id) => {
    const updatedNotebooks = notebooks.filter((nb) => nb.id !== id);
    setNotebooks(updatedNotebooks);
    localStorage.setItem('notebooks', JSON.stringify(updatedNotebooks)); // Update localStorage
  };

  const handleSaveChanges = (updatedNotebook) => {
    const updatedNotebooks = notebooks.map((nb) =>
      nb.id === updatedNotebook.id ? updatedNotebook : nb
    );
    setNotebooks(updatedNotebooks);
    localStorage.setItem('notebooks', JSON.stringify(updatedNotebooks)); // Save to localStorage
    setShowEdit(false); // Close edit popup
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

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 mt-10">
          {notebooks.length > 0 ? (
            notebooks.map((notebook) => (
              <NotebookDisplay
                key={notebook.id}
                {...notebook}
                onEdit={() => handleEditNotebook(notebook)}
              />
            ))
          ) : (
            <p>No notebooks yet. Add a new notebook to get started.</p>
          )}
        </div>

        {showPopup && <AddNotebook onCreateNotebook={handleAddNotebook} onClose={() => setShowPopup(false)} />}
        {showEdit && editNotebook && (
          <EditNotebook
            notebook={editNotebook}
            onSaveChanges={handleSaveChanges}
            onDelete={() => handleDeleteNotebook(editNotebook.id)}
            onClose={() => setShowEdit(false)}
          />
        )}
      </div>
    </div>
  );
}
