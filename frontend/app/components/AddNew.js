// frontend/app/components/AddNew.js
"use client";

export default function AddNew({ onClick }) {
  return (
    <div
      className="bg-transparent cursor-pointer flex flex-col items-center justify-center p-12 transition-transform duration-300 transform hover:scale-105 hover:shadow-lg overflow-visible"
      onClick={onClick}
    >
      <span className="text-7xl font-bold text-black">+</span>
      <p className="mt-4 text-xl font-semibold text-black">Add New</p>
    </div>
  );
}
