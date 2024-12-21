"use client";

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import AddNotebook from "../components/AddNotebook";
import NotebookDisplay from "../components/NotebookDisplay";
import EditNotebook from "../components/EditNotebook";
import { useRouter } from "next/navigation";

export default function NotesPage() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [notebooks, setNotebooks] = useState([]);
  const [editNotebook, setEditNotebook] = useState(null);
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const fetchNotes = async () => {
    if (!token) {
      router.push("/login");
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/notes/list", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        console.error("Error fetching notes:", data.error);
        return;
      }
      setNotebooks(data.notes || []);
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

  useEffect(() => {
    fetchNotes(); // initial load
  }, [token]);

  const handleToggleNavbar = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    localStorage.setItem("navbarOpen", newState);
  };

  const handleEditNotebook = (notebook) => {
    setEditNotebook(notebook);
    setShowEdit(true);
  };

  const handleDeleteNotebook = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/notes/delete/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json();
        const errorMessage = errorData?.error || "Failed to delete note.";
        console.error("Error deleting note:", errorMessage);
        alert(errorMessage);
      } else {
        fetchNotes();
      }
    } catch (error) {
      console.error("Error deleting note:", error);
      alert("Failed to delete note. Please try again.");
    }
  };

  const handleSaveChanges = async (updatedNotebook) => {
    try {
      const res = await fetch(
        `http://localhost:5000/notes/update/${updatedNotebook.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: updatedNotebook.title,
            description: updatedNotebook.description,
            category: updatedNotebook.category,
          }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        const errorMessage = errorData?.error || "Failed to update note.";
        console.error("Error updating note:", errorMessage);
        alert(errorMessage);
      } else {
        fetchNotes();
      }
    } catch (error) {
      console.error("Error updating note:", error);
      alert("Failed to update note. Please try again.");
    }

    setShowEdit(false);
  };

  const handleClearNotebooks = () => {
    setNotebooks([]);
  };

  return (
    <div className="flex">
      <Navbar
        isOpen={isOpen}
        onToggle={handleToggleNavbar}
        activePage="notes"
      />
      <div
        className={`p-10 w-full bg-[#f9faf9] min-h-screen transition-all duration-300 ${
          isOpen ? "ml-64" : "ml-20"
        }`}
      >
        <h1 className="text-4xl font-bold">View Your Notebooks</h1>

        <div className="flex justify-between mt-6">
          <button
            className="border px-4 py-2 rounded bg-gray-100"
            onClick={() => alert("Sorting not yet implemented")}
          >
            Sort
          </button>
          <div className="flex gap-2">
            <button
              className="bg-green-500 text-white rounded px-4 py-2"
              onClick={() => setShowPopup(true)}
            >
              + Add New
            </button>
            <button
              className="bg-red-500 text-white rounded px-4 py-2"
              onClick={handleClearNotebooks}
            >
              Clear All
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 mt-10">
          {notebooks.length > 0 ? (
            notebooks.map((notebook) => (
              <NotebookDisplay
                key={notebook._id}
                id={notebook._id}
                title={notebook.title}
                description={notebook.description}
                category={notebook.subject_name}
                image_url={notebook.image_url} 
                generatedContent={notebook.generated_content}
                onEdit={() => handleEditNotebook(notebook)}
              />
            ))
          ) : (
            <p>No notebooks yet. Add a new notebook to get started.</p>
          )}
        </div>

        {showPopup && (
          <AddNotebook
            onCreateNotebook={fetchNotes}
            onClose={() => setShowPopup(false)}
          />
        )}
        {showEdit && editNotebook && (
          <EditNotebook
            notebook={editNotebook}
            onSaveChanges={handleSaveChanges}
            onDelete={() => handleDeleteNotebook(editNotebook._id)}
            onClose={() => setShowEdit(false)}
          />
        )}
      </div>
    </div>
  );
}
