// app/components/NotebookDisplay.js
import Link from 'next/link';
import { MdOutlineEdit } from 'react-icons/md';

export default function NotebookDisplay({ id, title, description, category, image_url, generatedContent, onEdit }) {
  return (
    <div className="relative group">
      <Link href={`/notes/${id}`} passHref>
        <div className="bg-white shadow-lg rounded-lg p-8 text-center max-w-md mx-auto cursor-pointer group-hover:shadow-xl transform group-hover:scale-105 transition-all duration-300">
          {image_url && (
            <img
              src={image_url}
              alt={title}
              className="w-48 h-48 object-cover mx-auto mb-6 rounded"
            />
          )}
          <h2 className="text-3xl font-bold mb-4">{title}</h2>
          <p className="text-xl text-gray-600 mb-4">{description}</p>
          <p className="text-lg text-gray-500 mb-4">{category}</p>

          {generatedContent && (
            <div className="mt-4 p-2 border rounded text-left overflow-auto max-h-40">
              <h3 className="text-xl font-semibold mb-2">Generated Notes:</h3>
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: generatedContent }}
              />
            </div>
          )}
        </div>
      </Link>

      <button
        className="absolute top-4 right-4 text-xl bg-gray-200 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        onClick={(e) => {
          e.stopPropagation();
          onEdit(id);
        }}
        onMouseEnter={(e) => e.stopPropagation()}
        onMouseLeave={(e) => e.stopPropagation()}
      >
        <MdOutlineEdit size={20} />
      </button>
    </div>
  );
}
