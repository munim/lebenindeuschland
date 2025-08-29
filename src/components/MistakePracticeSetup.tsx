'use client';

import React, { useState, useEffect } from 'react';
import { MistakePracticeService, MistakePracticeOptions } from '@/lib/services/MistakePracticeService';
import { useTestSession } from '@/hooks/useTestSession';

interface MistakePracticeSetupProps {
  onTestStart?: () => void;
  onCancel?: () => void;
}

interface PracticeOptions {
  totalMistakes: number;
  categoriesWithMistakes: Array<{ category: string; count: number }>;
  recentTestsWithMistakes: Array<{ testId: string; state: string; completedAt: Date; mistakeCount: number }>;
}

export const MistakePracticeSetup: React.FC<MistakePracticeSetupProps> = ({
  onTestStart,
  onCancel
}) => {
  const [practiceOptions, setPracticeOptions] = useState<PracticeOptions | null>(null);
  const [selectedOption, setSelectedOption] = useState<'all' | 'category' | 'recent-test' | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTestId, setSelectedTestId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { startMistakePractice, isLoading } = useTestSession();

  useEffect(() => {
    loadPracticeOptions();
  }, []);

  const loadPracticeOptions = async () => {
    try {
      const options = await MistakePracticeService.getAvailablePracticeOptions();
      setPracticeOptions(options);
      
      if (options.totalMistakes === 0) {
        setError('No mistakes found. Take a test first to practice your mistakes!');
      }
    } catch (err) {
      setError('Failed to load mistake practice options');
      console.error('Error loading practice options:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartPractice = async () => {
    if (!practiceOptions || !selectedOption) return;

    try {
      const options: MistakePracticeOptions = {};

      switch (selectedOption) {
        case 'category':
          if (!selectedCategory) {
            setError('Please select a category');
            return;
          }
          options.category = selectedCategory;
          break;
        case 'recent-test':
          if (!selectedTestId) {
            setError('Please select a test');
            return;
          }
          options.sourceTestIds = [selectedTestId];
          break;
        case 'all':
        default:
          // Use all mistakes
          break;
      }

      await startMistakePractice(options);
      onTestStart?.();
    } catch (error) {
      setError('Failed to start mistake practice');
      console.error('Failed to start mistake practice:', error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 shadow-sm">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading mistake practice options...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!practiceOptions || practiceOptions.totalMistakes === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 shadow-sm">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              🔄 Mistake Practice
            </h1>
            <div className="text-6xl mb-4">📚</div>
            <p className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">
              No Mistakes to Practice Yet
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Take a test first to build your mistake practice library!
            </p>
            <button
              onClick={onCancel}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Back to Test Center
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 shadow-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            🔄 Mistake Practice
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Practice questions you&apos;ve gotten wrong in previous tests
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
            <p className="text-red-800 dark:text-red-200 text-sm">
              ⚠️ {error}
            </p>
          </div>
        )}

        <div className="space-y-6">
          {/* Practice Statistics */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-blue-50 dark:bg-blue-900/20">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
              📊 Your Mistakes Summary
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {practiceOptions.totalMistakes}
                </div>
                <div className="text-sm text-blue-800 dark:text-blue-300">
                  Total Unique Mistakes
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {practiceOptions.categoriesWithMistakes.length}
                </div>
                <div className="text-sm text-blue-800 dark:text-blue-300">
                  Categories with Mistakes
                </div>
              </div>
            </div>
          </div>

          {/* Practice Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Choose Practice Mode
            </h3>

            {/* All Mistakes */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
              <label className="flex items-start p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg">
                <input
                  type="radio"
                  name="practiceOption"
                  value="all"
                  checked={selectedOption === 'all'}
                  onChange={() => setSelectedOption('all')}
                  className="mt-1 mr-3"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    🎯 All Your Mistakes
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Practice all {practiceOptions.totalMistakes} unique questions you&apos;ve gotten wrong
                  </div>
                </div>
              </label>
            </div>

            {/* Category-specific Mistakes */}
            {practiceOptions.categoriesWithMistakes.length > 0 && (
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
                <label className="flex items-start p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg">
                  <input
                    type="radio"
                    name="practiceOption"
                    value="category"
                    checked={selectedOption === 'category'}
                    onChange={() => setSelectedOption('category')}
                    className="mt-1 mr-3"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      📚 Practice by Category
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Focus on mistakes from a specific knowledge category
                    </div>
                    {selectedOption === 'category' && (
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="mt-3 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value="">Select a category...</option>
                        {practiceOptions.categoriesWithMistakes.map((category) => (
                          <option key={category.category} value={category.category}>
                            {category.category} ({category.count} mistakes)
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </label>
              </div>
            )}

            {/* Recent Test Mistakes */}
            {practiceOptions.recentTestsWithMistakes.length > 0 && (
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
                <label className="flex items-start p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg">
                  <input
                    type="radio"
                    name="practiceOption"
                    value="recent-test"
                    checked={selectedOption === 'recent-test'}
                    onChange={() => setSelectedOption('recent-test')}
                    className="mt-1 mr-3"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      🕒 Recent Test Mistakes
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Practice mistakes from a specific recent test
                    </div>
                    {selectedOption === 'recent-test' && (
                      <select
                        value={selectedTestId}
                        onChange={(e) => setSelectedTestId(e.target.value)}
                        className="mt-3 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value="">Select a test...</option>
                        {practiceOptions.recentTestsWithMistakes.map((test) => (
                          <option key={test.testId} value={test.testId}>
                            {test.state} - {test.completedAt.toLocaleDateString()} ({test.mistakeCount} mistakes)
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </label>
              </div>
            )}
          </div>

          {/* Practice Info */}
          {selectedOption && (
            <div className="border border-green-200 dark:border-green-700 rounded-lg p-4 bg-green-50 dark:bg-green-900/20">
              <h4 className="text-sm font-semibold text-green-800 dark:text-green-200 mb-2">
                📝 Practice Session Details
              </h4>
              <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                <li>• This will count as a test in your history</li>
                <li>• Questions will be presented in random order</li>
                <li>• Same scoring rules apply (17/33 to pass)</li>
                <li>• You can review and navigate between questions</li>
                <li>• Results will be marked as &quot;Mistake Practice&quot;</li>
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            {onCancel && (
              <button
                onClick={onCancel}
                disabled={isLoading}
                className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            )}
            <button
              onClick={handleStartPractice}
              disabled={isLoading || !selectedOption || 
                (selectedOption === 'category' && !selectedCategory) ||
                (selectedOption === 'recent-test' && !selectedTestId)
              }
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Starting Practice...</span>
                </>
              ) : (
                <>
                  <span>🔄</span>
                  <span>Start Practice</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};