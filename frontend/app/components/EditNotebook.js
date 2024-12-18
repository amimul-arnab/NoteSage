"use client";
import { useState } from 'react';

export default function EditNotebook({ notebook, onSaveChanges, onDelete, onClose }) {
  const [title, setTitle] = useState(notebook.title);
  const [category, setCategory] = useState(notebook.category);
  const [description, setDescription] = useState(notebook.description);
  const [image, setImage] = useState(notebook.image);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result); // Store base64 image string
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    // Ensure the ID is not changed
    const updatedNotebook = {
      ...notebook, // Spread notebook to keep ID
      title,
      category,
      description,
      image,
    };
    onSaveChanges(updatedNotebook); // Save the updated notebook
    onClose(); // Close modal after save
  };

  const handleDelete = () => {
    onDelete(notebook.id); // Trigger delete
    onClose(); // Close modal after delete
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-1/2 relative">
        <h2 className="text-2xl font-bold mb-4">Edit Notebook</h2>
        <button onClick={onClose} className="absolute top-2 right-4 text-xl">X</button>

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
        
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border rounded p-2 w-full mb-4"
        />

        <input type="file" onChange={handleImageUpload} className="border rounded p-2 w-full mb-4" />
        
        <button 
          className="bg-green-500 text-white py-2 px-4 rounded w-full mb-4" 
          onClick={handleSave}
        >
          Save Changes
        </button>

        <button 
          className="bg-red-500 text-white py-2 px-4 rounded w-full" 
          onClick={handleDelete}
        >
          Delete Notebook
        </button>
      </div>
    </div>
  );
}
