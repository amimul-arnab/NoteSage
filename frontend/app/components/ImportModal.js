import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const ImportModal = ({ isOpen, onClose, onImport }) => {
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [availableDecks, setAvailableDecks] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDecks = async () => {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        setError('User is not authenticated. Please log in again.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/flashcards/decks', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch decks from server');
        }

        const data = await response.json();
        if (data.decks && data.decks.length > 0) {
          setAvailableDecks(data.decks);
        } else {
          setAvailableDecks([]);
          setError('No decks available.');
        }
      } catch (err) {
        console.error('Error fetching decks:', err.message);
        setError('Error fetching decks. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchDecks();
    }
  }, [isOpen]);

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

        {loading ? (
          <p className="text-center text-gray-600">Loading decks...</p>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Choose from the following decks
              </label>
              <select
                onChange={(e) => {
                  const deck = availableDecks.find(d => d._id === e.target.value);
                  setSelectedDeck(deck);
                  setError('');
                }}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#61cc03] focus:border-transparent"
              >
                <option value="">Select a deck</option>
                {availableDecks.map((deck) => (
                  <option key={deck._id} value={deck._id}>
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
        )}
      </div>
    </div>
  );
};

export default ImportModal;
