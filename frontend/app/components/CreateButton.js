// frontend/app/components/CreateButton.js
"use client";

export default function CreateButton({ onClick }) {
  return (
    <div className="flex items-center justify-center w-16 h-16 bg-white rounded-lg border border-gray-300 cursor-pointer" onClick={onClick}>
      <span className="text-3xl font-bold text-[#61cc03]">+</span>
    </div>
  );
}
