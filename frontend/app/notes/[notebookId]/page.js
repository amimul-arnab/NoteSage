"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import NotebookPage from "../../components/NotebookPage";

export default function DynamicNotebookPage() {
  const params = useParams();
  const { notebookId } = params;
  const [notebook, setNotebook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  useEffect(() => {
    if (!notebookId) {
      setError("Notebook ID is missing.");
      setLoading(false);
      return;
    }

    const fetchNotebook = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/notes/get/${notebookId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to fetch notebook.");
          setLoading(false);
          return;
        }

        const foundNotebook = data.note;

        if (foundNotebook) {
          setNotebook({
            id: foundNotebook._id,
            title: foundNotebook.title,
            description: foundNotebook.description,
            category: foundNotebook.subject_name,
            image_url: foundNotebook.image_url, 
            generatedContent: foundNotebook.generated_content || "",
          });
        } else {
          setError("Notebook not found.");
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching notebook:", err);
        setError("An error occurred while fetching the notebook.");
        setLoading(false);
      }
    };

    fetchNotebook();
  }, [notebookId, token]);

  if (loading) {
    return (
      <div className="flex">
        <Navbar isOpen={true} onToggle={() => {}} activePage="notes" />
        <div className="p-10 w-full bg-[#f9faf9] min-h-screen flex items-center justify-center">
          <p>Loading notebook...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex">
        <Navbar isOpen={true} onToggle={() => {}} activePage="notes" />
        <div className="p-10 w-full bg-[#f9faf9] min-h-screen flex items-center justify-center">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!notebook) {
    return (
      <div className="flex">
        <Navbar isOpen={true} onToggle={() => {}} activePage="notes" />
        <div className="p-10 w-full bg-[#f9faf9] min-h-screen flex items-center justify-center">
          <p>Notebook not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Navbar isOpen={true} onToggle={() => {}} activePage="notes" />
      <main
        className="p-10 w-full bg-[#f9faf9] min-h-screen transition-all duration-300 ml-64"
      >
        <NotebookPage notebook={notebook} />
      </main>
    </div>
  );
}
