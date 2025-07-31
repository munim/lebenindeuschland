'use client';

import React, { useEffect, useRef } from 'react';
import { QuestionCard } from '@/components/QuestionCard';
import { LanguageSelector } from '@/components/LanguageSelector';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Footer } from '@/components/Footer';
import { useQuestionCache } from '@/lib/useQuestionCache';
import { useSwipe } from '@/lib/useSwipe';

export default function Home() {
  const {
    currentQuestion,
    currentQuestionIndex,
    totalQuestions,
    loading,
    error,
    goToNext,
    goToPrevious,
    hasNext,
    hasPrevious,
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
    threshold: 50
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
          <header className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Leben In Deutschland
            </h1>
            <div className="flex items-center space-x-4">
              <LanguageSelector />
              <ThemeToggle />
            </div>
          </header>

          <div className="mb-8 text-center">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
              Questions and Answers
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Here you can find all questions and answers for the &apos;Life in Germany&apos; test
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </p>
          </div>

          {/* Question Display with Stable Container */}
          <div ref={containerRef} className="relative min-h-[600px] touch-pan-y">
            {currentQuestion && (
              <div className="w-full">
                <QuestionCard
                  question={currentQuestion}
                  questionNumber={parseInt(currentQuestion.num)}
                />
              </div>
            )}
          </div>

          {/* Custom Pagination Controls */}
          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={goToPrevious}
              disabled={!hasPrevious || loading}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                hasPrevious && !loading
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
            >
              ← Previous
            </button>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </span>
            </div>

            <button
              onClick={goToNext}
              disabled={!hasNext || loading}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                hasNext && !loading
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
            >
              Next →
            </button>
          </div>

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
    </div>
  );
}