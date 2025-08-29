'use client';

import React, { useState } from 'react';
import { StateSelector } from './StateSelector';
import { useTestSession } from '@/hooks/useTestSession';
import { useLanguage } from '@/contexts/LanguageContext';

interface TestSetupViewProps {
  onTestStart?: () => void;
  onCancel?: () => void;
}

export const TestSetupView: React.FC<TestSetupViewProps> = ({
  onTestStart,
  onCancel
}) => {
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const { startTestWithConfig, isLoading, error } = useTestSession();
  const { language } = useLanguage();

  const handleStartTest = async () => {
    try {
      await startTestWithConfig(selectedState || undefined);
      onTestStart?.();
    } catch (error) {
      console.error('Failed to start test:', error);
    }
  };

  const handleStateChange = (stateCode: string | null) => {
    setSelectedState(stateCode);
  };

  const getStateDisplayText = () => {
    if (selectedState) {
      return `State-specific test for ${selectedState}`;
    }
    return 'General test with random state questions';
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 shadow-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            🎯 Start New Test
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Configure your practice test settings
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
            <p className="text-red-800 dark:text-red-200 text-sm">
              ⚠️ {error}
            </p>
          </div>
        )}

        <div className="space-y-6">
          {/* Test Information */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-gray-50 dark:bg-gray-700/50">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
              📋 Test Format
            </h3>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex justify-between">
                <span>Total Questions:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">33</span>
              </div>
              <div className="flex justify-between">
                <span>General Questions:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">23</span>
              </div>
              <div className="flex justify-between">
                <span>State Questions:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">10</span>
              </div>
              <div className="flex justify-between">
                <span>Passing Score:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">30/33 correct</span>
              </div>
              <div className="flex justify-between">
                <span>Language:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100 uppercase">
                  {language}
                </span>
              </div>
            </div>
          </div>

          {/* State Selection */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                🏛️ State Selection
              </label>
              <StateSelector
                selectedState={selectedState}
                onStateChange={handleStateChange}
                disabled={isLoading}
                className="w-full"
              />
            </div>
            
            <div className="text-sm text-gray-600 dark:text-gray-400 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
              <p className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                ℹ️ {getStateDisplayText()}
              </p>
              <p>
                {selectedState 
                  ? `The 10 state-specific questions will be from ${selectedState}. General questions will be randomly selected from all categories.`
                  : 'The 10 state-specific questions will be randomly selected from any German state. Choose a specific state if you want to focus on one region.'
                }
              </p>
            </div>
          </div>

          {/* Test Instructions */}
          <div className="border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 bg-yellow-50 dark:bg-yellow-900/20">
            <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              📝 Test Instructions
            </h4>
            <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
              <li>• Take your time - there is no time limit</li>
              <li>• You can navigate between questions</li>
              <li>• Your progress is automatically saved</li>
              <li>• You can pause and resume the test</li>
              <li>• Review your answers before submitting</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            {onCancel && (
              <button
                onClick={onCancel}
                disabled={isLoading}
                className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            )}
            <button
              onClick={handleStartTest}
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Starting Test...</span>
                </>
              ) : (
                <>
                  <span>🚀</span>
                  <span>Start Test</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};