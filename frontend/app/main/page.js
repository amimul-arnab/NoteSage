// frontend/app/main/page.js
"use client";
import { useState } from "react";
import Navbar from "../components/Navbar";
import SectionCard from "../components/SectionCard";
import AddNew from "../components/AddNew";

export default function MainPage() {
  const [isOpen, setIsOpen] = useState(true);

  const courses = [
    { title: 'Data Structures I', subtitle: 'For Data Structures CS211', progress: 61, href: '/flashcards/data-structures' },
    { title: 'Chem II', subtitle: 'For Chemistry II CHEM 104', progress: 24, href: '/flashcards/chemistry' }
  ];

  const handleToggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="flex">
      <Navbar isOpen={isOpen} onToggle={handleToggleNavbar} />
      <div className={`p-10 w-full bg-[#f9faf9] flex flex-col gap-20 transition-all duration-300 ${isOpen ? 'ml-64' : 'ml-20'}`}>
        <h1 className="text-6xl font-bold mb-12">
          Hello <span className="text-[#61cc03] font-bold">John Doe</span>
        </h1>

        {/* Continue Learning Section */}
        <section className="w-full mb-16">
          <h2 className="text-4xl mb-8">Continue Learning</h2>
          <div className="flex gap-8">
            <AddNew />
            {courses.map((course, index) => (
              <SectionCard key={index} {...course} />
            ))}
          </div>
        </section>

        {/* View Notes Section */}
        <section className="w-full mb-16">
          <h2 className="text-4xl mb-8">View Notes</h2>
          <div className="flex gap-8">
            <AddNew />
            {courses.map((course, index) => (
              <SectionCard key={index} title={course.title} subtitle={course.subtitle} href={`/notes/${course.title}`} />
            ))}
          </div>
        </section>

        {/* Test Yourself Section */}
        <section className="w-full">
          <h2 className="text-4xl mb-8">Test Yourself</h2>
          <div className="flex gap-8">
            <AddNew />
            {courses.map((course, index) => (
              <SectionCard key={index} title={course.title} subtitle={course.subtitle} isTest href={`/test/${course.title}`} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
