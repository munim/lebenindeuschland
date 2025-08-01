'use client';

import React, { useState } from 'react';

interface InfoToggleProps {
  germanContext: string;
  translatedContext?: string;
  onContentToggle?: () => void;
  isContentToggled?: boolean;
  isTestMode?: boolean;
  testModeContentToggled?: boolean;
  showFeedback?: boolean;
}

export const InfoToggle: React.FC<InfoToggleProps> = ({ 
  germanContext, 
  translatedContext,
  onContentToggle,
  isContentToggled = false,
  isTestMode = false,
  testModeContentToggled = false,
  showFeedback = false
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const getDisplayText = () => {
    // In test mode, show translation if test mode content is toggled and answer has been selected
    if (isTestMode) {
      if (testModeContentToggled && showFeedback && translatedContext) {
        return translatedContext;
      }
      return germanContext;
    }
    
    // In study mode, if toggled and we have a translation, show it
    if (isContentToggled && translatedContext) {
      return translatedContext;
    }
    // Otherwise show the German text
    return germanContext;
  };

  const handleContentClick = () => {
    // Only allow content toggle in study mode
    if (!isTestMode && onContentToggle) {
      onContentToggle();
    }
  };

  return (
    <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
        aria-expanded={isOpen}
        aria-controls="info-content"
      >
        <span className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          {isOpen ? 'Hide Info' : 'Show Info'}
        </span>
        <svg
          className={`w-5 h-5 transition-transform duration-300 ease-in-out ${isOpen ? 'rotate-180' : 'rotate-0'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      <div
        id="info-content"
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isOpen ? 'max-h-[500px] opacity-100 mt-3' : 'max-h-0 opacity-0 mt-0'
        }`}
      >
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <button
            onClick={handleContentClick}
            className={`text-left w-full transition-all duration-300 rounded-md ${
              isTestMode ? '' : 'hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title={isTestMode ? undefined : "Click to toggle language"}
          >
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed transition-all duration-300">
              {getDisplayText()}
            </p>
          </button>
          {!isTestMode && translatedContext && (
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              💡 Click the text above to toggle language
            </div>
          )}
        </div>
      </div>
    </div>
  );
};