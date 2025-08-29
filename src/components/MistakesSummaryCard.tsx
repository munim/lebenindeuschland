'use client';

import React, { useState } from 'react';
import { Question } from '@/types/question';

interface MistakesSummaryCardProps {
  mistakes: Question[];
  unansweredQuestions: Question[];
  onReviewMistakes?: () => void;
  className?: string;
}

export const MistakesSummaryCard: React.FC<MistakesSummaryCardProps> = ({
  mistakes,
  unansweredQuestions,
  onReviewMistakes,
  className = ''
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'mistakes' | 'unanswered'>('mistakes');

  const totalIssues = mistakes.length + unansweredQuestions.length;
  const hasMistakes = mistakes.length > 0;
  const hasUnanswered = unansweredQuestions.length > 0;

  const getCategoryIcon = (category: string) => {
    const normalizeCategory = (cat: string) => cat.replace(/^'|'$/g, '');
    const normalized = normalizeCategory(category);
    
    const iconMap: Record<string, string> = {
      'History & Geography': '🏛️',
      'Democracy & Politics': '🗳️',
      'Rights & Freedoms': '⚖️',
      'Law & Governance': '🏛️',
      'Elections': '🗳️',
      'Education & Religion': '🎓',
      'Economy & Employment': '💼',
      'Federal System': '🏢',
      'Constitution': '📜',
      'Assembly & Protests': '✊',
    };
    
    return iconMap[normalized] || '📚';
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  if (totalIssues === 0) {
    return (
      <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 ${className}`}>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
            Perfect Score!
          </h3>
          <p className="text-green-700 dark:text-green-300">
            You answered all questions correctly. Excellent work!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          📝 Review Areas
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {totalIssues} questions to review
          </span>
          {onReviewMistakes && totalIssues > 0 && (
            <button
              onClick={onReviewMistakes}
              className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md transition-colors"
            >
              Review
            </button>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {hasMistakes && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {mistakes.length}
            </div>
            <div className="text-sm text-red-800 dark:text-red-300 font-medium">
              Incorrect Answers
            </div>
          </div>
        )}
        
        {hasUnanswered && (
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {unansweredQuestions.length}
            </div>
            <div className="text-sm text-orange-800 dark:text-orange-300 font-medium">
              Unanswered
            </div>
          </div>
        )}
      </div>

      {/* Toggle Details Button */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors mb-4"
      >
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {showDetails ? 'Hide' : 'Show'} Question Details
        </span>
        <svg 
          className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${showDetails ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Detailed View */}
      {showDetails && (
        <div className="space-y-4">
          {/* Tabs */}
          {hasMistakes && hasUnanswered && (
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setSelectedTab('mistakes')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  selectedTab === 'mistakes'
                    ? 'border-red-600 text-red-600 dark:text-red-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Incorrect ({mistakes.length})
              </button>
              <button
                onClick={() => setSelectedTab('unanswered')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  selectedTab === 'unanswered'
                    ? 'border-orange-600 text-orange-600 dark:text-orange-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Unanswered ({unansweredQuestions.length})
              </button>
            </div>
          )}

          {/* Questions List */}
          <div className="space-y-3">
            {((selectedTab === 'mistakes' && hasMistakes) || (!hasUnanswered && hasMistakes)) &&
              mistakes.slice(0, 5).map((question, index) => (
                <div key={question.id} className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <span className="text-lg">{getCategoryIcon(question.category)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded">
                          Question {index + 1}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {question.category.replace(/^'|'$/g, '')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {truncateText(question.question)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

            {((selectedTab === 'unanswered' && hasUnanswered) || (!hasMistakes && hasUnanswered)) &&
              unansweredQuestions.slice(0, 5).map((question, index) => (
                <div key={question.id} className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg p-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <span className="text-lg">{getCategoryIcon(question.category)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded">
                          Question {index + 1}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {question.category.replace(/^'|'$/g, '')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {truncateText(question.question)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

            {/* Show more indicator */}
            {((selectedTab === 'mistakes' ? mistakes.length : unansweredQuestions.length) > 5) && (
              <div className="text-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ... and {(selectedTab === 'mistakes' ? mistakes.length : unansweredQuestions.length) - 5} more questions
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Study Recommendation */}
      {totalIssues > 0 && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
          <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
            📚 Study Recommendations
          </h4>
          <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            {hasMistakes && (
              <p>• Review the questions you answered incorrectly to understand the correct answers</p>
            )}
            {hasUnanswered && (
              <p>• Practice managing your time to ensure you can answer all questions</p>
            )}
            <p>• Focus on the categories where you made the most mistakes</p>
            {totalIssues > 10 && (
              <p>• Consider additional study time before retaking the test</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};