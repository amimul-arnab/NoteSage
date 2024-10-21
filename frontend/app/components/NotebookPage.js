"use client"; // Ensure client-side rendering
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';

// Dynamically import the Quill editor
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css'; // Import Quill styles

export default function NotebookPage() {
  const { notebookId } = useParams(); // Get notebookId from the URL
  const [notebook, setNotebook] = useState(null);
  const [content, setContent] = useState(''); // State for Quill editor content

  // Fetch notebook from localStorage based on notebookId
  useEffect(() => {
    const savedNotebooks = JSON.parse(localStorage.getItem('notebooks')) || [];
    const currentNotebook = savedNotebooks.find((nb) => nb.id === notebookId);

    if (currentNotebook) {
      setNotebook(currentNotebook);
      setContent(localStorage.getItem(`notebook-${notebookId}`) || ''); // Load saved content from localStorage
    }
  }, [notebookId]);

  // Auto-save content to localStorage whenever it changes
  const handleContentChange = (value) => {
    setContent(value);
    localStorage.setItem(`notebook-${notebookId}`, value); // Save content to localStorage
  };

  if (!notebook) {
    return <p>Notebook not found</p>;
  }

  return (
    <div className="p-10 bg-white min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-4xl font-bold">{notebook.title}</h1>
          <p className="text-lg text-gray-600">{notebook.description}</p>
          <p className="text-md text-gray-500">{notebook.category}</p>
        </div>
        {notebook.image && (
          <img
            src={notebook.image}
            alt={notebook.title}
            className="w-32 h-32 object-cover rounded"
          />
        )}
      </div>

      {/* Rich Text Editor */}
      <ReactQuill
        value={content}
        onChange={handleContentChange}
        theme="snow"
        placeholder="Start typing your notes here..."
        className="mt-8"
        style={{ height: '500px' }}
      />
    </div>
  );
}
