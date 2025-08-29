'use client';

import React, { useState, useEffect } from 'react';
import { useTestSession } from '@/hooks/useTestSession';
import { useTestProgress } from '@/hooks/useTestProgress';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { TestQuestionCard } from './TestQuestionCard';
import { TestProgressBar } from './TestProgressBar';
import { TestNavigation } from './TestNavigation';
import { useAutoSave } from '@/hooks/useAutoSave';

interface ActiveTestViewProps {
  onTestComplete?: () => void;
  onTestPause?: () => void;
  showTranslations?: boolean;
  className?: string;
}

export const ActiveTestView: React.FC<ActiveTestViewProps> = ({
  onTestComplete,
  onTestPause,
  showTranslations = false,
  className = ''
}) => {
  const {
    currentSession,
    currentQuestion,
    isLoading,
    error,
    completeTest,
    pauseTest,
    submitAnswer,
    handleNext,
    handlePrevious,
    canNavigateNext,
    canNavigatePrevious
  } = useTestSession();
  
  const { currentQuestionNumber, totalQuestions, timeRemaining, isTimeWarning, isTimeCritical, isTimeExpired } = useTestProgress();
  
  // Enable auto-save for active test
  useAutoSave();

  const [isSubmittingTest, setIsSubmittingTest] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);
  const [showTranslationsLocal, setShowTranslationsLocal] = useState(showTranslations);

  // Keyboard shortcuts for test navigation and answer selection
  useKeyboardShortcuts({
    onNavigatePrevious: () => {
      if (canNavigatePrevious && !isLoading && !isSubmittingTest) {
        handlePrevious();
      }
    },
    onNavigateNext: () => {
      if (canNavigateNext && !isLoading && !isSubmittingTest) {
        handleNext();
      }
    },
    onSelectAnswer: (answerKey) => {
      if (currentQuestion && !isSubmittingTest && !isLoading) {
        const answerMapping = {
          '1': 'a',
          '2': 'b', 
          '3': 'c',
          '4': 'd'
        };
        const answer = answerMapping[answerKey];
        if (answer) {
          handleAnswerSelect(answer);
        }
      }
    },
    onToggleTranslation: () => {
      setShowTranslationsLocal(prev => !prev);
    },
    disabled: isSubmittingTest || isLoading
  });

  useEffect(() => {
    // Clear any previous errors when question changes
    setTestError(null);
  }, [currentQuestion]);

  const handleAnswerSelect = async (answer: string) => {
    try {
      setTestError(null);
      await submitAnswer(answer);
    } catch (error) {
      console.error('Failed to submit answer:', error);
      setTestError('Failed to save your answer. Please try again.');
    }
  };

  const handleTestComplete = async () => {
    try {
      setIsSubmittingTest(true);
      setTestError(null);
      
      const result = await completeTest();
      if (result) {
        onTestComplete?.();
      }
    } catch (error) {
      console.error('Failed to complete test:', error);
      setTestError('Failed to submit test. Please try again.');
    } finally {
      setIsSubmittingTest(false);
    }
  };

  const handleTestPause = async () => {
    try {
      setTestError(null);
      await pauseTest();
      onTestPause?.();
    } catch (error) {
      console.error('Failed to pause test:', error);
      setTestError('Failed to pause test. Please try again.');
    }
  };

  // Loading state
  if (isLoading || !currentSession || !currentQuestion) {
    return (
      <div className={`flex items-center justify-center min-h-96 ${className}`}>
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading test...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-6 ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
            Test Error
          </h3>
        </div>
        <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          Reload Page
        </button>
      </div>
    );
  }

  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${className}`}>
      {/* Test Header */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4">
        <div className="flex flex-col gap-3 sm:gap-0 sm:flex-row sm:items-center sm:justify-between">
          {/* Title Section - Mobile Full Width */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              🎯 Leben in Deutschland Test
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              {currentSession.state} • {totalQuestions} Questions
            </p>
          </div>
          
          {/* Timer and Status Section - Mobile Full Width */}
          <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
            {/* Timer Display - Responsive */}
            <div className={`flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 rounded-lg border-2 transition-all ${
              isTimeExpired 
                ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-600' 
                : isTimeCritical 
                ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-600 animate-pulse' 
                : isTimeWarning 
                ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-600'
                : 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600'
            }`}>
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-center">
                <div className={`text-sm sm:text-lg font-bold transition-colors ${
                  isTimeExpired 
                    ? 'text-red-600 dark:text-red-400' 
                    : isTimeCritical 
                    ? 'text-red-600 dark:text-red-400' 
                    : isTimeWarning 
                    ? 'text-orange-600 dark:text-orange-400'
                    : 'text-blue-600 dark:text-blue-400'
                }`}>
                  {isTimeExpired ? '0:00' : timeRemaining}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {isTimeExpired ? 'Time Up!' : 'Remaining'}
                </div>
              </div>
            </div>

            {/* Test Status - Responsive */}
            {currentSession.status === 'active' && (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <div className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs sm:text-sm font-medium">Test Active</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <TestProgressBar
        showDetailedStats={false}
        showTimeInfo={true}
        compact={true}
      />

      {/* Error Display */}
      {testError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-700 dark:text-red-300">{testError}</p>
          </div>
        </div>
      )}

      {/* Main Test Content */}
      <div className="space-y-6">
        {/* Question Card - Full width */}
        <div className="w-full">
          <TestQuestionCard
            question={currentQuestion}
            questionNumber={currentQuestionNumber}
            onAnswerSelect={handleAnswerSelect}
            showTranslations={showTranslationsLocal}
            disabled={isSubmittingTest}
          />
        </div>

        {/* Navigation Controls - Compact version below question */}
        <TestNavigation
          onCompleteTest={handleTestComplete}
          onPauseTest={handleTestPause}
          showCompleteButton={false}
          compact={true}
        />

        {/* Progress Section - Full width with better spacing */}
        <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Test Progress
            </h3>
            <TestProgressBar
              showDetailedStats={true}
              showTimeInfo={true}
              showQuestionNumbers={true}
              compact={false}
            />
          </div>
        </div>
      </div>

      {/* Complete Test Navigation - Full version at bottom */}
      <TestNavigation
        onCompleteTest={handleTestComplete}
        onPauseTest={handleTestPause}
        showCompleteButton={true}
        compact={false}
      />

      {/* Test Submission Loading Overlay */}
      {isSubmittingTest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4 text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Submitting Test
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we process your answers...
            </p>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Help */}
      <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono">1-4</kbd>
              <span className="text-sm text-gray-600 dark:text-gray-400">Select answers</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono">T</kbd>
              <span className="text-sm text-gray-600 dark:text-gray-400">Toggle translation</span>
              {showTranslationsLocal && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-green-600 dark:text-green-400">ON</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono">←</kbd>
              <span className="text-sm text-gray-600 dark:text-gray-400">Previous</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono">→</kbd>
              <span className="text-sm text-gray-600 dark:text-gray-400">Next</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};