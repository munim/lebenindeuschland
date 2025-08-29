'use client';

import React from 'react';
import { useTestProgress } from '@/hooks/useTestProgress';

interface TestProgressBarProps {
  showDetailedStats?: boolean;
  showTimeInfo?: boolean;
  showQuestionNumbers?: boolean;
  compact?: boolean;
  className?: string;
}

export const TestProgressBar: React.FC<TestProgressBarProps> = ({
  showDetailedStats = true,
  showTimeInfo = true,
  showQuestionNumbers = false,
  compact = false,
  className = ''
}) => {
  const {
    progressStats,
    questionProgress,
    elapsedTime,
    timeRemaining,
    getProgressMessage,
    currentQuestionNumber,
    totalQuestions,
    percentageComplete,
    percentageAnswered,
    isTimeWarning,
    isTimeCritical,
    isTimeExpired,
  } = useTestProgress();

  if (totalQuestions === 0) {
    return null;
  }

  const renderQuestionIndicators = () => {
    if (!showQuestionNumbers || compact) return null;

    return (
      <div className="mt-4">
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          Question Progress
        </div>
        <div className="grid grid-cols-8 sm:grid-cols-11 gap-1 sm:gap-2 max-w-2xl">
          {questionProgress.map((question) => (
            <div
              key={question.questionIndex}
              className={`
                w-6 h-6 sm:w-8 sm:h-8 rounded text-xs sm:text-sm flex items-center justify-center font-medium transition-colors
                ${question.isCurrent
                  ? 'bg-blue-600 text-white border-2 border-blue-400'
                  : question.isAnswered
                  ? 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 border border-green-300 dark:border-green-600'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600'
                }
              `}
              title={`Question ${question.questionNumber}${question.isAnswered ? ' (Answered)' : ''}`}
            >
              {question.questionNumber}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCompactView = () => (
    <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Question {currentQuestionNumber} of {totalQuestions}
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {progressStats.questionsAnswered} answered
        </span>
      </div>
      
      <div className="relative">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${percentageComplete}%` }}
          />
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
          {percentageComplete}% complete
        </div>
      </div>
    </div>
  );

  const renderFullView = () => (
    <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          📊 Test Progress
        </h3>
        {showTimeInfo && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            ⏱️ {elapsedTime}
          </div>
        )}
      </div>

      {/* Progress Bars */}
      <div className="space-y-4 mb-6">
        {/* Completion Progress */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Current Position
            </span>
            <span className="text-sm text-gray-900 dark:text-gray-100 font-semibold">
              {currentQuestionNumber} / {totalQuestions}
            </span>
          </div>
          <div className="relative">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${percentageComplete}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
              {percentageComplete}% through test
            </div>
          </div>
        </div>

        {/* Answer Progress */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Questions Answered
            </span>
            <span className="text-sm text-gray-900 dark:text-gray-100 font-semibold">
              {progressStats.questionsAnswered} / {totalQuestions}
            </span>
          </div>
          <div className="relative">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-300 ${
                  progressStats.isComplete 
                    ? 'bg-green-600' 
                    : 'bg-yellow-500'
                }`}
                style={{ width: `${percentageAnswered}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
              {percentageAnswered}% answered
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      {showDetailedStats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4">
          <div className="text-center p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
              {progressStats.questionsAnswered}
            </div>
            <div className="text-xs sm:text-sm text-blue-800 dark:text-blue-300 font-medium">
              Answered
            </div>
          </div>
          
          <div className="text-center p-3 sm:p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div className="text-xl sm:text-2xl font-bold text-orange-600 dark:text-orange-400">
              {progressStats.questionsRemaining}
            </div>
            <div className="text-xs sm:text-sm text-orange-800 dark:text-orange-300 font-medium">
              Remaining
            </div>
          </div>

          {showTimeInfo && (
            <>
              <div className="text-center p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="text-lg sm:text-2xl font-bold text-gray-600 dark:text-gray-400">
                  {elapsedTime}
                </div>
                <div className="text-xs sm:text-sm text-gray-800 dark:text-gray-300 font-medium">
                  Elapsed
                </div>
              </div>
              
              <div className="text-center p-3 sm:p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className={`text-lg sm:text-2xl font-bold transition-colors ${
                  isTimeExpired 
                    ? 'text-red-600 dark:text-red-400' 
                    : isTimeCritical 
                    ? 'text-red-600 dark:text-red-400' 
                    : isTimeWarning 
                    ? 'text-orange-600 dark:text-orange-400'
                    : 'text-purple-600 dark:text-purple-400'
                }`}>
                  {isTimeExpired ? '0:00' : timeRemaining}
                </div>
                <div className={`text-xs sm:text-sm font-medium transition-colors ${
                  isTimeExpired 
                    ? 'text-red-800 dark:text-red-300' 
                    : isTimeCritical 
                    ? 'text-red-800 dark:text-red-300' 
                    : isTimeWarning 
                    ? 'text-orange-800 dark:text-orange-300'
                    : 'text-purple-800 dark:text-purple-300'
                }`}>
                  {isTimeExpired ? 'Time Up!' : 'Time Left'}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Progress Message */}
      <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
          {getProgressMessage()}
        </p>
        {progressStats.isComplete && (
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
            ✅ Ready to submit your test!
          </p>
        )}
      </div>

      {/* Question Indicators */}
      {renderQuestionIndicators()}
    </div>
  );

  return compact ? renderCompactView() : renderFullView();
};