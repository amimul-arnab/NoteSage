import { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';

const FlashcardWizard = ({ existingDeck = null, onSave, onDelete, onClose }) => {
  const [deck, setDeck] = useState({
    title: '',
    description: '',
    underglowColor: '',
    cards: [{ id: 1, term: '', definition: '', image: null }]
  });

  useEffect(() => {
    if (existingDeck) {
      setDeck(existingDeck);
    }
  }, [existingDeck]);

  const handleAddCard = () => {
    if (deck.cards.length >= 200) {
      alert('Maximum 200 cards allowed per deck');
      return;
    }
    
    setDeck(prev => ({
      ...prev,
      cards: [...prev.cards, { 
        id: prev.cards.length + 1,
        term: '',
        definition: '',
        image: null
      }]
    }));
  };

  const handleRemoveCard = (cardId) => {
    if (deck.cards.length === 1) {
      alert('Deck must have at least one card');
      return;
    }
    
    setDeck(prev => ({
      ...prev,
      cards: prev.cards
        .filter(card => card.id !== cardId)
        .map((card, index) => ({ ...card, id: index + 1 }))
    }));
  };

  const handleCardChange = (cardId, field, value) => {
    setDeck(prev => ({
      ...prev,
      cards: prev.cards.map(card => 
        card.id === cardId ? { ...card, [field]: value } : card
      )
    }));
  };

  const handleImageUpload = async (cardId, file) => {
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPEG, PNG, or GIF)');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target.result; // data:image/png;base64,iVBOR...
      // Strip prefix:
      const base64Str = result.split(",")[1];
      handleCardChange(cardId, 'image', base64Str);
    };    
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    // Validate required fields
    if (!deck.title.trim() || !deck.description.trim()) {
      alert('Title and description are required');
      return;
    }

    // Validate cards
    const invalidCards = deck.cards.filter(
      card => !card.term.trim() || !card.definition.trim()
    );
    
    if (invalidCards.length > 0) {
      alert('All cards must have both term and definition filled out');
      return;
    }

    onSave(deck);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Title"
              value={deck.title}
              onChange={(e) => setDeck(prev => ({ ...prev, title: e.target.value }))}
              maxLength={150}
              className="w-full text-4xl font-bold mb-2 p-2 border-b focus:outline-none focus:border-green-500"
            />
            <input
              type="text"
              placeholder="Description"
              value={deck.description}
              onChange={(e) => setDeck(prev => ({ ...prev, description: e.target.value }))}
              maxLength={150}
              className="w-full text-gray-600 p-2 border-b focus:outline-none focus:border-green-500"
            />
          </div>
          <div className="ml-4 flex items-center gap-4">
            <div className="relative">
              <input
                type="color"
                value={deck.underglowColor}
                onChange={(e) => setDeck(prev => ({ ...prev, underglowColor: e.target.value }))}
                className="w-12 h-12 rounded-full cursor-pointer appearance-none bg-transparent"
                style={{
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  border: 'none',
                  padding: 0,
                }}
                title="Underglow Color"
              />
              <div className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  background: deck.underglowColor || '#ffffff',
                  border: '2px solid #e5e7eb'
                }}
              />
            </div>
            <span className="text-sm text-gray-600 uppercase">
              {deck.underglowColor || '#000000'}
            </span>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="space-y-6 mb-8">
          {deck.cards.map((card) => (
            <div key={card.id} className="bg-gray-50 rounded-lg p-6 relative">
              <button
                onClick={() => handleRemoveCard(card.id)}
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
              >
                <X size={20} />
              </button>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Term</label>
                  <input
                    type="text"
                    value={card.term}
                    onChange={(e) => handleCardChange(card.id, 'term', e.target.value)}
                    maxLength={150}
                    className="w-full p-2 border rounded focus:outline-none focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Definition</label>
                  <textarea
                    value={card.definition}
                    onChange={(e) => handleCardChange(card.id, 'definition', e.target.value)}
                    maxLength={300}
                    className="w-full p-2 border rounded focus:outline-none focus:border-green-500 min-h-[100px] resize-y"
                    style={{
                      overflow: 'auto',
                      lineHeight: '1.5',
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image (Optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(card.id, e.target.files[0])}
                    className="w-full p-2 border rounded focus:outline-none focus:border-green-500"
                  />
                  {card.image && (
                    <img 
                      src={card.image} 
                      alt="Card visual" 
                      className="mt-2 w-20 h-20 object-cover rounded"
                    />
                  )}
                </div>
              </div>
              <div className="text-sm text-gray-500 mt-2">Card {card.id}</div>
            </div>
          ))}
        </div>

        {/* Add Card Button */}
        <button
          onClick={handleAddCard}
          className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-green-500 hover:text-green-500 flex items-center justify-center gap-2 mb-8"
        >
          <Plus size={20} />
          Add Card
        </button>

        <div className="text-center text-gray-600 mb-8">
          Total Deck: {deck.cards.length} cards
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4">
          <button
            onClick={handleSave}
            className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Save Deck
          </button>
          {existingDeck && (
            <button
              onClick={onDelete}
              className="w-full py-3 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Delete Deck
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlashcardWizard;