'use client';

import React from 'react';
import { useSessionStats } from '@/contexts/SessionStatsContext';
import { useTestMode } from '@/contexts/TestModeContext';

export const SessionStatsBadge: React.FC = () => {
  const { stats, getAccuracyPercentage, resetSession } = useSessionStats();
  const { isTestMode } = useTestMode();

  // Only show in test mode and when there are some answers recorded
  if (!isTestMode || stats.total === 0) {
    return null;
  }

  const accuracy = getAccuracyPercentage();

  return (
    <div className="fixed top-4 right-4 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg px-3 py-2 text-sm">
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <span className="flex items-center text-green-600 dark:text-green-400">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            {stats.correct}
          </span>
          <span className="flex items-center text-red-600 dark:text-red-400">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            {stats.incorrect}
          </span>
        </div>
        <div className={`font-medium ${
          accuracy >= 80 ? 'text-green-600 dark:text-green-400' : 
          accuracy >= 60 ? 'text-yellow-600 dark:text-yellow-400' : 
          'text-red-600 dark:text-red-400'
        }`}>
          {accuracy}%
        </div>
        <button
          onClick={resetSession}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          title="Reset session stats"
          aria-label="Reset session stats"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </div>
  );
};