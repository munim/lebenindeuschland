'use client';

import React from 'react';
import { CategoryScore } from '@/types/question';

interface CategoryBreakdownCardProps {
  categoryBreakdown: CategoryScore[];
  performanceAnalysis?: {
    strongCategories: string[];
    weakCategories: string[];
    consistencyScore: number;
    difficultyPattern: 'improving' | 'declining' | 'consistent' | 'mixed';
  } | null;
  className?: string;
}

export const CategoryBreakdownCard: React.FC<CategoryBreakdownCardProps> = ({
  categoryBreakdown,
  performanceAnalysis,
  className = ''
}) => {
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

  const getAccuracyColorClass = (accuracy: number) => {
    if (accuracy >= 80) return 'text-green-600 dark:text-green-400';
    if (accuracy >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getAccuracyBackgroundClass = (accuracy: number) => {
    if (accuracy >= 80) return 'bg-green-100 dark:bg-green-900/30';
    if (accuracy >= 60) return 'bg-yellow-100 dark:bg-yellow-900/30';
    return 'bg-red-100 dark:bg-red-900/30';
  };

  const getAccuracyBorderClass = (accuracy: number) => {
    if (accuracy >= 80) return 'border-green-200 dark:border-green-700';
    if (accuracy >= 60) return 'border-yellow-200 dark:border-yellow-700';
    return 'border-red-200 dark:border-red-700';
  };

  const sortedCategories = [...categoryBreakdown].sort((a, b) => b.accuracy - a.accuracy);

  return (
    <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          📈 Category Performance
        </h3>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {categoryBreakdown.length} categories
        </div>
      </div>

      {/* Category List */}
      <div className="space-y-4">
        {sortedCategories.map((category, index) => (
          <div 
            key={category.category}
            className={`border rounded-lg p-4 transition-all ${getAccuracyBorderClass(category.accuracy)} ${getAccuracyBackgroundClass(category.accuracy)}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-lg">{getCategoryIcon(category.category)}</span>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">
                    {category.category.replace(/^'|'$/g, '')}
                  </h4>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {category.correct}/{category.total} correct
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className={`text-xl font-bold ${getAccuracyColorClass(category.accuracy)}`}>
                  {category.accuracy}%
                </div>
                {performanceAnalysis && (
                  <div className="text-xs">
                    {performanceAnalysis.strongCategories.includes(category.category) && (
                      <span className="text-green-600 dark:text-green-400 font-medium">Strong</span>
                    )}
                    {performanceAnalysis.weakCategories.includes(category.category) && (
                      <span className="text-orange-600 dark:text-orange-400 font-medium">Improve</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mb-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  category.accuracy >= 80 ? 'bg-green-600' :
                  category.accuracy >= 60 ? 'bg-yellow-500' :
                  'bg-red-600'
                }`}
                style={{ width: `${category.accuracy}%` }}
              />
            </div>

            {/* Performance Indicator */}
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500 dark:text-gray-400">
                {index + 1}. {category.accuracy >= 80 ? 'Excellent' : 
                  category.accuracy >= 60 ? 'Good' : 'Needs Work'}
              </span>
              <span className={getAccuracyColorClass(category.accuracy)}>
                {category.accuracy}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {Math.round(sortedCategories.reduce((sum, cat) => sum + cat.accuracy, 0) / sortedCategories.length)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Average Accuracy
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {sortedCategories.filter(cat => cat.accuracy >= 80).length}/{sortedCategories.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Strong Categories
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {performanceAnalysis && performanceAnalysis.weakCategories.length > 0 && (
        <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg">
          <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-2">
            💡 Recommendations
          </h4>
          <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
            {performanceAnalysis.weakCategories.slice(0, 2).map((category, index) => (
              <li key={index}>
                • Review {category.replace(/^'|'$/g, '')} topics before your next test
              </li>
            ))}
            {performanceAnalysis.weakCategories.length > 2 && (
              <li>• Focus extra study time on weaker subject areas</li>
            )}
          </ul>
        </div>
      )}

      {/* Consistency Badge */}
      {performanceAnalysis && (
        <div className="mt-4 text-center">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            performanceAnalysis.consistencyScore >= 80 
              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
              : performanceAnalysis.consistencyScore >= 60
              ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
              : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
          }`}>
            {performanceAnalysis.consistencyScore >= 80 ? '🎯' : 
             performanceAnalysis.consistencyScore >= 60 ? '📊' : '📈'} 
            {performanceAnalysis.consistencyScore}% Consistency
          </div>
        </div>
      )}
    </div>
  );
};