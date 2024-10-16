// frontend/app/components/AddNew.js
"use client";

export default function AddNew({ onClick }) {
  return (
    <div
      className="bg-white border border-gray-300 rounded-lg shadow-lg flex flex-col items-center justify-center p-8 cursor-pointer hover:shadow-xl transition-shadow duration-300"
      onClick={onClick}
    >
      <span className="text-6xl font-bold text-black">+</span>
      <p className="mt-4 text-lg font-semibold text-black">Add New</p>
    </div>
  );
}
