import { useState, useEffect, useCallback, useRef } from 'react';
import { Question, FilterState } from '@/types/question';
import { fetchQuestions, fetchCategoryQuestions, fetchStateQuestions } from '@/lib/api';

interface QuestionCache {
  [key: number]: Question[];
}

const STORAGE_KEY = 'current-question-index';
const FILTER_STORAGE_KEY = 'question-filters';

export const useQuestionCache = () => {
  const [cache, setCache] = useState<QuestionCache>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [loadingPages, setLoadingPages] = useState<Set<number>>(new Set());
  const [filters, setFilters] = useState<FilterState>({ category: null, state: null });
  
  // Use refs to avoid stale closures
  const cacheRef = useRef(cache);
  const loadingPagesRef = useRef(loadingPages);
  
  // Update refs when state changes
  useEffect(() => {
    cacheRef.current = cache;
  }, [cache]);
  
  useEffect(() => {
    loadingPagesRef.current = loadingPages;
  }, [loadingPages]);

  // Load saved question index and filters from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedIndex = localStorage.getItem(STORAGE_KEY);
      if (savedIndex) {
        const index = parseInt(savedIndex, 10);
        if (!isNaN(index) && index >= 0) {
          setCurrentQuestionIndex(index);
        }
      }
      
      const savedFilters = localStorage.getItem(FILTER_STORAGE_KEY);
      if (savedFilters) {
        try {
          const parsedFilters = JSON.parse(savedFilters);
          setFilters(parsedFilters);
        } catch {
          // Ignore invalid saved filters
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

  // Save filters to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined' && isInitialized) {
      localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filters));
    }
  }, [filters, isInitialized]);

  // Calculate which page contains the current question
  const getPageForQuestion = (questionIndex: number) => Math.floor(questionIndex / 20) + 1;

  // Get the appropriate fetch function based on filters
  const getFetchFunction = useCallback(() => {
    if (filters.state) {
      return (page: number) => fetchStateQuestions(filters.state!, 'de', page);
    } else if (filters.category) {
      return (page: number) => fetchCategoryQuestions(filters.category!, 'de', page);
    } else {
      return (page: number) => fetchQuestions('de', page);
    }
  }, [filters]);

  // Stable preload function without cache/loadingPages dependencies
  const preloadPages = useCallback(async (centerPage: number) => {
    // Only run on client side
    if (typeof window === 'undefined') {
      return;
    }
    
    const fetchFn = getFetchFunction();
    const pagesToLoad = [centerPage - 1, centerPage, centerPage + 1].filter(p => p > 0);
    
    for (const page of pagesToLoad) {
      // Check current cache and loading state using refs
      if (cacheRef.current[page] || loadingPagesRef.current.has(page)) {
        continue;
      }
      
      try {
        // Mark as loading
        setLoadingPages(prev => new Set(prev.add(page)));
        
        const response = await fetchFn(page);
        
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
        setLoadingPages(prev => {
          const next = new Set(prev);
          next.delete(page);
          return next;
        });
      }
    }
  }, [getFetchFunction]);

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

  // Update filters and reset to first question
  const updateFilters = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentQuestionIndex(0); // Reset to first question
    setCache({}); // Clear cache since we're switching datasets
    setTotalQuestions(0);
  }, []);

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
        
        // Get the latest fetch function directly
        const fetchFn = filters.state 
          ? (page: number) => fetchStateQuestions(filters.state!, 'de', page)
          : filters.category 
          ? (page: number) => fetchCategoryQuestions(filters.category!, 'de', page)
          : (page: number) => fetchQuestions('de', page);
        
        // Load initial page directly without preloadPages dependency
        const response = await fetchFn(targetPage);
        setCache({ [targetPage]: response.questions });
        setTotalQuestions(response.pagination.totalQuestions);
        
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load questions');
        setLoading(false);
      }
    };

    initializeCache();
  }, [isInitialized, currentQuestionIndex, filters]);

  // Clear cache and reload when filters change
  useEffect(() => {
    if (isInitialized) {
      setCache({});
      setCurrentQuestionIndex(0);
      setTotalQuestions(0);
      
      // Reset loading state for filter changes  
      setLoading(true);
    }
  }, [filters, isInitialized]);

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
    filters,
    updateFilters,
  };
};