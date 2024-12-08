"use client";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter();

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

  const handleLogout = async () => {
    const token = localStorage.getItem("access_token");
    if (token) {
      try {
        const response = await fetch("http://localhost:5000/auth/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });
        if (response.ok) {
          // Successfully logged out on backend
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          router.push("/login");
        } else {
          // Even if the backend logout fails, we can still clear tokens locally
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          router.push("/login");
        }
      } catch (error) {
        console.error("Logout error:", error);
        // Clear tokens and redirect anyway
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        router.push("/login");
      }
    } else {
      // No token found, just redirect to login
      router.push("/login");
    }
  };

  return (
    <div className="flex">
      <Navbar isOpen={isOpen} onToggle={handleToggleNavbar} activePage="settings" />
      <div className={`p-10 w-full bg-[#f9faf9] transition-all duration-300 ${marginLeft}`}>
        <h1 className="text-4xl font-bold mb-6">Settings</h1>
        <button
          onClick={handleLogout}
          className="px-6 py-3 bg-red-500 text-white rounded-full font-semibold hover:bg-red-600 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
