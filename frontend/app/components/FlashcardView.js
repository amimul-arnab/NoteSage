import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

const FlashcardView = ({ cards = [], title, description, underglowColor }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const router = useRouter();
  
  const currentCard = cards[currentIndex];
  
  useEffect(() => {
    console.log('Current card:', currentCard);
    if (currentCard?.image) {
      console.log('Image URL:', currentCard.image);
    }
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === ' ') {
        e.preventDefault();
        setIsFlipped(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, currentCard]);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    }
  };

  if (!cards.length) {
    return <div className="text-center p-8">This deck has no cards yet.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Title Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-3">{title}</h1>
        <p className="text-gray-600">{description}</p>
      </div>

      {/* Close Button */}
      <button
        onClick={() => router.push('/flashcards')}
        className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-200 transition-colors"
      >
        <X size={24} />
      </button>

      {/* Flashcard */}
      <div className="flex flex-col items-center justify-center">
        <div 
          onClick={() => setIsFlipped(prev => !prev)}
          className="w-full max-w-3xl aspect-[3/2] bg-white rounded-xl cursor-pointer transition-all duration-300"
          style={{
            boxShadow: `0 4px 20px ${underglowColor || 'rgba(0, 0, 0, 0.1)'}`,
          }}
        >
          <div className="h-full w-full p-8 flex flex-col items-center">
            {!isFlipped ? (
              // Term Side
              <div className="h-full flex flex-col items-center justify-center">
                <div className="text-3xl font-medium text-center mb-6">
                  {currentCard.term}
                </div>
                {currentCard.image && (
                  <div className="mt-4 relative">
                    <img
                      src={currentCard.image}
                      alt={`Visual for ${currentCard.term}`}
                      className="max-w-full max-h-48 object-contain rounded-lg"
                      onError={(e) => {
                        console.error('Image load error for:', currentCard.image);
                        e.target.onerror = null; // Prevent infinite loop
                        e.target.style.display = 'none';
                        const parent = e.target.parentElement;
                        if (parent) {
                          const errorText = document.createElement('div');
                          errorText.className = 'text-red-500 text-sm';
                          errorText.textContent = 'Failed to load image';
                          parent.appendChild(errorText);
                        }
                      }}
                      onLoad={() => console.log('Image loaded successfully:', currentCard.image)}
                    />
                  </div>
                )}
                {currentCard.image && <div className="text-xs text-gray-500 mt-2">Click to flip</div>}
              </div>
            ) : (
              // Definition Side
              <div className="h-full flex items-center justify-center">
                <div className="max-h-full overflow-y-auto custom-scrollbar px-4">
                  <div className="text-2xl whitespace-pre-wrap break-words">
                    {currentCard.definition}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Navigation */}
        <div className="flex items-center gap-6 mt-8">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="p-3 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
          >
            <ChevronLeft size={28} />
          </button>
          <span className="text-lg font-medium">
            {currentIndex + 1} of {cards.length}
          </span>
          <button
            onClick={handleNext}
            disabled={currentIndex === cards.length - 1}
            className="p-3 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
          >
            <ChevronRight size={28} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlashcardView;