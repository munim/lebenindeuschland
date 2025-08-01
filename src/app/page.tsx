'use client';

import React, { useEffect, useRef, useState } from 'react';
import { QuestionCard } from '@/components/QuestionCard';
import { LanguageSelector } from '@/components/LanguageSelector';
import { ThemeToggle } from '@/components/ThemeToggle';
import { TestModeToggle } from '@/components/TestModeToggle';
import { SettingsModal, SettingsButton } from '@/components/SettingsModal';
import { KeyboardShortcutsModal, KeyboardShortcutsButton } from '@/components/KeyboardShortcutsModal';
import { CollapsibleFilterBar } from '@/components/CollapsibleFilterBar';
import { Footer } from '@/components/Footer';
import { useQuestionCache } from '@/lib/useQuestionCache';
import { useSwipe } from '@/lib/useSwipe';
import { Pagination } from '@/components/Pagination';

export default function Home() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isKeyboardShortcutsOpen, setIsKeyboardShortcutsOpen] = useState(false);
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

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only handle navigation keys when not in input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          if (hasPrevious && !loading) {
            goToPrevious();
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (hasNext && !loading) {
            goToNext();
          }
          break;
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
                <KeyboardShortcutsButton onClickAction={() => setIsKeyboardShortcutsOpen(true)} />
              </div>
              
              {/* Mobile Settings Button */}
              <div className="md:hidden">
                <SettingsButton onClickAction={() => setIsSettingsOpen(true)} />
              </div>
            </div>
            
            {/* Filter Controls */}
            <CollapsibleFilterBar
              selectedCategory={filters.category}
              selectedState={filters.state}
              onCategoryChange={handleCategoryChange}
              onStateChange={handleStateChange}
              onResetFilters={handleResetFilters}
              disabled={loading}
            />
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
      
      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal 
        isOpen={isKeyboardShortcutsOpen} 
        onClose={() => setIsKeyboardShortcutsOpen(false)} 
      />
    </div>
  );
}