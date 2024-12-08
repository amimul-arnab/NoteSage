"use client";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";

// A single flashcard display in list view
function Flashcard({ term, definition }) {
  return (
    <div className="p-6 bg-white shadow-md rounded-md w-full sm:w-64 flex flex-col gap-2 border border-gray-100">
      <h3 className="text-xl font-semibold">{term}</h3>
      <p className="text-gray-700">{definition}</p>
    </div>
  );
}

// Modal for practicing flashcards one-by-one
function PracticeModal({ flashcards, onClose }) {
  const terms = Object.keys(flashcards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDefinition, setShowDefinition] = useState(false);

  const currentTerm = terms[currentIndex];
  const currentDefinition = flashcards[currentTerm];

  const handleNext = () => {
    setShowDefinition(false);
    if (currentIndex < terms.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 px-4">
      <div className="relative bg-white p-8 rounded-lg shadow-lg w-full max-w-md flex flex-col gap-6">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          ✕
        </button>

        <h2 className="text-3xl font-bold text-[#61cc03]">
          Practice Flashcards
        </h2>
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-2xl font-semibold mb-2">{currentTerm}</h3>
            {showDefinition ? (
              <p className="text-gray-800">{currentDefinition}</p>
            ) : (
              <p className="text-gray-500 italic">[Definition hidden]</p>
            )}
          </div>
          <div className="flex gap-4">
            {!showDefinition && (
              <button
                className="bg-[#61cc03] text-white px-4 py-2 rounded-md font-semibold hover:bg-green-600 transition-colors"
                onClick={() => setShowDefinition(true)}
              >
                Show Definition
              </button>
            )}

            {showDefinition && (
              <button
                className="bg-green-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-green-600 transition-colors"
                onClick={handleNext}
              >
                {currentIndex < terms.length - 1 ? "Next" : "Finish"}
              </button>
            )}
          </div>
          <p className="text-sm text-gray-500">
            Card {currentIndex + 1} of {terms.length}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function FlashcardsPage() {
  const [isOpen, setIsOpen] = useState(true);
  const [notesList, setNotesList] = useState([]); // Fetched from DB in production
  const [selectedNote, setSelectedNote] = useState("");
  const [flashcards, setFlashcards] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPracticeOpen, setIsPracticeOpen] = useState(false);

  useEffect(() => {
    const storedState = localStorage.getItem("navbarOpen");
    setIsOpen(storedState === "true");

    // Mock fetching list of notes
    setNotesList([
      { id: "data-structures", title: "Data Structures I Notes" },
      { id: "chemistry", title: "Chemistry II Notes" },
    ]);
  }, []);

  const handleToggleNavbar = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    localStorage.setItem("navbarOpen", newState);
  };

  const marginLeft = isOpen ? "ml-64" : "ml-20";

  const handleGenerateFlashcards = async () => {
    if (!selectedNote) return;

    setIsGenerating(true);
    setFlashcards(null);

    // Simulate fetch and generation with a timeout
    setTimeout(() => {
      const mockedFlashcards = {
        "Array": "A linear data structure that stores elements contiguously.",
        "Linked List": "A linear data structure with elements linked using pointers.",
        "Stack": "A linear data structure using LIFO principle.",
        "Queue": "A linear data structure using FIFO principle.",
      };
      setFlashcards(mockedFlashcards);
      setIsGenerating(false);
    }, 2000);
  };

  const handleStartPractice = () => {
    if (flashcards) setIsPracticeOpen(true);
  };

  const handleClosePractice = () => {
    setIsPracticeOpen(false);
  };

  return (
    <div className="flex">
      <Navbar isOpen={isOpen} onToggle={handleToggleNavbar} activePage="flashcards" />
      <div
        className={`p-10 w-full bg-[#f9faf9] flex flex-col gap-0 transition-all duration-300 ${marginLeft}`}
      >
        <h1 className="text-6xl font-bold mb-4  bg-gradient-to-r from-green-400 via-yellow-500 to-green-600 text-transparent bg-clip-text drop-shadow-md animate-pulse">
          Flashcards
        </h1>

        <p className="text-xl text-gray-700 max-w-3xl mb-20">
          Generate flashcards from your AI-generated notes.
        </p>

        {/* Section to select notes and generate flashcards */}
        <section className="w-full flex flex-col gap-6 bg-white p-6 rounded-md shadow-sm border border-gray-100">
          <h2 className="text-4xl mb-4">Generate from Notes</h2>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <select
              value={selectedNote}
              onChange={(e) => setSelectedNote(e.target.value)}
              className="p-3 border border-gray-300 rounded-md bg-white"
            >
              <option value="">-- Select Notes --</option>
              {notesList.map((note) => (
                <option value={note.id} key={note.id}>
                  {note.title}
                </option>
              ))}
            </select>
            <button
              onClick={handleGenerateFlashcards}
              className={`bg-[#61cc03] text-white px-6 py-3 rounded-md font-semibold hover:bg-green-600 transition-colors ${
                !selectedNote || isGenerating ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={!selectedNote || isGenerating}
            >
              {isGenerating ? "Generating..." : "Generate Flashcards"}
            </button>
          </div>
        </section>

        {/* Display generated flashcards and practice button */}
        {flashcards && (
          <section className="w-full flex flex-col gap-6">
            <div className="flex justify-center items-center">
              <h2 className="text-4xl mr-9">Your Flashcards</h2>
            </div>
            <div className="flex flex-wrap gap-8">
              {Object.entries(flashcards).map(([term, definition]) => (
                <Flashcard key={term} term={term} definition={definition} />
              ))}
            </div>
            <button
                onClick={handleStartPractice}
                className="bg-[#61cc03] text-white px-6 py-2 rounded-md font-semibold hover:bg-green-600 transition-colors max-auto"
              >
                Practice
              </button>
          </section>
        )}

        {isPracticeOpen && (
          <PracticeModal flashcards={flashcards} onClose={handleClosePractice} />
        )}
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .${marginLeft} {
            margin-left: 0;
          }
          .p-10 {
            padding: 1.5rem;
          }
          .text-6xl {
            font-size: 2.5rem;
          }
          .text-4xl {
            font-size: 1.75rem;
          }
        }
        @media (max-width: 480px) {
          .p-10 {
            padding: 1rem;
          }
          .text-6xl {
            font-size: 2rem;
          }
          .text-4xl {
            font-size: 1.5rem;
          }
          .flex {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
