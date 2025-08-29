'use client';

import React, { useEffect } from 'react';
import { TestModeToggle } from './TestModeToggle';
import { LanguageSelector } from './LanguageSelector';
import { ThemeToggle } from './ThemeToggle';
import { useRandomization } from '@/contexts/RandomizationContext';
import { useSessionStats } from '@/contexts/SessionStatsContext';
import { useTestMode } from '@/contexts/TestModeContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { isEnabled: isRandomizationEnabled, toggleRandomization } = useRandomization();
  const { stats, getAccuracyPercentage, getSessionDuration, resetSession } = useSessionStats();
  const { isTestMode } = useTestMode();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Bottom Sheet */}
      <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-xl shadow-2xl transform transition-transform duration-300 ease-out">
        {/* Handle */}
        <div className="flex justify-center pt-4 pb-2">
          <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
        </div>
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Settings
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close settings"
          >
            <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Test Mode */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">
                Test Mode
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Hide answers to practice
              </p>
            </div>
            <TestModeToggle />
          </div>
          
          {/* Language */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">
                Language
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Question language
              </p>
            </div>
            <div className="min-w-0 flex-shrink-0">
              <LanguageSelector />
            </div>
          </div>
          
          {/* Theme */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">
                Theme
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Light or dark mode
              </p>
            </div>
            <ThemeToggle />
          </div>
          
          {/* Randomization */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">
                Randomize Questions
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Shuffle question order each session
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={isRandomizationEnabled}
                onChange={(e) => toggleRandomization(e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          {/* Session Stats (only in test mode) */}
          {isTestMode && stats.total > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">
                    Session Statistics
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Current test session performance
                  </p>
                </div>
                <button
                  onClick={resetSession}
                  className="px-3 py-1 text-sm bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                >
                  Reset
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.correct}</div>
                  <div className="text-sm text-green-600 dark:text-green-400">Correct</div>
                </div>
                <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.incorrect}</div>
                  <div className="text-sm text-red-600 dark:text-red-400">Incorrect</div>
                </div>
              </div>
              
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Accuracy: <span className={`font-medium ${
                  getAccuracyPercentage() >= 80 ? 'text-green-600 dark:text-green-400' : 
                  getAccuracyPercentage() >= 60 ? 'text-yellow-600 dark:text-yellow-400' : 
                  'text-red-600 dark:text-red-400'
                }`}>{getAccuracyPercentage()}%</span></span>
                <span>Duration: {getSessionDuration()} min</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Safe area for mobile devices */}
        <div className="h-safe-area-inset-bottom" />
      </div>
    </div>
  );
};

export const SettingsButton: React.FC<{ onClickAction: () => void }> = ({ onClickAction }) => {
  return (
    <button
      onClick={onClickAction}
      className="p-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
      aria-label="Open settings"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    </button>
  );
};