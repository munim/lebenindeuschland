import { useState, useEffect, useCallback, useRef } from 'react';
import { Question, FilterState } from '@/types/question';
import { fetchCompleteQuestions } from '@/lib/api';
import { useRandomization } from '@/contexts/RandomizationContext';
import {
  initializeRandomization,
  shuffleArrayWithSeed,
  paginateQuestions
} from '@/lib/randomization';

const STORAGE_KEY = 'current-question-index';
const FILTER_STORAGE_KEY = 'question-filters';

export const useRandomizedQuestionCache = () => {
  const { isEnabled: isRandomizationEnabled, currentSeed, setCurrentSeed } = useRandomization();
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [filters, setFilters] = useState<FilterState>({ category: null, state: null });
  
  const allQuestionsRef = useRef<Question[]>([]);
  const shuffledQuestionsRef = useRef<Question[]>([]);
  
  // Update refs when state changes
  useEffect(() => {
    allQuestionsRef.current = allQuestions;
  }, [allQuestions]);
  
  useEffect(() => {
    shuffledQuestionsRef.current = shuffledQuestions;
  }, [shuffledQuestions]);

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

  // Load and shuffle questions when filters or randomization changes
  useEffect(() => {
    const loadQuestions = async () => {
      if (!isInitialized || !isRandomizationEnabled) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch complete question set for current filters
        const response = await fetchCompleteQuestions(
          'de', // TODO: Get from language context
          filters.state || undefined,
          filters.category || undefined
        );

        setAllQuestions(response.questions);

        let seed = currentSeed;
        
        // Initialize randomization if no seed exists
        if (!seed) {
          seed = await initializeRandomization();
          setCurrentSeed(seed);
        }
        
        const shuffled = shuffleArrayWithSeed(response.questions, seed);
        setShuffledQuestions(shuffled);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load questions');
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [isInitialized, filters, isRandomizationEnabled, currentSeed, setCurrentSeed]);

  // Get current question
  const getCurrentQuestion = useCallback((): Question | null => {
    const questions = shuffledQuestionsRef.current;
    return questions[currentQuestionIndex] || null;
  }, [currentQuestionIndex]);

  // Get paginated view of current questions
  const getPaginatedQuestions = useCallback((page: number = 1, pageSize: number = 20) => {
    const questions = isRandomizationEnabled ? shuffledQuestions : allQuestions;
    return paginateQuestions(questions, page, pageSize);
  }, [shuffledQuestions, allQuestions, isRandomizationEnabled]);

  const goToQuestion = useCallback((questionIndex: number) => {
    const questions = isRandomizationEnabled ? shuffledQuestions : allQuestions;
    if (questionIndex < 0 || questionIndex >= questions.length) return;

    setCurrentQuestionIndex(questionIndex);
  }, [shuffledQuestions, allQuestions, isRandomizationEnabled]);

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
  }, []);

  // Calculate totals and navigation state
  const totalQuestions = isRandomizationEnabled ? shuffledQuestions.length : allQuestions.length;
  const hasNext = currentQuestionIndex < totalQuestions - 1;
  const hasPrevious = currentQuestionIndex > 0;

  return {
    currentQuestion: getCurrentQuestion(),
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
    getPaginatedQuestions,
    isRandomized: isRandomizationEnabled,
    currentSeed: isRandomizationEnabled ? currentSeed : null
  };
};