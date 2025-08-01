'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTestMode } from '@/contexts/TestModeContext';
import { Language } from '@/types/question';

const LANGUAGE_OPTIONS: { value: Language; label: string }[] = [
  { value: 'de', label: 'Deutsch' },
  { value: 'en', label: 'English' },
  { value: 'tr', label: 'Türkçe' },
];

export const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const { isTestMode } = useTestMode();

  return (
    <select
      value={language}
      onChange={(e) => setLanguage(e.target.value as Language)}
      disabled={isTestMode}
      className={`px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
        isTestMode ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {LANGUAGE_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};