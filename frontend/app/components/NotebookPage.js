// "use client";

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import { useEditor, EditorContent } from '@tiptap/react';
// import StarterKit from '@tiptap/starter-kit';
// import Underline from '@tiptap/extension-underline';
// import Highlight from '@tiptap/extension-highlight';
// import TextStyle from '@tiptap/extension-text-style';
// import Color from '@tiptap/extension-color';
// import MathExtension from './MathExtension';

// export default function NotebookPage({ notebook }) {
//   const router = useRouter();
//   const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
//   const [content, setContent] = useState(notebook.generatedContent || '');
//   const [saving, setSaving] = useState(false);

//   const editor = useEditor({
//     extensions: [StarterKit, Underline, Highlight, TextStyle, Color, MathExtension],
//     content,
//     onUpdate: ({ editor }) => {
//       setContent(editor.getHTML());
//     },
//     editable: true,
//     editorProps: {
//       attributes: {
//         class: "prose prose-sm sm:prose lg:prose-lg xl:prose-xl m-5 focus:outline-none",
//       },
//     },
//   });

//   const handleSave = async () => {
//     if (!token) {
//       alert('You must be logged in to save.');
//       return;
//     }
//     setSaving(true);
//     try {
//       const res = await fetch(`http://localhost:5000/notes/update_generated_notes/${notebook.id}`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`
//         },
//         body: JSON.stringify({ generated_content: content })
//       });
//       const data = await res.json();
//       if (!res.ok) {
//         console.error('Error saving generated notes:', data.error);
//         alert('Failed to save changes.');
//       } else {
//         alert('Changes saved successfully!');
//       }
//     } catch (error) {
//       console.error('Error saving generated notes:', error);
//       alert('An error occurred while saving.');
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (!editor) {
//     return <div>Loading Editor...</div>;
//   }

//   const applyFormat = (command) => {
//     editor.chain().focus()[command]().run();
//   };

//   return (
//     <div className="relative min-h-screen bg-white p-4">
//       <div className="flex items-center justify-between mb-4">
//         <div className="space-x-4">
//           <Link href="/notes">
//             <button className="bg-gray-200 text-black px-4 py-2 rounded hover:bg-gray-300">Back</button>
//           </Link>
//           <button onClick={handleSave} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
//             {saving ? 'Saving...' : 'Save'}
//           </button>
//         </div>
//       </div>

//       <div className="mb-6">
//         <h1 className="text-4xl font-bold">{notebook.title}</h1>
//         <p className="text-lg text-gray-600">{notebook.description}</p>
//         <p className="text-md text-gray-500">{notebook.category}</p>
//         {notebook.image_url && (
//           <img
//             src={notebook.image_url}
//             alt={notebook.title}
//             className="w-32 h-32 object-cover rounded mt-4"
//           />
//         )}
//       </div>

//       {/* Permanent toolbar */}
//       <div className="flex items-center space-x-2 mb-4 bg-gray-100 p-2 rounded">
//         <button onClick={() => applyFormat('toggleBold')} className="px-2 py-1 hover:bg-gray-200">Bold</button>
//         <button onClick={() => applyFormat('toggleItalic')} className="px-2 py-1 hover:bg-gray-200">Italic</button>
//         <button onClick={() => applyFormat('toggleUnderline')} className="px-2 py-1 hover:bg-gray-200">Underline</button>
//         <button onClick={() => applyFormat('toggleStrike')} className="px-2 py-1 hover:bg-gray-200">Strike</button>
//         <button onClick={() => {
//           const url = prompt("Enter URL:");
//           if (url) editor.chain().focus().setLink({ href: url }).run();
//         }} className="px-2 py-1 hover:bg-gray-200">
//           Link
//         </button>
//       </div>

//       <div className="editor-container mt-6 bg-white p-4 rounded shadow prose max-w-none">
//         <EditorContent editor={editor} />
//       </div>
//     </div>
//   );
// }

// frontend/app/components/NotebookPage.js
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import MathExtension from './MathExtension';

export default function NotebookPage({ notebook }) {
  const router = useRouter();
  const token = typeof window !== 'undefined' ? localStorage.getItem("access_token") : null;
  const [content, setContent] = useState(notebook.generatedContent || '');
  const [saving, setSaving] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit, Underline, Highlight, TextStyle, Color, MathExtension],
    content,
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
    editable: true,
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose lg:prose-lg xl:prose-xl m-5 focus:outline-none",
      },
    },
  });

  const handleSave = async () => {
    if (!token) {
      alert('You must be logged in to save.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`http://localhost:5000/notes/update_generated_notes/${notebook.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ generated_content: content })
      });
      const data = await res.json();
      if (!res.ok) {
        console.error('Error saving generated notes:', data.error);
        alert('Failed to save changes.');
      } else {
        alert('Changes saved successfully!');
      }
    } catch (error) {
      console.error('Error saving generated notes:', error);
      alert('An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateFlashcards = async () => {
    if (!token) {
      alert('You must be logged in.');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/flashcards/generate_from_note', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ note_id: notebook.id })
      });
      const data = await res.json();
      if (!res.ok) {
        console.error('Error generating flashcards:', data.error);
        alert('Failed to generate flashcards.');
      } else {
        alert('Flashcards generated successfully!');
        router.push('/flashcards'); // Redirect to flashcards page
      }
    } catch (error) {
      console.error('Error generating flashcards:', error);
      alert('An error occurred while generating flashcards.');
    }
  };

  if (!editor) {
    return <div>Loading Editor...</div>;
  }

  const applyFormat = (command) => {
    editor.chain().focus()[command]().run();
  };

  return (
    <div className="relative min-h-screen bg-white p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="space-x-4">
          <Link href="/notes">
            <button className="bg-gray-200 text-black px-4 py-2 rounded hover:bg-gray-300">Back</button>
          </Link>
          <button onClick={handleSave} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={handleGenerateFlashcards}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Generate Flashcards
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h1 className="text-4xl font-bold">{notebook.title}</h1>
        <p className="text-lg text-gray-600">{notebook.description}</p>
        <p className="text-md text-gray-500">{notebook.category}</p>
        {notebook.image_url && (
          <img
            src={notebook.image_url}
            alt={notebook.title}
            className="w-32 h-32 object-cover rounded mt-4"
          />
        )}
      </div>

      {/* Permanent toolbar */}
      <div className="flex items-center space-x-2 mb-4 bg-gray-100 p-2 rounded">
        <button onClick={() => applyFormat('toggleBold')} className="px-2 py-1 hover:bg-gray-200">Bold</button>
        <button onClick={() => applyFormat('toggleItalic')} className="px-2 py-1 hover:bg-gray-200">Italic</button>
        <button onClick={() => applyFormat('toggleUnderline')} className="px-2 py-1 hover:bg-gray-200">Underline</button>
        <button onClick={() => applyFormat('toggleStrike')} className="px-2 py-1 hover:bg-gray-200">Strike</button>
        <button onClick={() => {
          const url = prompt("Enter URL:");
          if (url) editor.chain().focus().setLink({ href: url }).run();
        }} className="px-2 py-1 hover:bg-gray-200">
          Link
        </button>
      </div>

      <div className="editor-container mt-6 bg-white p-4 rounded shadow prose max-w-none">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
