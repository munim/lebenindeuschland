'use client';

import React, { useEffect, useRef, useState } from 'react';
import { QuestionCard } from '@/components/QuestionCard';
import { QuestionCardSkeleton } from '@/components/QuestionCardSkeleton';
import { SettingsBar } from '@/components/SettingsBar';
import { KeyboardShortcutsModal } from '@/components/KeyboardShortcutsModal';
import { CollapsibleFilterBar } from '@/components/CollapsibleFilterBar';
import { SessionStatsBadge } from '@/components/SessionStatsBadge';
import { useQuestionCache } from '@/lib/useQuestionCache';
import { useRandomizedQuestionCache } from '@/lib/useRandomizedQuestionCache';
import { useRandomization } from '@/contexts/RandomizationContext';
import { useSwipe } from '@/lib/useSwipe';
import { Pagination } from '@/components/Pagination';

export const StudyView: React.FC = () => {
  const [isKeyboardShortcutsOpen, setIsKeyboardShortcutsOpen] = useState(false);
  const { isEnabled: isRandomizationEnabled } = useRandomization();
  
  // Use randomized cache when randomization is enabled, otherwise use regular cache
  const regularCache = useQuestionCache();
  const randomizedCache = useRandomizedQuestionCache();
  
  const questionCache = isRandomizationEnabled ? randomizedCache : regularCache;
  
  const {
    currentQuestion,
    currentQuestionIndex,
    totalQuestions,
    loading,
    showSkeleton,
    error,
    goToNext,
    goToPrevious,
    goToQuestion,
    hasNext,
    hasPrevious,
    filters,
    updateFilters,
  } = questionCache;

  const containerRef = useRef<HTMLDivElement>(null);

  const swipeHandlers = useSwipe({
    onSwipeLeft: () => {
      if (hasNext && !loading) {
        goToNext();
      }
    },
    onSwipeRight: () => {
      if (hasPrevious && !loading) {
        goToPrevious();
      }
    },
    threshold: 50,
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', swipeHandlers.onTouchStart);
    container.addEventListener('touchend', swipeHandlers.onTouchEnd);

    return () => {
      container.removeEventListener('touchstart', swipeHandlers.onTouchStart);
      container.removeEventListener('touchend', swipeHandlers.onTouchEnd);
    };
  }, [swipeHandlers]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only handle navigation keys when not in input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const isTab = e.key === 'Tab';
      const isShiftTab = e.key === 'Tab' && e.shiftKey;

      if (e.key === 'ArrowLeft' || e.key === 'k' || isShiftTab) {
        e.preventDefault();
        if (hasPrevious && !loading) {
          goToPrevious();
        }
        return;
      }

      if (e.key === 'ArrowRight' || e.key === 'j' || isTab) {
        e.preventDefault();
        if (hasNext && !loading) {
          goToNext();
        }
        return;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [hasNext, hasPrevious, loading, goToNext, goToPrevious]);

  const handleCategoryChange = (categoryId: string | null) => {
    updateFilters({ ...filters, category: categoryId });
  };

  const handleStateChange = (stateCode: string | null) => {
    updateFilters({ ...filters, state: stateCode });
  };

  const handleResetFilters = () => {
    updateFilters({ category: null, state: null });
  };

  const getFilterDisplayText = () => {
    if (filters.category && filters.state) {
      return `Filtered by category and state`;
    } else if (filters.category) {
      return `Category filtered`;
    } else if (filters.state) {
      return `State filtered`;
    }
    return '';
  };

  if (showSkeleton) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="mb-8">
          {/* Unified Settings Bar */}
          <SettingsBar onKeyboardShortcutsOpen={() => setIsKeyboardShortcutsOpen(true)} />
          
          {/* Filter Controls */}
          <div className="mt-4">
            <CollapsibleFilterBar
              selectedCategory={filters.category}
              selectedState={filters.state}
              onCategoryChange={handleCategoryChange}
              onStateChange={handleStateChange}
              onResetFilters={handleResetFilters}
              disabled={loading}
            />
          </div>
        </header>

        <div className="mb-8 text-center">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
            Questions and Answers
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {filters.category || filters.state 
              ? `Filtered questions for the 'Life in Germany' test`
              : `Here you can find all questions and answers for the 'Life in Germany' test`
            }
          </p>
          <div className="flex items-center justify-center gap-4 mt-2">
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Loading questions...
            </p>
            {getFilterDisplayText() && (
              <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                {getFilterDisplayText()}
              </span>
            )}
            {isRandomizationEnabled && (
              <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                🎲 Randomized
              </span>
            )}
          </div>
        </div>

        {/* Pagination Skeleton */}
        <div className="mb-6 flex justify-center">
          <div className="flex items-center space-x-2">
            <div className="h-10 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-10 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Question Skeleton */}
        <div ref={containerRef} className="relative touch-pan-y">
          <QuestionCardSkeleton showImageSkeleton={true} />
        </div>

        {/* Keyboard Shortcuts Modal */}
        <KeyboardShortcutsModal 
          isOpen={isKeyboardShortcutsOpen} 
          onClose={() => setIsKeyboardShortcutsOpen(false)} 
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-red-600 dark:text-red-400">Error: {error}</div>
      </div>
    );
  }

  return (
    <>
      {/* Session Stats Badge */}
      <SessionStatsBadge />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="mb-8">
          {/* Unified Settings Bar */}
          <SettingsBar onKeyboardShortcutsOpen={() => setIsKeyboardShortcutsOpen(true)} />
          
          {/* Filter Controls */}
          <div className="mt-4">
            <CollapsibleFilterBar
              selectedCategory={filters.category}
              selectedState={filters.state}
              onCategoryChange={handleCategoryChange}
              onStateChange={handleStateChange}
              onResetFilters={handleResetFilters}
              disabled={loading}
            />
          </div>
        </header>

        <div className="mb-8 text-center">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
            Questions and Answers
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-3">
            {filters.category || filters.state 
              ? `Filtered questions for the 'Life in Germany' test`
              : `Here you can find all questions and answers for the 'Life in Germany' test`
            }
          </p>
          
          {/* Prominent question counter */}
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg mb-2">
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
              Question {currentQuestionIndex + 1}
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-400">
              of
            </div>
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {totalQuestions} total
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-4">
            {getFilterDisplayText() && (
              <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                {getFilterDisplayText()}
              </span>
            )}
            {isRandomizationEnabled && (
              <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                🎲 Randomized
              </span>
            )}
          </div>
        </div>

        {/* Question Display with Stable Container */}
        <div ref={containerRef} className="relative touch-pan-y">
          {showSkeleton ? (
            <QuestionCardSkeleton showImageSkeleton={true} />
          ) : currentQuestion ? (
            <div className="w-full">
              <QuestionCard
                key={currentQuestion.id}
                question={currentQuestion}
                questionNumber={parseInt(currentQuestion.num) || parseInt(currentQuestion.num.split('-')[1]) || currentQuestionIndex + 1}
              />
              
              {/* Navigation controls directly below question */}
              <div className="mt-6 flex items-center justify-between">
                <button
                  onClick={goToPrevious}
                  disabled={!hasPrevious || loading}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>
                
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Question {currentQuestionIndex + 1} of {totalQuestions}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Use arrow keys, swipe, or pagination below
                  </div>
                </div>
                
                <button
                  onClick={goToNext}
                  disabled={!hasNext || loading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
                >
                  Next
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">
                No questions available. Please check your data configuration.
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {showSkeleton ? (
          <div className="mt-6 flex justify-center">
            <div className="flex items-center space-x-2">
              <div className="h-10 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-10 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>
        ) : (
          <Pagination
            currentPage={currentQuestionIndex + 1}
            totalPages={totalQuestions}
            onPageChange={(page) => goToQuestion(page - 1)}
          />
        )}

        {!currentQuestion && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              No questions available. Please check your data configuration.
            </p>
          </div>
        )}
      </div>
      
      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal 
        isOpen={isKeyboardShortcutsOpen} 
        onClose={() => setIsKeyboardShortcutsOpen(false)} 
      />
    </>
  );
};