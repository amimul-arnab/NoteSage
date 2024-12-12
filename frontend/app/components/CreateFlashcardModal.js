import { useState } from 'react';

const CreateFlashcardModal = ({ isOpen, onClose, onCreateDeck }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [underglowColor, setUnderglowColor] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    
    onCreateDeck({
      id: Date.now().toString(),
      title: title.trim(),
      description: description.trim(),
      underglowColor
    });
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
        
        <h2 className="text-2xl font-semibold mb-4">Create Flashcard Deck</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Title"
              maxLength={150}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border rounded-lg"
            />
            <textarea
              placeholder="Description"
              maxLength={150}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border rounded-lg h-24"
            />
            <input
              type="text"
              placeholder="Underglow Color (optional)"
              value={underglowColor}
              onChange={(e) => setUnderglowColor(e.target.value)}
              className="w-full p-3 border rounded-lg"
            />
            <button
              type="submit"
              disabled={!title.trim() || !description.trim()}
              className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 disabled:opacity-50"
            >
              Create Deck
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateFlashcardModal;