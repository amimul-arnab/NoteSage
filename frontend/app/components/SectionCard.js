// frontend/app/components/SectionCard.js
"use client";
import ProgressBar from './ProgressBar';
import Link from 'next/link';

export default function SectionCard({ title, subtitle, progress, isTest, href }) {
  return (
    <Link href={href} className="block w-full">
      <div className="bg-white p-10 rounded-lg shadow-lg flex flex-col items-center justify-center space-y-4 hover:shadow-xl transition-shadow duration-300">
        <h3 className="text-2xl font-bold text-center">{title}</h3>
        <p className="text-gray-500 text-center">{subtitle}</p>
        {progress !== undefined && (
          <div className="w-full mt-4">
            <ProgressBar progress={progress} />
            <span className="block text-center mt-2 text-sm text-gray-600">{progress}%</span>
          </div>
        )}
        {isTest && (
          <button className="bg-[#61cc03] text-white py-3 px-8 rounded-lg font-bold text-lg">Test Me</button>
        )}
      </div>
    </Link>
  );
}
