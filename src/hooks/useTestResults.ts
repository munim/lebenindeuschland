'use client';

import { useState, useEffect, useCallback } from 'react';
import { TestResult } from '@/types/question';
import { getTestResultRepository } from '@/lib/repositories/RepositoryFactory';

export function useTestResults() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTestResults = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const repository = getTestResultRepository();
      const results = await repository.findRecentResults(50); // Get last 50 results
      
      // Ensure dates are properly converted from strings to Date objects
      const processedResults = results.map(result => ({
        ...result,
        completedAt: new Date(result.completedAt)
      }));
      
      setTestResults(processedResults);
    } catch (error) {
      console.error('Failed to load test results:', error);
      setError((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getTestHistory = useCallback(async (limit = 10): Promise<TestResult[]> => {
    try {
      const repository = getTestResultRepository();
      return await repository.findRecentResults(limit);
    } catch (error) {
      console.error('Failed to get test history:', error);
      return [];
    }
  }, []);

  const getPassedTestsCount = useCallback(async (): Promise<number> => {
    try {
      const repository = getTestResultRepository();
      const passedTests = await repository.findByPassStatus(true);
      return passedTests.length;
    } catch (error) {
      console.error('Failed to get passed tests count:', error);
      return 0;
    }
  }, []);

  const getTotalTestsCount = useCallback(async (): Promise<number> => {
    try {
      const repository = getTestResultRepository();
      const allResults = await repository.findAll();
      return allResults.length;
    } catch (error) {
      console.error('Failed to get total tests count:', error);
      return 0;
    }
  }, []);

  const getAnalytics = useCallback(async () => {
    try {
      const repository = getTestResultRepository();
      return await repository.calculateAnalytics();
    } catch (error) {
      console.error('Failed to get analytics:', error);
      return null;
    }
  }, []);

  // Load results on mount
  useEffect(() => {
    loadTestResults();
  }, [loadTestResults]);

  return {
    testResults,
    isLoading,
    error,
    loadTestResults,
    getTestHistory,
    getPassedTestsCount,
    getTotalTestsCount,
    getAnalytics,
  };
}