// /app/components/AddNotebook.js

import { useState } from 'react';

export default function AddNotebook({ onCreateNotebook, onClose }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);

  const handleSubmit = () => {
    if (title && category && description) {
      onCreateNotebook({ title, category, description, image });
      onClose(); // Close after adding
    } else {
      alert('Please fill out all fields.');
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result); // Store base64 encoded image
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-1/2 relative">
        <h2 className="text-2xl font-bold mb-4">Create Notebook</h2>
        <button onClick={onClose} className="absolute top-2 right-4">X</button>

        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border rounded p-2 w-full mb-4"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border rounded p-2 w-full mb-4"
        >
          <option value="">Category</option>
          <option value="English">English</option>
          <option value="Science">Science</option>
          <option value="Social Science">Social Science</option>
          <option value="Mathematics">Mathematics</option>
          <option value="History">History</option>
          <option value="Custom">Custom</option>
        </select>
        <input
          type="file"
          onChange={handleImageUpload}
          className="border rounded p-2 w-full mb-4"
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border rounded p-2 w-full mb-4"
        />

        <button
          className="bg-green-500 text-white py-2 px-4 rounded w-full"
          onClick={handleSubmit}
        >
          Generate Notes
        </button>
      </div>
    </div>
  );
}
