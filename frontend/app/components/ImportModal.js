import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const ImportModal = ({ isOpen, onClose, onImport }) => {
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [availableDecks, setAvailableDecks] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load available flashcard decks from localStorage
    const decks = JSON.parse(localStorage.getItem('flashcards-decks') || '[]');
    setAvailableDecks(decks);
  }, []);

  const handleImport = () => {
    if (!selectedDeck) {
      setError('Please select a deck');
      return;
    }

    if (selectedDeck.cards.length < 10) {
      setError('Deck must have at least 10 cards');
      return;
    }

    onImport(selectedDeck);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-6">Import Deck</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Choose from following deck
            </label>
            <select
              onChange={(e) => {
                const deck = availableDecks.find(d => d.id === e.target.value);
                setSelectedDeck(deck);
                setError('');
              }}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#61cc03] focus:border-transparent"
            >
              <option value="">Select a deck</option>
              {availableDecks.map((deck) => (
                <option key={deck.id} value={deck.id}>
                  {deck.title}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            onClick={handleImport}
            className="w-full bg-[#61cc03] text-white py-3 rounded-lg hover:bg-[#52ab02] transition-colors"
          >
            Import Deck
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportModal;