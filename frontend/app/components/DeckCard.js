import { useRouter } from 'next/navigation';
import { MdOutlineEdit } from 'react-icons/md';

const DeckCard = ({ _id, title, description }) => {
  const router = useRouter();

  const handleEdit = (e) => {
    e.stopPropagation();
    router.push(`/flashcards/edit/${_id}`);
  };

  return (
    <div 
      onClick={() => router.push(`/flashcards/view/${_id}`)}
      className="cursor-pointer bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 relative"
    >
      <button
        onClick={handleEdit}
        className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100"
      >
        <MdOutlineEdit size={20} />
      </button>
      <h3 className="text-2xl font-medium mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default DeckCard;
