// /app/components/NotebookDisplay.js
import Image from 'next/image';
import Link from 'next/link';

export default function NotebookDisplay({ id, title, description, category, image, onEdit }) {
  return (
    <Link href={`/notes/${id}`} passHref>
      <div className="bg-white shadow-lg rounded-lg p-8 text-center max-w-md mx-auto relative cursor-pointer hover:shadow-xl transform hover:scale-105 transition-all duration-300">
        {image && (
          <Image
            src={image}
            alt={title}
            className="w-48 h-48 object-cover mx-auto mb-6"
            width={192}
            height={192}
          />
        )}
        <h2 className="text-3xl font-bold mb-4">{title}</h2>
        <p className="text-xl text-gray-600 mb-4">{description}</p>
        <p className="text-lg text-gray-500 mb-4">{category}</p>

        {/* Three dots for editing */}
        <button 
          className="absolute top-4 right-4 text-xl" 
          onClick={(e) => {
            e.stopPropagation(); // Prevents the notebook from opening when clicking the "..."
            onEdit(id); // Pass notebook ID to handle editing
          }}
        >
          ...
        </button>
      </div>
    </Link>
  );
}
