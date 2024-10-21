// /Users/amimularnab/notesage/frontend/app/notes/[notebookId]/page.js

"use client";
import NotebookPage from '@/app/components/NotebookPage'; // Ensure correct import path
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DynamicNotebookPage() {
  const { notebookId } = useParams(); // Get the notebookId from the URL
  const [notebook, setNotebook] = useState(null);
  const [content, setContent] = useState(''); // State for Quill editor content

  useEffect(() => {
    console.log('notebookId:', notebookId); // Log the notebook ID for debugging
    const storedNotebooks = JSON.parse(localStorage.getItem('notebooks')) || [];
    const currentNotebook = storedNotebooks.find((nb) => nb.id === notebookId);
    
    console.log('Stored Notebooks:', storedNotebooks); // Log all stored notebooks
    console.log('Current Notebook:', currentNotebook); // Log the notebook if found

    if (currentNotebook) {
      setNotebook(currentNotebook);
      const savedContent = localStorage.getItem(`notebook-${notebookId}`);
      console.log('Saved Content:', savedContent); // Log the saved content if found
      setContent(savedContent || ''); // Load saved content from localStorage or empty string
    }
  }, [notebookId]);

  const handleContentChange = (value) => {
    setContent(value); // Update content in state
    localStorage.setItem(`notebook-${notebookId}`, value); // Auto-save content to localStorage
    console.log('Content Saved for Notebook:', notebookId); // Log when content is saved
  };

  if (!notebook) {
    return <p>Notebook not found</p>; // Show a message if the notebook is not found
  }

  return (
    <NotebookPage
      title={notebook.title}
      description={notebook.description}
      category={notebook.category}
      image={notebook.image}
      content={content}
      onContentChange={handleContentChange} // Pass the content change handler to the NotebookPage
    />
  );
}
