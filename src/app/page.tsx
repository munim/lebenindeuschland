'use client';

import React, { useEffect, useRef, useState } from 'react';
import { QuestionCard } from '@/components/QuestionCard';
import { LanguageSelector } from '@/components/LanguageSelector';
import { ThemeToggle } from '@/components/ThemeToggle';
import { TestModeToggle } from '@/components/TestModeToggle';
import { SettingsModal, SettingsButton } from '@/components/SettingsModal';
import { CategorySelector } from '@/components/CategorySelector';
import { StateSelector } from '@/components/StateSelector';
import { Footer } from '@/components/Footer';
import { useQuestionCache } from '@/lib/useQuestionCache';
import { useSwipe } from '@/lib/useSwipe';
import { Pagination } from '@/components/Pagination';

export default function Home() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const {
    currentQuestion,
    currentQuestionIndex,
    totalQuestions,
    loading,
    error,
    goToNext,
    goToPrevious,
    goToQuestion,
    hasNext,
    hasPrevious,
    filters,
    updateFilters,
  } = useQuestionCache();

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

  if (loading && !currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading questions...</div>
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors flex flex-col">
      <div className="flex-1">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <header className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Leben In Deutschland
              </h1>
              
              {/* Desktop Controls */}
              <div className="hidden md:flex items-center space-x-4">
                <TestModeToggle />
                <LanguageSelector />
                <ThemeToggle />
              </div>
              
              {/* Mobile Settings Button */}
              <div className="md:hidden">
                <SettingsButton onClickAction={() => setIsSettingsOpen(true)} />
              </div>
            </div>
            
            {/* Filter Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-1">
                <CategorySelector
                  selectedCategory={filters.category}
                  onCategoryChange={handleCategoryChange}
                  disabled={loading}
                />
                <StateSelector
                  selectedState={filters.state}
                  onStateChange={handleStateChange}
                  disabled={loading}
                />
              </div>
              
              {(filters.category || filters.state) && (
                <button
                  onClick={handleResetFilters}
                  disabled={loading}
                  className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                >
                  Reset Filters
                </button>
              )}
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
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </p>
              {getFilterDisplayText() && (
                <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                  {getFilterDisplayText()}
                </span>
              )}
            </div>
          </div>

          {/* Question Display with Stable Container */}
          <div ref={containerRef} className="relative touch-pan-y">
            {currentQuestion && (
              <div className="w-full">
                <QuestionCard
                  key={currentQuestion.id}
                  question={currentQuestion}
                  questionNumber={parseInt(currentQuestion.num)}
                />
              </div>
            )}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentQuestionIndex + 1}
            totalPages={totalQuestions}
            onPageChange={(page) => goToQuestion(page - 1)}
          />

          {!currentQuestion && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">
                No questions available. Please check your data configuration.
              </p>
            </div>
          )}
        </div>
      </div>
      <Footer />
      
      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  );
}