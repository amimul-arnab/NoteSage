"use client";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import SectionCard from "../components/SectionCard";
import AddNew from "../components/AddNew";

export default function MainPage() {
  const [isOpen, setIsOpen] = useState(true);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const storedState = localStorage.getItem('navbarOpen');
    setIsOpen(storedState === 'true');
  }, []);

  const handleToggleNavbar = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    localStorage.setItem('navbarOpen', newState);
  };

  const marginLeft = isOpen ? 'ml-64' : 'ml-20';

  useEffect(() => {
    // Fetch user info from the Flask backend
    const token = localStorage.getItem("access_token");
    if (token) {
      fetch("http://localhost:5000/auth/me", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      })
        .then(res => res.json())
        .then(data => {
          if (data.full_name) {
            setUserName(data.full_name);
          } else if (data.email) {
            // If no full name provided, fallback to email username part
            setUserName(data.email.split("@")[0]);
          } else {
            // If no user data, set a default name
            setUserName("User");
          }
        })
        .catch(err => {
          console.error("Error fetching user data:", err);
          setUserName("User");
        });
    } else {
      // If no token, fallback name
      setUserName("User");
    }
  }, []);

  return (
    <div className="flex">
      <Navbar isOpen={isOpen} onToggle={handleToggleNavbar} activePage="home" />
      <div className={`p-10 w-full bg-[#f9faf9] flex flex-col gap-16 transition-all duration-300 ${marginLeft}`}>
        <h1 className="text-6xl font-bold mb-10">
          Hello <span className="text-[#61cc03] font-bold">{userName || "User"}</span>
        </h1>

        <section className="w-full">
          <h2 className="text-4xl mb-6">Continue Learning</h2>
          <div className="flex gap-8 overflow-visible flex-wrap">
            <AddNew />
            <SectionCard title="Data Structures I" subtitle="For Data Structures CS211" progress={61} href="/flashcards/data-structures" />
            <SectionCard title="Chem II" subtitle="For Chemistry II CHEM 104" progress={24} href="/flashcards/chemistry" />
          </div>
        </section>

        <section className="w-full">
          <h2 className="text-4xl mb-6">View Notes</h2>
          <div className="flex gap-8 overflow-visible flex-wrap">
            <AddNew />
            <SectionCard title="Data Structures I" subtitle="For Data Structures CS211" href="/notes/data-structures" />
            <SectionCard title="Chem II" subtitle="For Chemistry II CHEM 104" href="/notes/chemistry" />
          </div>
        </section>

        <section className="w-full">
          <h2 className="text-4xl mb-6">Test Yourself</h2>
          <div className="flex gap-8 overflow-visible flex-wrap">
            <AddNew />
            <SectionCard title="Data Structures I" subtitle="For Data Structures CS211" isTest href="/test/data-structures" />
            <SectionCard title="Chem II" subtitle="For Chemistry II CHEM 104" isTest href="/test/chemistry" />
          </div>
        </section>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .${marginLeft} {
            margin-left: 0;
          }
          .p-10 {
            padding: 1.5rem;
          }
          .text-6xl {
            font-size: 2.5rem;
          }
          .text-4xl {
            font-size: 1.75rem;
          }
        }
        @media (max-width: 480px) {
          .p-10 {
            padding: 1rem;
          }
          .text-6xl {
            font-size: 2rem;
          }
          .text-4xl {
            font-size: 1.5rem;
          }
          .flex {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
