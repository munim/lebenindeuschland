'use client';

import React, { useState } from 'react';
import { TestModeToggle } from './TestModeToggle';
import { LanguageSelector } from './LanguageSelector';
import { ThemeToggle } from './ThemeToggle';
import { RandomizationToggle } from './RandomizationToggle';
import { KeyboardShortcutsButton } from './KeyboardShortcutsModal';
import { useSessionStats } from '@/contexts/SessionStatsContext';
import { useTestMode } from '@/contexts/TestModeContext';
import { useRandomization } from '@/contexts/RandomizationContext';

interface SettingsBarProps {
  onKeyboardShortcutsOpen: () => void;
}

export const SettingsBar: React.FC<SettingsBarProps> = ({ onKeyboardShortcutsOpen }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { isTestMode } = useTestMode();
  const { isEnabled: isRandomizationEnabled } = useRandomization();
  const { stats, getAccuracyPercentage, resetSession } = useSessionStats();

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
      {/* Settings Toggle Bar */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-4">
          {/* Desktop: Always show controls inline */}
          <div className="hidden lg:flex items-center space-x-4">
            <TestModeToggle />
            <RandomizationToggle />
            <LanguageSelector />
            <ThemeToggle />
          </div>

          {/* Tablet: Show compact controls */}
          <div className="hidden md:flex lg:hidden items-center space-x-3">
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-gray-600 dark:text-gray-400">Test:</span>
              <TestModeToggle />
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-gray-600 dark:text-gray-400">Random:</span>
              <div className="text-xs">
                {isRandomizationEnabled ? (
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded">On</span>
                ) : (
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">Off</span>
                )}
              </div>
            </div>
            <LanguageSelector />
            <ThemeToggle />
          </div>

          {/* Mobile: Show toggle button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Settings</span>
              <svg 
                className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Status indicators for mobile */}
          <div className="md:hidden flex items-center space-x-2">
            {isTestMode && (
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded">
                Test
              </span>
            )}
            {isRandomizationEnabled && (
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs rounded">
                🎲 Random
              </span>
            )}
          </div>
        </div>

        {/* Action buttons area (prepared for Start Test button) */}
        <div className="flex items-center space-x-3">
          {/* Session stats quick view on desktop/tablet */}
          {isTestMode && stats.total > 0 && (
            <div className="hidden sm:flex items-center space-x-2 text-sm">
              <span className="text-green-600 dark:text-green-400 font-medium">✓ {stats.correct}</span>
              <span className="text-red-600 dark:text-red-400 font-medium">✗ {stats.incorrect}</span>
              <span className={`font-medium ${
                getAccuracyPercentage() >= 80 ? 'text-green-600 dark:text-green-400' : 
                getAccuracyPercentage() >= 60 ? 'text-yellow-600 dark:text-yellow-400' : 
                'text-red-600 dark:text-red-400'
              }`}>({getAccuracyPercentage()}%)</span>
              <button
                onClick={resetSession}
                className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                title="Reset session"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          )}

          {/* Keyboard shortcuts button */}
          <KeyboardShortcutsButton onClickAction={onKeyboardShortcutsOpen} />

          {/* Space reserved for future "Start Test" button */}
          <div className="hidden lg:block">
            {/* Placeholder for Start Test button - will be added later */}
          </div>
        </div>
      </div>

      {/* Expanded mobile settings */}
      {isExpanded && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-700 p-4 space-y-4">
          {/* Test Mode */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Test Mode</span>
              <p className="text-xs text-gray-500 dark:text-gray-400">Hide answers to practice</p>
            </div>
            <TestModeToggle />
          </div>

          {/* Randomization */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Randomize Questions</span>
              <p className="text-xs text-gray-500 dark:text-gray-400">Shuffle question order</p>
            </div>
            <RandomizationToggle />
          </div>

          {/* Language */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Language</span>
              <p className="text-xs text-gray-500 dark:text-gray-400">Question language</p>
            </div>
            <LanguageSelector />
          </div>

          {/* Theme */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Theme</span>
              <p className="text-xs text-gray-500 dark:text-gray-400">Light or dark mode</p>
            </div>
            <ThemeToggle />
          </div>

          {/* Session stats in mobile expanded view */}
          {isTestMode && stats.total > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Session Stats</span>
                <button
                  onClick={resetSession}
                  className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                >
                  Reset
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
                  <div className="text-lg font-bold text-green-600 dark:text-green-400">{stats.correct}</div>
                  <div className="text-xs text-green-600 dark:text-green-400">Correct</div>
                </div>
                <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded">
                  <div className="text-lg font-bold text-red-600 dark:text-red-400">{stats.incorrect}</div>
                  <div className="text-xs text-red-600 dark:text-red-400">Incorrect</div>
                </div>
              </div>
              <div className="text-center mt-2">
                <span className={`text-sm font-medium ${
                  getAccuracyPercentage() >= 80 ? 'text-green-600 dark:text-green-400' : 
                  getAccuracyPercentage() >= 60 ? 'text-yellow-600 dark:text-yellow-400' : 
                  'text-red-600 dark:text-red-400'
                }`}>Accuracy: {getAccuracyPercentage()}%</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};