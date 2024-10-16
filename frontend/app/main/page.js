// frontend/app/main/page.js
"use client";
import Navbar from "../components/Navbar";
import SectionCard from "../components/SectionCard";
import AddNew from "../components/AddNew";

export default function MainPage() {
  const courses = [
    { title: 'Data Structures I', subtitle: 'For Data Structures CS211', progress: 61, href: '/flashcards/data-structures' },
    { title: 'Chem II', subtitle: 'For Chemistry II CHEM 104', progress: 24, href: '/flashcards/chemistry' }
  ];

  return (
    <div className="flex">
      <Navbar />
      <div className="p-10 w-full bg-[#f9faf9]">
        <h1 className="text-4xl font-bold mb-10">Hello <span className="text-[#61cc03]">John Doe</span></h1>

        {/* Continue Learning Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Continue Learning</h2>
          <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            <AddNew />
            {courses.map((course, index) => (
              <SectionCard key={index} {...course} />
            ))}
          </div>
        </section>

        {/* View Notes Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">View Notes</h2>
          <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            <AddNew />
            {courses.map((course, index) => (
              <SectionCard key={index} title={course.title} subtitle={course.subtitle} href={`/notes/${course.title}`} />
            ))}
          </div>
        </section>

        {/* Test Yourself Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Test Yourself</h2>
          <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
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
