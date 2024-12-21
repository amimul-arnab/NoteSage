import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

const FlashcardView = ({ cards = [], title, description, underglowColor }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [flipDirection, setFlipDirection] = useState('right'); // Track direction
  const router = useRouter();
  const currentCard = cards[currentIndex];

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === ' ') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex]);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setFlipDirection('left');
      setCurrentIndex((prev) => prev - 1);
      setIsFlipped(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setFlipDirection('right');
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
    }
  };

  if (!cards.length) {
    return <div className="text-center p-8">This deck has no cards yet.</div>;
  }

  const cardVariants = {
    enter: (direction) => ({
      rotateY: direction === 'right' ? 90 : -90,
      opacity: 0,
    }),
    center: {
      rotateY: 0,
      opacity: 1,
      transition: { duration: 0.6, type: 'spring', stiffness: 100 },
    },
    exit: (direction) => ({
      rotateY: direction === 'right' ? -90 : 90,
      opacity: 0,
      transition: { duration: 0.6, type: 'spring', stiffness: 100 },
    }),
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
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
      <div className="flex flex-col items-center justify-center w-full">
        <motion.div
          key={currentIndex}
          custom={flipDirection}
          initial="enter"
          animate="center"
          exit="exit"
          variants={cardVariants}
          className="w-full max-w-3xl aspect-[3/2] bg-white rounded-xl cursor-pointer flex items-center justify-center"
          onClick={() => setIsFlipped((prev) => !prev)}
          style={{
            boxShadow: `0 4px 20px ${underglowColor || 'rgba(0, 0, 0, 0.1)'}`,
          }}
        >
          {!isFlipped ? (
            <div className="h-full flex flex-col items-center justify-center">
              <div className="text-3xl font-medium text-center mb-6">
                {currentCard.term}
              </div>
              {currentCard.image && (
                <img
                  src={currentCard.image}
                  alt={`Visual for ${currentCard.term}`}
                  className="max-w-full max-h-48 object-contain rounded-lg"
                />
              )}
              {currentCard.image && (
                <div className="text-xs text-gray-500 mt-2">Click to flip</div>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center px-4">
              <div className="text-2xl text-center whitespace-pre-wrap break-words">
                {currentCard.definition}
              </div>
            </div>
          )}
        </motion.div>

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
