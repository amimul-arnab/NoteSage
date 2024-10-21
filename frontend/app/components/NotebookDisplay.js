import Image from 'next/image';
import Link from 'next/link';

export default function NotebookDisplay({ id, title, description, category, image }) {
  return (
    <Link href={`/notes/${id}`}>
      <div className="bg-white shadow-lg rounded-lg p-8 text-center max-w-md mx-auto cursor-pointer">
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
        <p className="text-lg text-gray-500">{category}</p>
      </div>
    </Link>
  );
}
