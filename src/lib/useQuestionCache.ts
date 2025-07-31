import { useState, useEffect, useCallback } from 'react';
import { Question } from '@/types/question';
import { fetchQuestions } from '@/lib/api';

interface QuestionCache {
  [key: number]: Question[];
}

const STORAGE_KEY = 'current-question-index';

export const useQuestionCache = () => {
  const [cache, setCache] = useState<QuestionCache>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [loadingPages, setLoadingPages] = useState<Set<number>>(new Set());

  // Load saved question index from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const index = parseInt(saved, 10);
        if (!isNaN(index) && index >= 0) {
          setCurrentQuestionIndex(index);
        }
      }
      setIsInitialized(true);
    }
  }, []);

  // Save current question index to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && isInitialized && currentQuestionIndex >= 0) {
      localStorage.setItem(STORAGE_KEY, currentQuestionIndex.toString());
    }
  }, [currentQuestionIndex, isInitialized]);

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
      // Skip if already cached or currently loading
      if (cache[page] || loadingPages.has(page)) {
        continue;
      }
      
      try {
        // Mark as loading to prevent duplicate requests
        setLoadingPages(prev => new Set(prev.add(page)));
        
        const response = await fetchQuestions('de', page);
        setCache(prev => ({
          ...prev,
          [page]: response.questions
        }));
        
        if (page === 1) {
          setTotalQuestions(response.pagination.totalQuestions);
        }
        
        // Remove from loading set
        setLoadingPages(prev => {
          const next = new Set(prev);
          next.delete(page);
          return next;
        });
      } catch (err) {
        console.error(`Failed to load page ${page}:`, err);
        // Remove from loading set on error too
        setLoadingPages(prev => {
          const next = new Set(prev);
          next.delete(page);
          return next;
        });
      }
    }
  }, []); // Remove cache dependency to prevent recreation

  // Get current question from cache
  const getCurrentQuestion = useCallback((): Question | null => {
    const pageNumber = getPageForQuestion(currentQuestionIndex);
    const pageQuestions = cache[pageNumber];
    if (!pageQuestions) {
      return null; // Don't trigger loading here to avoid render loops
    }
    
    const indexInPage = currentQuestionIndex % 20;
    return pageQuestions[indexInPage] || null;
  }, [cache, currentQuestionIndex]);

  // Navigate to specific question
  const goToQuestion = useCallback(async (questionIndex: number) => {
    if (questionIndex < 0 || (totalQuestions > 0 && questionIndex >= totalQuestions)) return;
    
    // Update immediately for instant UI response
    setCurrentQuestionIndex(questionIndex);
    
    const targetPage = getPageForQuestion(questionIndex);
    
    // Always preload adjacent pages in background
    preloadPages(targetPage);
  }, [totalQuestions, preloadPages]);

  // Navigation helpers
  const goToNext = useCallback(() => {
    goToQuestion(currentQuestionIndex + 1);
  }, [currentQuestionIndex, goToQuestion]);

  const goToPrevious = useCallback(() => {
    goToQuestion(currentQuestionIndex - 1);
  }, [currentQuestionIndex, goToQuestion]);

  // Initialize - load first few pages or the page containing saved question
  useEffect(() => {
    const initializeCache = async () => {
      // Only run on client side after mount and after localStorage is loaded
      if (typeof window === 'undefined' || !isInitialized) {
        return;
      }
      
      try {
        setLoading(true);
        
        // Determine which page to load based on current question index
        const targetPage = getPageForQuestion(currentQuestionIndex);
        
        await preloadPages(targetPage);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load questions');
        setLoading(false);
      }
    };

    initializeCache();
  }, [isInitialized]); // Only depend on isInitialized to run once

  // Load pages when currentQuestionIndex changes (after initialization)
  useEffect(() => {
    if (isInitialized && !loading) {
      const targetPage = getPageForQuestion(currentQuestionIndex);
      preloadPages(targetPage);
    }
  }, [currentQuestionIndex, isInitialized, loading]);

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