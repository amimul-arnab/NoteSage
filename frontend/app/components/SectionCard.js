// frontend/app/components/SectionCard.js
"use client";
import ProgressBar from './ProgressBar';
import Link from 'next/link';

export default function SectionCard({ title, subtitle, progress, isTest, href }) {
  return (
    <div className="transition-transform transform hover:scale-105 hover:shadow-2xl shadow-lg rounded-lg p-10 bg-white"
         style={{ boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)', width: '340px', height: '220px' }}>
      <Link href={href} className="block w-full flex flex-col items-center text-center">
        <h3 className="text-2xl font-bold">{title}</h3>
        <p className="text-gray-500 text-base">{subtitle}</p>
        {progress !== undefined && (
          <div className="w-full mt-4">
            <ProgressBar progress={progress} />
            <span className="block mt-2 text-sm text-gray-600">{progress}%</span>
          </div>
        )}
        {isTest && (
          <button className="bg-[#61cc03] text-white py-2 px-8 rounded-md font-semibold text-lg mt-6">Test Me</button>
        )}
      </Link>
    </div>
  );
}
