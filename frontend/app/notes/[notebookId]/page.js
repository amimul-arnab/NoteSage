"use client";
import NotebookPage from '@/app/components/NotebookPage'; // Ensure correct import path
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DynamicNotebookPage() {
  const { notebookId } = useParams(); // Get the notebookId from the URL
  const [notebook, setNotebook] = useState(null);
  const [content, setContent] = useState(''); // State for Quill editor content

  useEffect(() => {
    const storedNotebooks = JSON.parse(localStorage.getItem('notebooks')) || [];
    const currentNotebook = storedNotebooks.find((nb) => nb.id === notebookId);

    if (currentNotebook) {
      setNotebook(currentNotebook);
      const savedContent = localStorage.getItem(`notebook-${notebookId}`);
      setContent(savedContent || ''); // Load saved content from localStorage or empty string
    }
  }, [notebookId]);

  const handleContentChange = (value) => {
    setContent(value); // Update content in state
    localStorage.setItem(`notebook-${notebookId}`, value); // Auto-save content to localStorage
  };

  if (!notebook) {
    return <p>Notebook not found</p>; // Show a message if the notebook is not found
  }

  return (
    <div className="mx-auto mt-6 max-w-4xl p-8 bg-white shadow-md rounded-lg min-h-screen">
      {/* Render NotebookPage */}
      <NotebookPage
        title={notebook.title}
        description={notebook.description}
        category={notebook.category}
        image={notebook.image}
        content={content}
        onContentChange={handleContentChange} // Pass the content change handler to the NotebookPage
      />
    </div>
  );
}
