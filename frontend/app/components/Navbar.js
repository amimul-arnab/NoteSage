"use client";
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import HomeIcon from '../assets/home.png';
import NotesIcon from '../assets/notes.png';
import FlashcardIcon from '../assets/flashcard.png';
import TestIcon from '../assets/exam.png';
import SettingsIcon from '../assets/profile.png';
import LogoLight from '../assets/logo/NoteSageLogo_Light.png';
import LogoutIcon from '../assets/logout.png';
import { useRouter } from "next/navigation";
import { motion } from "motion/react";

export default function Navbar({ activePage }) {
  const [isMobile, setIsMobile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (token) {
        await fetch("http://localhost:5000/auth/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });
      }
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      router.push("/login");
    }
  };

  if (isMobile) {
    return (
      <>
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="fixed top-4 right-4 z-50 bg-white rounded-full p-2 shadow-lg"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className={`
          fixed inset-0 bg-white/80 backdrop-blur-sm transition-all duration-300 z-40
          ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}>
          <div className={`
            fixed top-0 right-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300
            ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}
          `}>
            <div className="p-4 flex justify-center border-b">
              <Image
                src={LogoLight}
                alt="NoteSage Logo"
                width={120}
                height={40}
                className="object-contain"
              />
            </div>

            <nav className="p-4 space-y-4">
              <Link href="/main" 
                className={`flex items-center space-x-4 p-2 rounded-lg ${activePage === 'home' ? 'bg-[#61cc03] text-white' : 'hover:bg-gray-100'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Image src={HomeIcon} alt="Home" width={24} height={24} className={activePage === 'home' ? 'invert' : ''} />
                <span>Home</span>
              </Link>

              <Link href="/notes"
                className={`flex items-center space-x-4 p-2 rounded-lg ${activePage === 'notes' ? 'bg-[#61cc03] text-white' : 'hover:bg-gray-100'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Image src={NotesIcon} alt="Notes" width={24} height={24} className={activePage === 'notes' ? 'invert' : ''} />
                <span>Notes</span>
              </Link>

              <Link href="/flashcards"
                className={`flex items-center space-x-4 p-2 rounded-lg ${activePage === 'flashcards' ? 'bg-[#61cc03] text-white' : 'hover:bg-gray-100'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Image src={FlashcardIcon} alt="Flashcards" width={24} height={24} className={activePage === 'flashcards' ? 'invert' : ''} />
                <span>Flashcards</span>
              </Link>

              <Link href="/test"
                className={`flex items-center space-x-4 p-2 rounded-lg ${activePage === 'test' ? 'bg-[#61cc03] text-white' : 'hover:bg-gray-100'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Image src={TestIcon} alt="Test" width={24} height={24} className={activePage === 'test' ? 'invert' : ''} />
                <span>Test</span>
              </Link>

              <Link href="/settings"
                className={`flex items-center space-x-4 p-2 rounded-lg ${activePage === 'settings' ? 'bg-[#61cc03] text-white' : 'hover:bg-gray-100'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Image src={SettingsIcon} alt="Settings" width={24} height={24} className={activePage === 'settings' ? 'invert' : ''} />
                <span>Settings</span>
              </Link>

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center space-x-4 p-2 rounded-lg hover:bg-gray-100 w-full"
              >
                <Image src={LogoutIcon} alt="Logout" width={24} height={24} />
                <span>Logout</span>
              </button>
            </nav>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="h-screen w-20 bg-gradient-to-b from-white to-[#61cc03] flex flex-col fixed top-0 left-0 z-50">
      <Link href="/main">
        <div className="flex flex-col items-center p-4 bg-white">
          <Image
            src={LogoLight}
            alt="NoteSage Logo"
            width={60}
            height={60}
            className="object-contain mb-1"
          />
        </div>
      </Link>

      <nav className="flex-1 mt-6 flex flex-col space-y-4 bg-[#61cc03]">
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
          <Link href="/main" className={`flex items-center px-6 py-3 text-white ${activePage === 'home' && 'bg-[#a1e194]'}`}>
            <Image src={HomeIcon} alt="Home" width={30} height={30} className="invert" />
          </Link>
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
          <Link href="/notes" className={`flex items-center px-6 py-3 text-white ${activePage === 'notes' && 'bg-[#a1e194]'}`}>
            <Image src={NotesIcon} alt="Notes" width={30} height={30} className="invert" />
          </Link>
        </motion.div>

        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
          <Link href="/flashcards" className={`flex items-center px-6 py-3 text-white ${activePage === 'flashcards' && 'bg-[#a1e194]'}`}>
            <Image src={FlashcardIcon} alt="Flashcards" width={30} height={30} className="invert" />
          </Link>
        </motion.div>

        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
          <Link href="/test" className={`flex items-center px-6 py-3 text-white ${activePage === 'test' && 'bg-[#a1e194]'}`}>
            <Image src={TestIcon} alt="Test" width={30} height={30} className="invert" />
          </Link>
        </motion.div>

        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
          <Link href="/settings" className={`flex items-center px-6 py-3 text-white ${activePage === 'settings' && 'bg-[#a1e194]'}`}>
            <Image src={SettingsIcon} alt="Settings" width={30} height={30} className="invert" />
          </Link>
        </motion.div>

        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
          <button
            onClick={handleLogout}
            className={`flex items-center px-6 py-3 text-white ${activePage === 'logout' && 'bg-[#a1e194]'}`}
          >
            <Image src={LogoutIcon} alt="Logout" width={30} height={30} className="invert" />
          </button>
        </motion.div>
      </nav>
    </div>
  );
}




