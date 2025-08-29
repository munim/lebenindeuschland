'use client';

import React from 'react';
import { TestScoreDetails } from '@/lib/services/TestScoringService';

interface TestResultActionsProps {
  testResults: TestScoreDetails;
  onBackToDashboard?: () => void;
  onRetakeTest?: () => void;
  onReviewMistakes?: () => void;
  onShareResults?: () => void;
  className?: string;
}

export const TestResultActions: React.FC<TestResultActionsProps> = ({
  testResults,
  onBackToDashboard,
  onRetakeTest,
  onReviewMistakes,
  onShareResults,
  className = ''
}) => {
  const hasMistakes = testResults.mistakes.length > 0 || testResults.unansweredQuestions > 0;
  const isExcellentScore = testResults.percentage >= 90;
  const isPassed = testResults.passed;

  const getRecommendedAction = () => {
    if (isExcellentScore) {
      return {
        title: "🎉 Outstanding Performance!",
        message: "You're ready for the real test.",
        primaryAction: "Take Another Test",
        primaryIcon: "🔄"
      };
    } else if (isPassed) {
      return {
        title: "✅ Test Passed!",
        message: "Good job! Consider practicing more to improve your score.",
        primaryAction: "Take Another Test",
        primaryIcon: "🔄"
      };
    } else {
      return {
        title: "📚 Keep Studying",
        message: "Review your mistakes and try again.",
        primaryAction: "Review Mistakes",
        primaryIcon: "📝"
      };
    }
  };

  const recommendation = getRecommendedAction();

  return (
    <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          🎯 Next Steps
        </h3>
        <div className={`p-3 rounded-lg ${
          isPassed 
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700'
            : 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700'
        }`}>
          <h4 className={`font-medium ${
            isPassed 
              ? 'text-green-800 dark:text-green-200'
              : 'text-orange-800 dark:text-orange-200'
          }`}>
            {recommendation.title}
          </h4>
          <p className={`text-sm mt-1 ${
            isPassed 
              ? 'text-green-700 dark:text-green-300'
              : 'text-orange-700 dark:text-orange-300'
          }`}>
            {recommendation.message}
          </p>
        </div>
      </div>

      {/* Primary Actions */}
      <div className="space-y-3 mb-6">
        {/* Primary Recommended Action */}
        {!isPassed && hasMistakes && onReviewMistakes && (
          <button
            onClick={onReviewMistakes}
            className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            <span className="text-lg">{recommendation.primaryIcon}</span>
            {recommendation.primaryAction}
            <div className="ml-auto bg-blue-500 text-xs px-2 py-1 rounded-full">
              Recommended
            </div>
          </button>
        )}

        {/* Retake Test */}
        {onRetakeTest && (
          <button
            onClick={onRetakeTest}
            className={`w-full flex items-center justify-center gap-3 font-medium py-3 px-4 rounded-lg transition-colors ${
              isPassed
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-600 hover:bg-gray-700 text-white'
            }`}
          >
            <span className="text-lg">🔄</span>
            Take New Test
            {isExcellentScore && (
              <div className="ml-auto bg-green-500 text-xs px-2 py-1 rounded-full">
                Recommended
              </div>
            )}
          </button>
        )}

        {/* Review Mistakes (if passed but still has mistakes) */}
        {isPassed && hasMistakes && onReviewMistakes && (
          <button
            onClick={onReviewMistakes}
            className="w-full flex items-center justify-center gap-3 bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            <span className="text-lg">📝</span>
            Review Mistakes ({testResults.mistakes.length + testResults.unansweredQuestions})
          </button>
        )}
      </div>

      {/* Secondary Actions */}
      <div className="space-y-2 mb-6">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Other Actions
        </div>

        {/* Share Results */}
        {onShareResults && isPassed && (
          <button
            onClick={onShareResults}
            className="w-full flex items-center justify-center gap-3 bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/30 dark:hover:bg-purple-800/50 text-purple-700 dark:text-purple-300 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            <span className="text-lg">📱</span>
            Share Results
          </button>
        )}

        {/* Back to Dashboard */}
        {onBackToDashboard && (
          <button
            onClick={onBackToDashboard}
            className="w-full flex items-center justify-center gap-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            <span className="text-lg">🏠</span>
            Back to Dashboard
          </button>
        )}
      </div>

      {/* Performance Insights */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          💡 Quick Stats
        </h4>
        
        <div className="grid grid-cols-1 gap-3">
          {/* Score Summary */}
          <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
            <span className="text-sm text-gray-600 dark:text-gray-400">Score</span>
            <span className={`text-sm font-semibold ${
              isPassed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {testResults.correctAnswers}/{testResults.totalQuestions} ({testResults.percentage}%)
            </span>
          </div>

          {/* Time Performance */}
          {testResults.timePerQuestion && (
            <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
              <span className="text-sm text-gray-600 dark:text-gray-400">Avg per Question</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {Math.floor(testResults.timePerQuestion / 60)}:
                {(testResults.timePerQuestion % 60).toString().padStart(2, '0')}
              </span>
            </div>
          )}

          {/* Category Performance */}
          <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
            <span className="text-sm text-gray-600 dark:text-gray-400">Strong Categories</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {testResults.categoryBreakdown.filter(cat => cat.accuracy >= 80).length}/
              {testResults.categoryBreakdown.length}
            </span>
          </div>

          {/* Pass Status */}
          <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
            <span className="text-sm text-gray-600 dark:text-gray-400">Pass Requirement</span>
            <span className={`text-sm font-semibold ${
              isPassed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {testResults.passingThreshold}/{testResults.totalQuestions} needed
            </span>
          </div>
        </div>
      </div>

      {/* Motivational Message */}
      <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
        <p className="text-sm text-blue-700 dark:text-blue-300 text-center">
          {isExcellentScore
            ? "🌟 Excellent work! You're well-prepared for the official test."
            : isPassed
            ? "🎯 Great job passing! Keep practicing to build confidence."
            : testResults.percentage >= 70
            ? "💪 You're close! A little more study and you'll pass next time."
            : "📚 Keep learning! Every test helps you improve. You've got this!"
          }
        </p>
      </div>
    </div>
  );
};