// frontend/app/components/GenerateFromNoteModal.js
"use client";

import { useState, useEffect } from 'react';

const GenerateFromNoteModal = ({ isOpen, onClose, onGenerate }) => {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState('');
  const [error, setError] = useState('');
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  useEffect(() => {
    if (!isOpen) return;
    // Fetch notes only when modal opens
    const fetchNotes = async () => {
      if (!token) return;
      try {
        const res = await fetch('http://localhost:5000/notes/list', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) {
          console.error(data.error);
          setError('Failed to fetch notes.');
        } else {
          setNotes(data.notes || []);
        }
      } catch (err) {
        console.error('Error fetching notes:', err);
        setError('Error fetching notes.');
      }
    };
    fetchNotes();
  }, [isOpen, token]);

  const handleGenerate = () => {
    if (!selectedNote) {
      setError('Please select a note.');
      return;
    }
    onGenerate(selectedNote);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold mb-6">Generate Flashcards from a Note</h2>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="mb-6">
          <label className="block mb-2 font-semibold">Select a Note:</label>
          <select
            className="w-full p-2 border rounded"
            value={selectedNote}
            onChange={(e) => setSelectedNote(e.target.value)}
          >
            <option value="">--Choose a note--</option>
            {notes.map(note => (
              <option key={note._id} value={note._id}>
                {note.title || note._id}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleGenerate}
          className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600"
        >
          Generate Flashcards
        </button>
      </div>
    </div>
  );
};

export default GenerateFromNoteModal;
