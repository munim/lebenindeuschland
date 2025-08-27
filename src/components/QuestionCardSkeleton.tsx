'use client';

import React from 'react';

interface QuestionCardSkeletonProps {
  showImageSkeleton?: boolean;
}

export const QuestionCardSkeleton: React.FC<QuestionCardSkeletonProps> = ({ 
  showImageSkeleton = false 
}) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
      {/* Question Header - matches QuestionCard exactly */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-32 shimmer"></div>
          <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg shimmer"></div>
          </div>
        </div>
        
        {/* Question Text - matches QuestionCard spacing */}
        <div className="space-y-2">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded shimmer"></div>
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-5/6 shimmer"></div>
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-4/6 shimmer"></div>
        </div>
      </div>

      {/* Image Skeleton - matches QuestionCard image section */}
      {showImageSkeleton && (
        <div className="mb-4">
          <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-lg shimmer"></div>
        </div>
      )}

      {/* Answer Options - matches QuestionCard exactly with min-h-[200px] */}
      <div className="flex flex-col gap-2 min-h-[200px]">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 min-h-[60px] transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 shimmer"></div>
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded shimmer"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 shimmer"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info Section - matches InfoToggle component structure */}
      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-20 shimmer"></div>
          <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded shimmer"></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200px 0;
          }
          100% {
            background-position: calc(200px + 100%) 0;
          }
        }

        .shimmer {
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent
          );
          background-size: 200px 100%;
          animation: shimmer 1.5s ease-in-out infinite;
        }

        .dark .shimmer {
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.1),
            transparent
          );
          background-size: 200px 100%;
        }
      `}</style>
    </div>
  );
};