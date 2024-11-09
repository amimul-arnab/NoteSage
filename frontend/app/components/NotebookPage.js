"use client";
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import MathExtension from './MathExtension';
import RichTextToolbar from './RichTextToolbar';

export default function NotebookPage() {
  const { notebookId } = useParams();
  const [notebook, setNotebook] = useState(null);
  const [content, setContent] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);
  const [selectionPosition, setSelectionPosition] = useState({ top: 0, left: 0 });
  const [toolbarActive, setToolbarActive] = useState(false);

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
    extensions: [StarterKit, Underline, Highlight, TextStyle, Color, MathExtension],
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

  const handleSelectionChange = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      const toolbarTop = rect.top + window.scrollY - 50;
      const toolbarLeft = rect.left + window.scrollX + rect.width / 2;

      setSelectionPosition({ top: toolbarTop, left: toolbarLeft });
      setShowToolbar(true);
    } else if (!toolbarActive) {
      setShowToolbar(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mouseup', handleSelectionChange);
    document.addEventListener('keyup', handleSelectionChange);

    return () => {
      document.removeEventListener('mouseup', handleSelectionChange);
      document.removeEventListener('keyup', handleSelectionChange);
    };
  }, [toolbarActive]);

  if (!notebook) {
    return <p>Notebook not found</p>;
  }

  if (!isClient || !editor) {
    return null;
  }

  return (
    <div className="p-10 bg-white min-h-screen relative">
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

      {showToolbar && (
        <div
          className="toolbar-container"
          style={{
            top: selectionPosition.top,
            left: selectionPosition.left,
            zIndex: 10,
            transform: 'translateX(-50%)',
          }}
        >
          <RichTextToolbar editor={editor} setToolbarActive={setToolbarActive} />
        </div>
      )}

      <div className="editor-container mt-6">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
