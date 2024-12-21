'use client';

import { motion } from "framer-motion";

const ProgressBar = ({ 
  totalCards = 0,
  learnedCount = 0, 
  masteredCount = 0,
  showLabels = true,
  className = ""
}) => {
  // Calculate percentages
  const learnedPercent = totalCards > 0 ? (learnedCount / totalCards) * 100 : 0;
  const masteredPercent = totalCards > 0 ? (masteredCount / totalCards) * 100 : 0;

  return (
    <div className={`w-full ${className} px-2 sm:px-4`}> {/* Added padding for mobile spacing */}
      {/* Progress Stats */}
      {showLabels && (
        <div className="flex flex-wrap justify-between text-[10px] sm:text-sm text-gray-600 mb-2">
          <div className="flex items-center mb-1 sm:mb-0">
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-blue-400 mr-2" />
            <span>{Math.round(learnedPercent)}% Learned</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-[#61cc03] mr-2" />
            <span>{Math.round(masteredPercent)}% Mastered</span>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div 
        className={`rounded-full overflow-hidden ${
          totalCards > 0 ? "h-4 sm:h-6" : "h-2" /* Dynamically adjust height */
        } bg-gray-200`}
      >
        <div className="relative w-full h-full">
          {/* Base Layer (Gray) */}
          <div className="absolute inset-0 bg-gray-200" />

          {/* Learned Layer (Blue) */}
          <motion.div
            className="absolute h-full bg-blue-400"
            initial={{ width: 0 }}
            animate={{ width: `${learnedPercent}%` }}
            transition={{
              duration: 0.5,
              ease: "easeOut",
              type: "spring",
              stiffness: 100,
            }}
            style={{
              width: learnedPercent > 100 ? "100%" : `${learnedPercent}%`, // Ensure it doesn't overflow
              height: '100%' /* Full height adjustment */,
            }}
          />

          {/* Mastered Layer (Green) */}
          <motion.div
            className="absolute h-full bg-[#61cc03]"
            initial={{ width: 0 }}
            animate={{ width: `${masteredPercent}%` }}
            transition={{
              duration: 0.5,
              ease: "easeOut",
              type: "spring",
              stiffness: 100,
            }}
            style={{
              width: masteredPercent > 100 ? "100%" : `${masteredPercent}%`, // Ensure it doesn't overflow
              height: '100%' /* Full height adjustment */,
            }}
          />
        </div>
      </div>

      {/* Optional: Total Cards Count */}
      {showLabels && (
        <div className="text-[10px] sm:text-xs text-gray-500 mt-1 text-right">
          Total Cards: {totalCards}
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
