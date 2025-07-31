import { useState, useEffect, useCallback } from 'react';
import { Question } from '@/types/question';
import { fetchQuestions } from '@/lib/api';

interface QuestionCache {
  [key: number]: Question[];
}

export const useQuestionCache = () => {
  const [cache, setCache] = useState<QuestionCache>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalQuestions, setTotalQuestions] = useState(0);

  // Calculate which page contains the current question
  const getPageForQuestion = (questionIndex: number) => Math.floor(questionIndex / 20) + 1;

  // Preload adjacent pages for smooth navigation
  const preloadPages = useCallback(async (centerPage: number) => {
    // Only run on client side
    if (typeof window === 'undefined') {
      return;
    }
    
    const pagesToLoad = [centerPage - 1, centerPage, centerPage + 1].filter(p => p > 0);
    
    for (const page of pagesToLoad) {
      if (!cache[page]) {
        try {
          const response = await fetchQuestions('de', page);
          setCache(prev => ({
            ...prev,
            [page]: response.questions
          }));
          
          if (page === 1) {
            setTotalQuestions(response.pagination.totalQuestions);
          }
        } catch (err) {
          console.error(`Failed to load page ${page}:`, err);
        }
      }
    }
  }, [cache]);

  // Get current question from cache
  const getCurrentQuestion = useCallback((): Question | null => {
    const pageNumber = getPageForQuestion(currentQuestionIndex);
    const pageQuestions = cache[pageNumber];
    if (!pageQuestions) {
      // If question not in cache, trigger loading but don't block UI
      preloadPages(pageNumber);
      return null;
    }
    
    const indexInPage = currentQuestionIndex % 20;
    return pageQuestions[indexInPage] || null;
  }, [cache, currentQuestionIndex, preloadPages]);

  // Navigate to specific question
  const goToQuestion = useCallback(async (questionIndex: number) => {
    if (questionIndex < 0 || questionIndex >= totalQuestions) return;
    
    // Update immediately for instant UI response
    setCurrentQuestionIndex(questionIndex);
    
    const targetPage = getPageForQuestion(questionIndex);
    
    // If we don't have the target page, load it in background
    if (!cache[targetPage]) {
      preloadPages(targetPage);
    } else {
      // Preload adjacent pages in background
      preloadPages(targetPage);
    }
  }, [cache, totalQuestions, preloadPages]);

  // Navigation helpers
  const goToNext = useCallback(() => {
    goToQuestion(currentQuestionIndex + 1);
  }, [currentQuestionIndex, goToQuestion]);

  const goToPrevious = useCallback(() => {
    goToQuestion(currentQuestionIndex - 1);
  }, [currentQuestionIndex, goToQuestion]);

  // Initialize - load first few pages
  useEffect(() => {
    const initializeCache = async () => {
      // Only run on client side after mount
      if (typeof window === 'undefined') {
        return;
      }
      
      try {
        setLoading(true);
        await preloadPages(1);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load questions');
        setLoading(false);
      }
    };

    initializeCache();
  }, [preloadPages]);

  return {
    currentQuestion: getCurrentQuestion(),
    currentQuestionIndex,
    totalQuestions,
    loading,
    error,
    goToNext,
    goToPrevious,
    goToQuestion,
    hasNext: currentQuestionIndex < totalQuestions - 1,
    hasPrevious: currentQuestionIndex > 0,
  };
};