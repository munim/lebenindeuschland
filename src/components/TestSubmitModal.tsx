'use client';

import React, { useState } from 'react';
import { useTestSession } from '@/hooks/useTestSession';
import { useTestProgress } from '@/hooks/useTestProgress';
import { useTestAnswers } from '@/hooks/useTestAnswers';

interface TestSubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSubmit: () => Promise<void>;
  isSubmitting?: boolean;
}

export const TestSubmitModal: React.FC<TestSubmitModalProps> = ({
  isOpen,
  onClose,
  onConfirmSubmit,
  isSubmitting = false
}) => {
  const { totalQuestions } = useTestProgress();
  const { getUnansweredQuestions, canSubmitTest } = useTestAnswers();
  const { currentSession } = useTestSession();

  const [acceptIncompleteWarning, setAcceptIncompleteWarning] = useState(false);

  const unansweredQuestions = getUnansweredQuestions();
  const answeredCount = totalQuestions - unansweredQuestions.length;
  const isComplete = canSubmitTest;

  const handleSubmit = async () => {
    try {
      await onConfirmSubmit();
    } catch (error) {
      console.error('Failed to submit test:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={!isSubmitting ? onClose : undefined}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="p-4 sm:p-6">
            {/* Header */}
            <div className="flex items-start sm:items-center gap-3 mb-4">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                isComplete 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                  : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
              }`}>
                {isComplete ? (
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                )}
              </div>
              <div className="min-w-0">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                  {isComplete ? 'Submit Test' : 'Submit Incomplete Test'}
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Review your answers before final submission
                </p>
              </div>
            </div>

            {/* Test Summary */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 text-sm sm:text-base">
                📊 Test Summary
              </h3>
              
              <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {answeredCount}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 leading-tight">
                    Questions Answered
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-gray-600 dark:text-gray-400">
                    {totalQuestions}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 leading-tight">
                    Total Questions
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Progress</span>
                  <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">
                    {Math.round((answeredCount / totalQuestions) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${
                      isComplete 
                        ? 'bg-green-600' 
                        : 'bg-yellow-500'
                    }`}
                    style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
                  />
                </div>
              </div>

              {currentSession && (
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  <strong>State:</strong> {currentSession.state}
                </div>
              )}
            </div>

            {/* Warning for incomplete test */}
            {!isComplete && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3 sm:p-4 mb-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1 text-sm sm:text-base">
                      Incomplete Test Warning
                    </h4>
                    <p className="text-xs sm:text-sm text-yellow-700 dark:text-yellow-300 mb-3 leading-relaxed">
                      You have <strong>{unansweredQuestions.length} unanswered questions</strong>. 
                      These will be marked as incorrect and may affect your score.
                    </p>
                    
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={acceptIncompleteWarning}
                        onChange={(e) => setAcceptIncompleteWarning(e.target.checked)}
                        className="w-4 h-4 text-yellow-600 bg-white border-yellow-300 rounded focus:ring-yellow-500 dark:bg-gray-700 dark:border-yellow-600 mt-0.5 flex-shrink-0"
                      />
                      <span className="text-xs sm:text-sm text-yellow-700 dark:text-yellow-300 leading-relaxed">
                        I understand and want to submit anyway
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Completion confirmation */}
            {isComplete && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-3 sm:p-4 mb-4">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-green-800 dark:text-green-200 mb-1 text-sm sm:text-base">
                      Test Complete
                    </h4>
                    <p className="text-xs sm:text-sm text-green-700 dark:text-green-300 leading-relaxed">
                      You have answered all questions. Your test is ready for submission.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-end">
              <button
                onClick={onClose}
                disabled={isSubmitting}
                className="order-2 sm:order-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {isSubmitting ? 'Submitting...' : 'Review More'}
              </button>
              
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || (!isComplete && !acceptIncompleteWarning)}
                className={`order-1 sm:order-2 px-4 sm:px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base ${
                  isComplete
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                }`}
              >
                {isSubmitting && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                {isSubmitting ? 'Submitting...' : 'Submit Test'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};