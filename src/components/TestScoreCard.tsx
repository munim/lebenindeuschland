'use client';

import React from 'react';
import { TestScoreDetails } from '@/lib/services/TestScoringService';

interface TestScoreCardProps {
  testResults: TestScoreDetails;
  className?: string;
}

export const TestScoreCard: React.FC<TestScoreCardProps> = ({
  testResults,
  className = ''
}) => {
  const getScoreColorClass = (passed: boolean) => {
    return passed 
      ? 'text-green-600 dark:text-green-400' 
      : 'text-red-600 dark:text-red-400';
  };

  const getScoreBackgroundClass = (passed: boolean) => {
    return passed 
      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' 
      : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700';
  };

  const formatTimePerQuestion = () => {
    if (!testResults.timePerQuestion) return null;
    
    const minutes = Math.floor(testResults.timePerQuestion / 60);
    const seconds = testResults.timePerQuestion % 60;
    
    return minutes > 0 
      ? `${minutes}m ${seconds}s` 
      : `${seconds}s`;
  };

  const getProgressWidth = (value: number, total: number) => {
    return total > 0 ? (value / total) * 100 : 0;
  };

  return (
    <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          📊 Test Score
        </h2>
        <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreBackgroundClass(testResults.passed)}`}>
          {testResults.passed ? '✅ PASSED' : '❌ NOT PASSED'}
        </div>
      </div>

      {/* Main Score Display */}
      <div className="text-center mb-8">
        <div className={`text-6xl font-bold ${getScoreColorClass(testResults.passed)} mb-2`}>
          {testResults.correctAnswers}
          <span className="text-2xl text-gray-500 dark:text-gray-400">/{testResults.totalQuestions}</span>
        </div>
        <div className={`text-xl font-semibold ${getScoreColorClass(testResults.passed)}`}>
          {testResults.percentage}%
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          {testResults.passed 
            ? `Excellent! You passed with ${testResults.correctAnswers - testResults.passingThreshold} extra correct answers.`
            : `You need ${testResults.passingThreshold - testResults.correctAnswers} more correct answers to pass.`
          }
        </div>
      </div>

      {/* Score Breakdown Bars */}
      <div className="space-y-4 mb-6">
        {/* Correct Answers */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              ✅ Correct Answers
            </span>
            <span className="text-sm font-semibold text-green-600 dark:text-green-400">
              {testResults.correctAnswers}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div 
              className="bg-green-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${getProgressWidth(testResults.correctAnswers, testResults.totalQuestions)}%` }}
            />
          </div>
        </div>

        {/* Incorrect Answers */}
        {testResults.incorrectAnswers > 0 && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                ❌ Incorrect Answers
              </span>
              <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                {testResults.incorrectAnswers}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div 
                className="bg-red-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${getProgressWidth(testResults.incorrectAnswers, testResults.totalQuestions)}%` }}
              />
            </div>
          </div>
        )}

        {/* Unanswered Questions */}
        {testResults.unansweredQuestions > 0 && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                ⏸️ Unanswered Questions
              </span>
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                {testResults.unansweredQuestions}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div 
                className="bg-gray-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${getProgressWidth(testResults.unansweredQuestions, testResults.totalQuestions)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Pass/Fail Threshold Indicator */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Passing Threshold
          </span>
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {testResults.passingThreshold}/{testResults.totalQuestions}
          </span>
        </div>
        
        <div className="relative w-full bg-gray-200 dark:bg-gray-600 rounded-full h-4">
          {/* Background progress */}
          <div 
            className={`absolute top-0 left-0 h-4 rounded-full transition-all duration-500 ${
              testResults.passed ? 'bg-green-600' : 'bg-red-600'
            }`}
            style={{ width: `${getProgressWidth(testResults.correctAnswers, testResults.totalQuestions)}%` }}
          />
          
          {/* Passing threshold line */}
          <div 
            className="absolute top-0 h-4 w-0.5 bg-gray-800 dark:bg-gray-200"
            style={{ left: `${getProgressWidth(testResults.passingThreshold, testResults.totalQuestions)}%` }}
          />
          
          {/* Passing threshold label */}
          <div 
            className="absolute -top-6 text-xs text-gray-600 dark:text-gray-400 transform -translate-x-1/2"
            style={{ left: `${getProgressWidth(testResults.passingThreshold, testResults.totalQuestions)}%` }}
          >
            Pass
          </div>
        </div>
        
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
          <span>0</span>
          <span>{testResults.totalQuestions}</span>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
            {testResults.percentage}%
          </div>
          <div className="text-xs text-blue-800 dark:text-blue-300 font-medium">
            Accuracy
          </div>
        </div>
        
        {testResults.timePerQuestion && (
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
            <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
              {formatTimePerQuestion()}
            </div>
            <div className="text-xs text-purple-800 dark:text-purple-300 font-medium">
              Avg. per Question
            </div>
          </div>
        )}
      </div>

      {/* Motivational Message */}
      <div className="mt-6 text-center">
        <div className={`p-3 rounded-lg border ${getScoreBackgroundClass(testResults.passed)}`}>
          <p className={`text-sm font-medium ${
            testResults.passed 
              ? 'text-green-800 dark:text-green-200' 
              : 'text-red-800 dark:text-red-200'
          }`}>
            {testResults.passed 
              ? testResults.percentage >= 90 
                ? "🎉 Outstanding performance! You're well prepared for the real test!"
                : testResults.percentage >= 80 
                ? "🌟 Great job! You passed with a solid score!"
                : "✅ Well done! You passed the test successfully!"
              : testResults.percentage >= 80
              ? "📈 Very close! Just a few more correct answers and you'll pass!"
              : testResults.percentage >= 60
              ? "📚 Getting there! Review the areas you missed and try again."
              : "💪 Keep studying! Focus on the fundamentals and you'll improve."
            }
          </p>
        </div>
      </div>
    </div>
  );
};