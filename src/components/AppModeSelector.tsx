'use client';

import React from 'react';
import { useAppMode } from '@/contexts/AppModeContext';

export const AppModeSelector: React.FC = () => {
  const { setMode, isStudyMode, isTestMode } = useAppMode();

  return (
    <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
      <button
        onClick={() => setMode('study')}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
          isStudyMode
            ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
        }`}
      >
        📚 Study
      </button>
      <button
        onClick={() => setMode('test')}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
          isTestMode
            ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
        }`}
      >
        📝 Test Mode
      </button>
    </div>
  );
};