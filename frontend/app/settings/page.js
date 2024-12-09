"use client";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

  return (
    <div className="flex">
      <Navbar isOpen={isOpen} onToggle={handleToggleNavbar} activePage="settings" />
      <div className={`p-10 w-full bg-[#f9faf9] transition-all duration-300 ${marginLeft}`}>
        <h1 className="text-4xl font-bold mb-6">Settings</h1>
        <div className="flex flex-wrap justify-center gap-4 mb-4">
          <Link href="/about" className="hover:underline">
            About Us
          </Link>
          <Link href="/privacy-policy" className="hover:underline">
            Privacy Policy
          </Link>
          <Link href="/terms-of-service" className="hover:underline">
            Terms of Service
          </Link>
          <Link href="/contact" className="hover:underline">
            Contact
          </Link>
        </div>
      </div>
    </div>
  );
}
