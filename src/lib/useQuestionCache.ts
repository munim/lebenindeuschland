import { useState, useEffect, useCallback, useRef } from 'react';
import { Question, FilterState } from '@/types/question';
import { fetchAllQuestions, fetchCategoryQuestions, fetchStateQuestions, fetchStateCategoryQuestions } from '@/lib/api';
import { useRandomization } from '@/contexts/RandomizationContext';

interface QuestionCache {
  [key: number]: Question[];
}

const STORAGE_KEY = 'current-question-index';
const FILTER_STORAGE_KEY = 'question-filters';

export const useQuestionCache = () => {
  const { isEnabled: isRandomizationEnabled, isInitialized: randomizationInitialized } = useRandomization();
  const [cache, setCache] = useState<QuestionCache>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const skeletonTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [loadingPages, setLoadingPages] = useState<Set<number>>(new Set());
  const [filters, setFilters] = useState<FilterState>({ category: null, state: null });
  
  // Use refs to avoid stale closures
  const cacheRef = useRef(cache);
  const loadingPagesRef = useRef(loadingPages);
  const currentQuestionIndexRef = useRef(currentQuestionIndex);
  
  // Helper to start loading with optional skeleton delay
  const startLoading = useCallback((reason: 'initial' | 'filter' | 'navigation') => {
    setLoading(true);
    setShowSkeleton(false);
    
    // Clear any existing timeout
    if (skeletonTimeoutRef.current) {
      clearTimeout(skeletonTimeoutRef.current);
    }
    
    // Show skeleton after 300ms delay, but only for certain reasons
    if (reason === 'initial' || reason === 'filter') {
      skeletonTimeoutRef.current = setTimeout(() => {
        setShowSkeleton(true);
      }, 300);
    }
  }, []);

  const stopLoading = useCallback(() => {
    setLoading(false);
    setShowSkeleton(false);
    
    // Clear skeleton timeout
    if (skeletonTimeoutRef.current) {
      clearTimeout(skeletonTimeoutRef.current);
      skeletonTimeoutRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (skeletonTimeoutRef.current) {
        clearTimeout(skeletonTimeoutRef.current);
      }
    };
  }, []);
  useEffect(() => {
    cacheRef.current = cache;
  }, [cache]);
  
  useEffect(() => {
    loadingPagesRef.current = loadingPages;
  }, [loadingPages]);

  useEffect(() => {
    currentQuestionIndexRef.current = currentQuestionIndex;
  }, [currentQuestionIndex]);

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
    if (typeof window === 'undefined' || !randomizationInitialized || isRandomizationEnabled) return;

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
    }, [getFetchFunction, randomizationInitialized, isRandomizationEnabled]);

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
    // Clear cache when filters change to force reload
    setCache({});
  }, []);

  // Main effect for filter changes and initialization
  useEffect(() => {
    const loadFilteredQuestions = async () => {
      if (typeof window === 'undefined' || !isInitialized || !randomizationInitialized) {
        return;
      }
      if (isRandomizationEnabled) {
        return;
      }

      try {
        startLoading('filter');
        const fetchFn = getFetchFunction();
        
        // Always load page 1 first to get total questions and basic data
        const response = await fetchFn(1);
        setCache({ 1: response.questions });
        setTotalQuestions(response.pagination.totalQuestions);
        
        // If current question is not on page 1, load the correct page immediately
        const currentPage = getPageForQuestion(currentQuestionIndexRef.current);
        if (currentPage > 1) {
          const currentPageResponse = await fetchFn(currentPage);
          setCache(prev => ({ ...prev, [currentPage]: currentPageResponse.questions }));
        }
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load questions');
      } finally {
        stopLoading();
      }
    };

    loadFilteredQuestions();
  }, [filters, getFetchFunction, isInitialized, randomizationInitialized, isRandomizationEnabled, startLoading, stopLoading]);

  

  return {
    currentQuestion: getCurrentQuestion(),
    currentQuestionIndex,
    totalQuestions,
    loading,
    showSkeleton,
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