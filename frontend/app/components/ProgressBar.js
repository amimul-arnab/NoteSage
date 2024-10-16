// frontend/app/components/ProgressBar.js
"use client";

export default function ProgressBar({ progress }) {
  return (
    <div className="w-full bg-gray-300 rounded-full h-2 mt-2">
      <div className="bg-[#61cc03] h-2 rounded-full" style={{ width: `${progress}%` }}></div>
    </div>
  );
}
