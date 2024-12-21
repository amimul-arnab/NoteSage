// import { useState } from 'react';

// export default function AddNotebook({ onClose, onCreateNotebook }) {
//   const [title, setTitle] = useState('');
//   const [subjectName, setSubjectName] = useState('');
//   const [description, setDescription] = useState('');
//   const [file, setFile] = useState(null);
//   const [generatedNotes, setGeneratedNotes] = useState(null);
//   const [noteId, setNoteId] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

//   const handleSubmit = async () => {
//     if (!title || !subjectName || !description || !file) {
//       alert('Please fill out all fields and select an image.');
//       return;
//     }

//     setLoading(true);

//     try {
//       // Create Subject
//       const subjectRes = await fetch('http://localhost:5000/subjects/create', {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ subject_name: subjectName.trim() })
//       });

//       const subjectData = await subjectRes.json();
//       if (!subjectRes.ok) {
//         console.error('Subject creation failed:', subjectData.error);
//         alert('Failed to create subject. Please try again.');
//         setLoading(false);
//         return;
//       }

//       const subject_id = subjectData.subject_id;

//       // Upload Note
//       const formData = new FormData();
//       formData.append('file', file);
//       formData.append('subject_id', subject_id);
//       formData.append('title', title);
//       formData.append('description', description);

//       const uploadRes = await fetch('http://localhost:5000/notes/upload', {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${token}`
//         },
//         body: formData
//       });

//       const uploadData = await uploadRes.json();
//       if (!uploadRes.ok) {
//         console.error('Upload failed:', uploadData.error);
//         alert('Failed to upload note. Please try again.');
//         setLoading(false);
//         return;
//       }

//       const uploadedNoteId = uploadData.note_id;
//       setNoteId(uploadedNoteId);

//       // Generate Notes
//       const generateRes = await fetch('http://localhost:5000/notes/generate', {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ note_id: uploadedNoteId })
//       });

//       const generateData = await generateRes.json();
//       if (!generateRes.ok) {
//         console.error('Generate failed:', generateData.error);
//         alert('Failed to generate notes. Please try again.');
//         setLoading(false);
//         return;
//       }

//       setGeneratedNotes(generateData.summary);
//       setLoading(false);

//       // Once notes are generated, refresh notes list
//       if (onCreateNotebook) {
//         await onCreateNotebook();
//       }

//     } catch (error) {
//       console.error('Error during process:', error);
//       alert('An error occurred. Check console for details.');
//       setLoading(false);
//     }
//   };

//   const handleImageUpload = (e) => {
//     const selectedFile = e.target.files[0];
//     setFile(selectedFile);
//   };

//   return (
//     <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
//       <div className="bg-white p-6 rounded-lg w-1/2 relative">
//         <h2 className="text-2xl font-bold mb-4">Create Notebook & Generate Notes</h2>
//         <button onClick={onClose} className="absolute top-2 right-4 text-xl">X</button>

//         <input
//           type="text"
//           placeholder="Title"
//           value={title}
//           onChange={(e) => setTitle(e.target.value)}
//           className="border rounded p-2 w-full mb-4"
//         />
//         <input
//           type="text"
//           placeholder="Subject Name"
//           value={subjectName}
//           onChange={(e) => setSubjectName(e.target.value)}
//           className="border rounded p-2 w-full mb-4"
//         />
//         <input
//           type="file"
//           onChange={handleImageUpload}
//           className="border rounded p-2 w-full mb-4"
//           accept="image/*"
//         />
//         <textarea
//           placeholder="Description"
//           value={description}
//           onChange={(e) => setDescription(e.target.value)}
//           className="border rounded p-2 w-full mb-4"
//         />

//         {!generatedNotes && !noteId && (
//           <button
//             className="bg-green-500 text-white py-2 px-4 rounded w-full"
//             onClick={handleSubmit}
//             disabled={loading}
//           >
//             {loading ? 'Processing...' : 'Create Subject & Generate Notes'}
//           </button>
//         )}

//         {noteId && !generatedNotes && (
//           <p className="text-center text-gray-600">Generating notes, please wait...</p>
//         )}

//         {generatedNotes && (
//           <div className="mt-4 p-4 border rounded overflow-auto max-h-80">
//             <h3 className="text-xl font-semibold mb-2">Generated Notes:</h3>
//             <div
//               className="prose max-w-none"
//               dangerouslySetInnerHTML={{ __html: generatedNotes }}
//             />
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


import { useState } from 'react';

export default function AddNotebook({ onClose, onCreateNotebook }) {
  const [title, setTitle] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [coverImage, setCoverImage] = useState(null); // New state for cover image
  const [generatedNotes, setGeneratedNotes] = useState(null);
  const [noteId, setNoteId] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  const handleSubmit = async () => {
    if (!title || !subjectName || !description || !file) {
      alert('Please fill out all fields and select an image file for the main note.');
      return;
    }

    setLoading(true);
    try {
      // Create Subject
      const subjectRes = await fetch('http://localhost:5000/subjects/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ subject_name: subjectName.trim() })
      });

      const subjectData = await subjectRes.json();
      if (!subjectRes.ok) {
        console.error('Subject creation failed:', subjectData.error);
        alert('Failed to create subject. Please try again.');
        setLoading(false);
        return;
      }

      const subject_id = subjectData.subject_id;

      // Upload Note
      const formData = new FormData();
      formData.append('file', file);
      formData.append('subject_id', subject_id);
      formData.append('title', title);
      formData.append('description', description);

      if (coverImage) {
        formData.append('cover_image', coverImage);
      }

      const uploadRes = await fetch('http://localhost:5000/notes/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        console.error('Upload failed:', uploadData.error);
        alert('Failed to upload note. Please try again.');
        setLoading(false);
        return;
      }

      const uploadedNoteId = uploadData.note_id;
      setNoteId(uploadedNoteId);

      // Generate Notes
      const generateRes = await fetch('http://localhost:5000/notes/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ note_id: uploadedNoteId })
      });

      const generateData = await generateRes.json();
      if (!generateRes.ok) {
        console.error('Generate failed:', generateData.error);
        alert('Failed to generate notes. Please try again.');
        setLoading(false);
        return;
      }

      setGeneratedNotes(generateData.summary);
      setLoading(false);

      // Refresh notes list
      if (onCreateNotebook) {
        await onCreateNotebook();
      }

    } catch (error) {
      console.error('Error during process:', error);
      alert('An error occurred. Check console for details.');
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const handleCoverImageUpload = (e) => {
    const selectedCoverImage = e.target.files[0];
    setCoverImage(selectedCoverImage);
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-1/2 relative">
        <h2 className="text-2xl font-bold mb-4">Create Notebook & Generate Notes</h2>
        <button onClick={onClose} className="absolute top-2 right-4 text-xl">X</button>
  
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border rounded p-2 w-full mb-4"
        />
        <input
          type="text"
          placeholder="Subject Name"
          value={subjectName}
          onChange={(e) => setSubjectName(e.target.value)}
          className="border rounded p-2 w-full mb-4"
        />
  
        {/* Add a label or helper text for the main note image */}
        <label className="block font-semibold mb-2">
          Upload the main note image (for OCR extraction):
        </label>
        <input
          type="file"
          onChange={handleImageUpload}
          className="border rounded p-2 w-full mb-4"
          accept="image/*"
        />
  
        {/* Add a label or helper text for the cover image */}
        <label className="block font-semibold mb-2">
          Upload a cover image (optional, displayed as thumbnail):
        </label>
        <input
          type="file"
          onChange={handleCoverImageUpload}
          className="border rounded p-2 w-full mb-4"
          accept="image/*"
        />
  
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border rounded p-2 w-full mb-4"
        />
  
        {!generatedNotes && !noteId && (
          <button
            className="bg-green-500 text-white py-2 px-4 rounded w-full"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Create Subject & Generate Notes'}
          </button>
        )}
  
        {noteId && !generatedNotes && (
          <p className="text-center text-gray-600">Generating notes, please wait...</p>
        )}
  
        {generatedNotes && (
          <div className="mt-4 p-4 border rounded overflow-auto max-h-80">
            <h3 className="text-xl font-semibold mb-2">Generated Notes:</h3>
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: generatedNotes }}
            />
          </div>
        )}
      </div>
    </div>
  );  
}
