"use client"; // Ensure client-side rendering
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import MathExtension from './MathExtension';

export default function NotebookPage() {
  const { notebookId } = useParams();
  const [notebook, setNotebook] = useState(null);
  const [content, setContent] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const savedNotebooks = JSON.parse(localStorage.getItem('notebooks')) || [];
      const currentNotebook = savedNotebooks.find((nb) => nb.id === notebookId);

      if (currentNotebook) {
        setNotebook(currentNotebook);
        setContent(localStorage.getItem(`notebook-${notebookId}`) || '');
      }
    }
  }, [notebookId, isClient]);

  const editor = useEditor({
    extensions: [StarterKit, MathExtension],
    content: content,
    onUpdate: ({ editor }) => {
      try {
        const html = editor.getHTML();
        setContent(html);
        localStorage.setItem(`notebook-${notebookId}`, html);
      } catch (error) {
        console.error("Error updating content:", error);
      }
    },
    editable: true,
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose lg:prose-lg xl:prose-xl m-5 focus:outline-none",
      },
    },
    immediatelyRender: false,
  });

  if (!notebook) {
    return <p>Notebook not found</p>;
  }

  if (!isClient || !editor) {
    return null;
  }

  const insertMath = () => {
    const latex = prompt("Enter LaTeX expression:");
    if (latex) {
      editor.chain().focus().insertMath(latex).run();
    }
  };

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

      <button onClick={insertMath} className="btn btn-primary mb-4">Insert Math</button>
      <div className="editor-container mt-6">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
