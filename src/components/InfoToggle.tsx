'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface InfoToggleProps {
  germanContext: string;
  translatedContext?: string;
  onContentToggle?: () => void;
  isContentToggled?: boolean;
}

export const InfoToggle: React.FC<InfoToggleProps> = ({ 
  germanContext, 
  translatedContext,
  onContentToggle,
  isContentToggled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { language } = useLanguage();

  const getDisplayText = () => {
    // If toggled and we have a translation, show it
    if (isContentToggled && translatedContext) {
      return translatedContext;
    }
    // Otherwise show the German text
    return germanContext;
  };

  const handleContentClick = () => {
    if (onContentToggle) {
      onContentToggle();
    }
  };

  return (
    <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
      >
        <span>Show Info</span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-96 opacity-100 mt-3' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <button
            onClick={handleContentClick}
            className="text-left w-full hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300"
          >
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed transition-all duration-300 transform hover:scale-[1.01]">
              {getDisplayText()}
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};