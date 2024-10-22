import Image from 'next/image';
import Link from 'next/link';

export default function NotebookDisplay({ id, title, description, category, image, onEdit }) {
  return (
    <div className="relative group">
      {/* Notebook display area as a clickable link */}
      <Link href={`/notes/${id}`} passHref>
        <div className="bg-white shadow-lg rounded-lg p-8 text-center max-w-md mx-auto cursor-pointer group-hover:shadow-xl transform group-hover:scale-105 transition-all duration-300">
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
        </div>
      </Link>

      {/* Independent Edit button */}
      <button
        className="absolute top-4 right-4 text-xl bg-gray-200 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        onClick={(e) => {
          e.stopPropagation(); // Prevents the notebook from opening when clicking the "..."
          onEdit(id); // Trigger the edit function with the notebook ID
        }}
        onMouseEnter={(e) => e.stopPropagation()} // Ensure it doesn't trigger notebook hover effects
        onMouseLeave={(e) => e.stopPropagation()}
      >
        ...
      </button>
    </div>
  );
}
