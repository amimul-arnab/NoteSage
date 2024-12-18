import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { motion } from 'framer-motion';

export default function AddNotebook({ onCreateNotebook, onClose }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [image, setImage] = useState(null);
  const [fileError, setFileError] = useState('');
  const [imageError, setImageError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    const allowedFormats = ['pdf', 'docx', 'pptx', 'xlsx', 'txt', 'jpeg', 'png'];
    const maxFileSize = 10 * 1024 * 1024; // 10MB

    if (selectedFile) {
      const fileExtension = selectedFile.name.split('.').pop().toLowerCase();

      if (!allowedFormats.includes(fileExtension)) {
        setFileError('Unsupported file format. Allowed formats: PDF, DOCX, PPTX, XLSX, TXT, JPEG, PNG.');
        setFile(null);
        return;
      }

      if (selectedFile.size > maxFileSize) {
        setFileError('File size cannot exceed 10MB.');
        setFile(null);
        return;
      }

      setFileError('');
      setFile(selectedFile);
    }
  };

  const handleImageChange = (e) => {
    const selectedImage = e.target.files[0];
    const allowedFormats = ['jpeg', 'png'];
    const maxFileSize = 5 * 1024 * 1024; // 5MB

    if (selectedImage) {
      const fileExtension = selectedImage.name.split('.').pop().toLowerCase();

      if (!allowedFormats.includes(fileExtension)) {
        setImageError('Unsupported image format. Allowed formats: JPEG, PNG.');
        setImage(null);
        return;
      }

      if (selectedImage.size > maxFileSize) {
        setImageError('Image size cannot exceed 5MB.');
        setImage(null);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(selectedImage);

      setImageError('');
    }
  };

  const handleSubmit = () => {
    if (!title || !category || !description) {
      alert('Please fill out all fields.');
      return;
    }

    if (fileError || imageError) {
      alert('Please fix the file or image errors before submitting.');
      return;
    }

    setIsLoading(true);
    setProgress(0);
    setError(null);

    // Simulating progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          if (error) {
            setProgress(100);
            return;
          }
          setTimeout(() => {
            setIsLoading(false);
            onCreateNotebook({ id: uuidv4(), title, category, description, file, image });
            onClose();
          }, 2000); // Delay to show success message
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg w-1/3 relative text-center">
          <h2
            className={`text-xl font-bold mb-4 ${error ? 'text-red-500' : 'text-[#61cc03]'}`}
          >
            {error ? 'ERROR' : progress === 100 ? 'Success!' : 'Generating Notes...'}
          </h2>
          <motion.div
            className={`h-4 rounded-full ${error ? 'bg-red-500' : progress === 100 ? 'bg-[#61cc03]' : 'bg-gray-300'}`}
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          ></motion.div>
          <p className={`mt-4 ${error ? 'text-red-500' : 'text-gray-600'}`}>
            {error ? 'Failed to generate notes' : progress === 100 ? 'Success!' : `Progress: ${progress}%`}
          </p>
        </div>
      </div>
    );
  }

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

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border rounded p-2 w-full mb-4"
        />

        <div className="mb-4">
          <label className="block mb-2 font-medium">Upload Notes (Optional)</label>
          <input
            type="file"
            accept=".pdf,.docx,.pptx,.xlsx,.txt,.jpeg,.png"
            onChange={handleFileChange}
            className="border rounded p-2 w-full"
          />
          {fileError && (
            <p className="text-red-500 text-sm mt-2">{fileError}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-medium">Upload Image (Optional)</label>
          <input
            type="file"
            accept=".jpeg,.png"
            onChange={handleImageChange}
            className="border rounded p-2 w-full"
          />
          {imageError && (
            <p className="text-red-500 text-sm mt-2">{imageError}</p>
          )}
        </div>

        {image && (
          <div className="mb-4 text-center">
            <img
              src={image}
              alt="Uploaded preview"
              className="inline-block max-w-full max-h-32 border rounded"
            />
          </div>
        )}

        <button
          className="bg-green-500 text-white py-2 px-4 rounded w-full"
          onClick={handleSubmit}
        >
          Create Notebook
        </button>
      </div>
    </div>
  );
}
