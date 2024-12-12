
"use client";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SettingsPage() {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedState = localStorage.getItem('navbarOpen');
    setIsOpen(storedState === 'true');

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleToggleNavbar = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    localStorage.setItem('navbarOpen', newState);
  };

  return (
    <div className="flex flex-col">
      {isMobile ? (
        <nav className="w-full bg-green-600 p-4 flex justify-between items-center">
          <button
            onClick={handleToggleNavbar}
            className="text-white text-lg font-bold"
          >
            ☰
          </button>
          <h1 className="text-white text-2xl font-bold">Settings</h1>
        </nav>
      ) : (
        <Navbar isOpen={isOpen} onToggle={handleToggleNavbar} activePage="settings" />
      )}

      <div
        className={`p-5 sm:p-10 w-full bg-[#f9faf9] transition-all duration-300 ${
          isMobile ? '' : isOpen ? 'ml-64' : 'ml-20'
        }`}
      >
        {!isMobile && <h1 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6">Settings</h1>}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-4">
          <Link href="/about" className="text-sm sm:text-base hover:underline">
            About Us
          </Link>
          <Link href="/privacy-policy" className="text-sm sm:text-base hover:underline">
            Privacy Policy
          </Link>
          <Link href="/terms-of-service" className="text-sm sm:text-base hover:underline">
            Terms of Service
          </Link>
          <Link href="/contact" className="text-sm sm:text-base hover:underline">
            Contact
          </Link>
        </div>

        <div className="mt-8 sm:mt-10">
          {/* User Profile Management */}
          <div className="mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4">Profile Settings</h2>
            <button className="text-base sm:text-lg font-medium text-green-600 hover:underline">Edit Profile</button>
          </div>

          {/* Theme Options */}
          <div className="mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4">Theme</h2>
            <select className="text-base sm:text-lg p-2 border rounded-md">
              <option value="light">Light Mode</option>
              <option value="dark">Dark Mode</option>
              <option value="system">System Default</option>
            </select>
          </div>

          {/* AI/Notes Settings */}
          <div className="mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4">AI Settings</h2>
            <div className="flex flex-col gap-2 sm:gap-4">
              <label className="text-base sm:text-lg">
                Note Detail Level:
                <select className="ml-2 p-2 border rounded-md">
                  <option value="concise">Concise</option>
                  <option value="detailed">Detailed</option>
                </select>
              </label>
              <label className="text-base sm:text-lg">
                Default Note Language:
                <select className="ml-2 p-2 border rounded-md">
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </label>
            </div>
          </div>

          {/* Integration and Upload Settings */}
          <div className="mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4">Integration</h2>
            <button className="text-base sm:text-lg font-medium text-green-600 hover:underline">Connect to Google Drive</button>
          </div>

          {/* Security Settings */}
          <div className="mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4">Security</h2>
            <button className="text-base sm:text-lg font-medium text-green-600 hover:underline">Enable Two-Factor Authentication</button>
          </div>

          {/* Notifications */}
          <div className="mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4">Notifications</h2>
            <label className="text-base sm:text-lg">
              <input type="checkbox" className="mr-2" />
              Email Notifications
            </label>
            <label className="text-base sm:text-lg">
              <input type="checkbox" className="mr-2" />
              Push Notifications
            </label>
          </div>

          {/* Feedback and Support */}
          <div className="mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4">Support</h2>
            <button className="text-base sm:text-lg font-medium text-green-600 hover:underline">Submit Feedback</button>
          </div>
        </div>
      </div>
    </div>
  );
}
