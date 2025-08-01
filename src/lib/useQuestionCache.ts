import { useState, useEffect, useCallback, useRef } from 'react';
import { Question, FilterState } from '@/types/question';
import { fetchAllQuestions, fetchCategoryQuestions, fetchStateQuestions, fetchStateCategoryQuestions } from '@/lib/api';

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
    if (filters.state && filters.category) {
      // Both state and category selected: fetch state data and filter by category
      return (page: number) => fetchStateCategoryQuestions(filters.state!, filters.category!, 'de', page);
    } else if (filters.state) {
      // Only state selected: base questions + state-specific questions
      return (page: number) => fetchStateQuestions(filters.state!, 'de', page);
    } else if (filters.category) {
      // Only category selected: category questions from base set only
      return (page: number) => fetchCategoryQuestions(filters.category!, 'de', page);
    } else {
      // No filters: all base questions
      return (page: number) => fetchAllQuestions('de', page);
    }
  }, [filters]);

  const preloadPages = useCallback(async (centerPage: number) => {
    if (typeof window === 'undefined') return;

    const fetchFn = getFetchFunction();
    const pagesToLoad = [centerPage - 1, centerPage, centerPage + 1].filter(p => p > 0);

    for (const page of pagesToLoad) {
      if (cacheRef.current[page] || loadingPagesRef.current.has(page)) {
        continue;
      }

      try {
        setLoadingPages(prev => new Set(prev).add(page));

        const response = await fetchFn(page);

        setCache(prev => ({ ...prev, [page]: response.questions }));

        if (page === 1) {
          setTotalQuestions(response.pagination.totalQuestions);
        }
      } catch (err) {
        console.error(`Failed to preload page ${page}:`, err);
      } finally {
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

  const goToQuestion = useCallback((questionIndex: number) => {
    if (questionIndex < 0 || (totalQuestions > 0 && questionIndex >= totalQuestions)) return;

    setCurrentQuestionIndex(questionIndex);

    const targetPage = getPageForQuestion(questionIndex);
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
    setTotalQuestions(0);
  }, []);

  // Main effect for initialization and data loading
  useEffect(() => {
    const initializeAndLoad = async () => {
      if (typeof window === 'undefined' || !isInitialized) {
        return;
      }

      try {
        setLoading(true);

        const targetPage = getPageForQuestion(currentQuestionIndex);
        const fetchFn = getFetchFunction();

        const response = await fetchFn(targetPage);
        setCache({ [targetPage]: response.questions });
        setTotalQuestions(response.pagination.totalQuestions);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load questions');
      } finally {
        setLoading(false);
      }
    };

    initializeAndLoad();
  }, [isInitialized, filters, currentQuestionIndex, getFetchFunction]);

  

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