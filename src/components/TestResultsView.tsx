'use client';

import React, { useMemo } from 'react';
import { useTestSession } from '@/hooks/useTestSession';
import { TestScoringService, TestScoreDetails } from '@/lib/services/TestScoringService';
import { TestScoreCard } from './TestScoreCard';
import { CategoryBreakdownCard } from './CategoryBreakdownCard';
import { MistakesSummaryCard } from './MistakesSummaryCard';
import { TestResultActions } from './TestResultActions';

interface TestResultsViewProps {
  onBackToDashboard?: () => void;
  onRetakeTest?: () => void;
  onReviewMistakes?: () => void;
  className?: string;
}

export const TestResultsView: React.FC<TestResultsViewProps> = ({
  onBackToDashboard,
  onRetakeTest,
  onReviewMistakes,
  className = ''
}) => {
  const { currentSession, isLoading, error } = useTestSession();

  const testResults: TestScoreDetails | null = useMemo(() => {
    if (!currentSession || currentSession.status !== 'completed') {
      return null;
    }
    
    try {
      return TestScoringService.calculateScoreDetails(currentSession);
    } catch (error) {
      console.error('Failed to calculate test score:', error);
      return null;
    }
  }, [currentSession]);

  const performanceAnalysis = useMemo(() => {
    if (!currentSession || !testResults) return null;
    
    try {
      return TestScoringService.analyzePerformancePatterns(currentSession);
    } catch (error) {
      console.error('Failed to analyze performance:', error);
      return null;
    }
  }, [currentSession, testResults]);

  // Loading state
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center min-h-96 ${className}`}>
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading results...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !currentSession || !testResults) {
    return (
      <div className={`container mx-auto px-4 py-8 max-w-2xl ${className}`}>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">
              Unable to Load Results
            </h2>
            <p className="text-red-700 dark:text-red-300 mb-6">
              {error || 'Test results are not available or the test was not completed properly.'}
            </p>
            
            <div className="flex gap-4 justify-center">
              <button
                onClick={onBackToDashboard}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Back to Dashboard
              </button>
              <button
                onClick={onRetakeTest}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Take New Test
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const formatTestDuration = () => {
    if (!currentSession.startTime || !currentSession.endTime) return null;
    
    const duration = Math.floor(((currentSession.endTime instanceof Date ? currentSession.endTime.getTime() : new Date(currentSession.endTime).getTime()) - (currentSession.startTime instanceof Date ? currentSession.startTime.getTime() : new Date(currentSession.startTime).getTime())) / 1000);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`container mx-auto px-4 py-8 max-w-6xl ${className}`}>
      {/* Header */}
      <div className="text-center mb-8">
        {/* Show different header for practice tests vs normal tests */}
        {currentSession.mistakePracticeData ? (
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-lg bg-purple-600 text-white font-semibold text-lg mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Practice Complete!
          </div>
        ) : (
          <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-lg text-white font-semibold text-lg mb-4 ${
            testResults.passed 
              ? 'bg-green-600' 
              : 'bg-red-600'
          }`}>
            {testResults.passed ? (
              <>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Test Passed!
              </>
            ) : (
              <>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Test Not Passed
              </>
            )}
          </div>
        )}
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {currentSession.mistakePracticeData ? 'Your Practice Results' : 'Your Test Results'}
        </h1>
        <div className="flex items-center justify-center gap-6 text-sm text-gray-600 dark:text-gray-400">
          <span>📍 {currentSession.mistakePracticeData ? 'Practice Session' : currentSession.state}</span>
          {formatTestDuration() && <span>⏱️ {formatTestDuration()}</span>}
          <span>📅 {currentSession.endTime?.toLocaleDateString()}</span>
        </div>
      </div>

      {/* Results Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Score Card - Takes up 2 columns */}
        <div className="lg:col-span-2">
          <TestScoreCard 
            testResults={testResults}
            isPracticeTest={currentSession.mistakePracticeData !== undefined}
          />
        </div>
        
        {/* Actions - Takes up 1 column */}
        <div className="lg:col-span-1">
          <TestResultActions
            testResults={testResults}
            onBackToDashboard={onBackToDashboard}
            onRetakeTest={onRetakeTest}
            onReviewMistakes={onReviewMistakes}
          />
        </div>
      </div>

      {/* Detailed Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <CategoryBreakdownCard 
          categoryBreakdown={testResults.categoryBreakdown}
          performanceAnalysis={performanceAnalysis}
        />
        
        {/* Mistakes Summary */}
        <MistakesSummaryCard 
          mistakes={testResults.mistakes}
          unansweredQuestions={TestScoringService.getUnansweredQuestions(currentSession)}
          onReviewMistakes={onReviewMistakes}
        />
      </div>

      {/* Performance Insights */}
      {performanceAnalysis && (
        <div className="mt-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            🎯 Performance Insights
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Strong Categories */}
            {performanceAnalysis.strongCategories.length > 0 && (
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
                  💪 Strong Areas
                </h4>
                <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                  {performanceAnalysis.strongCategories.map((category, index) => (
                    <li key={index}>• {category}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Weak Categories */}
            {performanceAnalysis.weakCategories.length > 0 && (
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-2">
                  📚 Areas to Improve
                </h4>
                <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
                  {performanceAnalysis.weakCategories.map((category, index) => (
                    <li key={index}>• {category}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Consistency Score */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                🎯 Consistency
              </h4>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {performanceAnalysis.consistencyScore}%
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">
                {performanceAnalysis.consistencyScore >= 80 ? 'Very consistent' :
                 performanceAnalysis.consistencyScore >= 60 ? 'Moderately consistent' :
                 'Room for improvement'}
              </div>
            </div>
            
            {/* Difficulty Pattern */}
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2">
                📈 Pattern
              </h4>
              <div className="text-lg font-semibold text-purple-600 dark:text-purple-400 capitalize">
                {performanceAnalysis.difficultyPattern}
              </div>
              <div className="text-sm text-purple-700 dark:text-purple-300">
                {performanceAnalysis.difficultyPattern === 'improving' ? 'Getting better!' :
                 performanceAnalysis.difficultyPattern === 'declining' ? 'Stay focused' :
                 performanceAnalysis.difficultyPattern === 'consistent' ? 'Steady performance' :
                 'Mixed results'}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Summary Message */}
      <div className="mt-8 text-center">
        <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <p className="text-gray-700 dark:text-gray-300">
            {TestScoringService.generateScoreSummary(currentSession)}
          </p>
        </div>
      </div>
    </div>
  );
};