'use client';

import React, { useState } from 'react';
import { useTestSession } from '@/hooks/useTestSession';
import { useTestProgress } from '@/hooks/useTestProgress';
import { useTestAnswers } from '@/hooks/useTestAnswers';
import { TestSubmitModal } from './TestSubmitModal';

interface TestNavigationProps {
  onPauseTest?: () => void;
  onCompleteTest?: () => void;
  onCancelTest?: () => void;
  showCompleteButton?: boolean;
  compact?: boolean;
  className?: string;
}

export const TestNavigation: React.FC<TestNavigationProps> = ({
  onPauseTest,
  onCompleteTest,
  onCancelTest,
  showCompleteButton = true,
  compact = false,
  className = ''
}) => {
  const {
    canNavigateNext,
    canNavigatePrevious,
    handleNext,
    handlePrevious,
    handleGoToQuestion,
    pauseTest,
    completeTest,
    isLoading,
    totalQuestions
  } = useTestSession();

  const {
    getUnansweredQuestions,
    canSubmitTest,
  } = useTestAnswers();

  const { currentQuestionNumber } = useTestProgress();

  const [showQuestionJump, setShowQuestionJump] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const unansweredQuestions = getUnansweredQuestions().map((_, index) => 
    index + 1
  );
  const hasUnansweredQuestions = unansweredQuestions.length > 0;

  const handlePause = async () => {
    try {
      await pauseTest();
      onPauseTest?.();
    } catch (error) {
      console.error('Failed to pause test:', error);
    }
  };

  const handleComplete = async () => {
    setShowSubmitModal(true);
  };

  const handleConfirmSubmit = async () => {
    try {
      setIsCompleting(true);
      setShowSubmitModal(false);
      const result = await completeTest();
      if (result) {
        onCompleteTest?.();
      }
    } catch (error) {
      console.error('Failed to complete test:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleQuestionJump = (questionNumber: number) => {
    const questionIndex = questionNumber - 1;
    handleGoToQuestion(questionIndex);
    setShowQuestionJump(false);
  };

  const getNextUnansweredQuestion = () => {
    return unansweredQuestions.find(num => num > currentQuestionNumber) || unansweredQuestions[0];
  };

  const getPreviousAnsweredQuestion = () => {
    // Find the previous question that has been answered
    for (let i = currentQuestionNumber - 1; i >= 1; i--) {
      if (!unansweredQuestions.includes(i)) {
        return i;
      }
    }
    return null;
  };

  const renderCompactNavigation = () => (
    <div className={`flex items-center justify-center gap-3 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg ${className}`}>
      {/* Previous Button */}
      <button
        onClick={handlePrevious}
        disabled={!canNavigatePrevious || isLoading}
        className="flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Previous question"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Question Counter - Responsive sizing */}
      <div className="flex items-center gap-2 text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 bg-blue-50 dark:bg-blue-900/30 px-3 py-2 rounded-lg">
        <span>{currentQuestionNumber} / {totalQuestions}</span>
      </div>

      {/* Next Button */}
      <button
        onClick={handleNext}
        disabled={!canNavigateNext || isLoading}
        className="flex items-center justify-center w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
        title="Next question"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );

  const renderFullNavigation = () => (
    <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 ${className}`}>
      <div className="flex flex-col space-y-4">
        {/* Quick Jump Options */}
        {hasUnansweredQuestions && (
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-600 dark:text-gray-400">Quick jump:</span>
            
            <button
              onClick={() => {
                const nextUnanswered = getNextUnansweredQuestion();
                if (nextUnanswered) handleQuestionJump(nextUnanswered);
              }}
              className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-medium"
              disabled={!getNextUnansweredQuestion()}
            >
              Next Unanswered ({unansweredQuestions.length} left)
            </button>

            {getPreviousAnsweredQuestion() && (
              <button
                onClick={() => {
                  const prevAnswered = getPreviousAnsweredQuestion();
                  if (prevAnswered) handleQuestionJump(prevAnswered);
                }}
                className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium"
              >
                Last Answered
              </button>
            )}
            
            <button
              onClick={() => setShowQuestionJump(!showQuestionJump)}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Jump to question"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        )}

        {/* Question Jump Panel */}
        {showQuestionJump && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Jump to Question</h4>
              <button
                onClick={() => setShowQuestionJump(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-11 gap-1">
              {Array.from({ length: totalQuestions }, (_, i) => i + 1).map((questionNum) => (
                <button
                  key={questionNum}
                  onClick={() => handleQuestionJump(questionNum)}
                  className={`
                    w-8 h-8 text-xs font-medium rounded transition-colors
                    ${questionNum === currentQuestionNumber
                      ? 'bg-blue-600 text-white border-2 border-blue-400'
                      : unansweredQuestions.includes(questionNum)
                      ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 border border-orange-300 dark:border-orange-600 hover:bg-orange-200 dark:hover:bg-orange-800/50'
                      : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-600 hover:bg-green-200 dark:hover:bg-green-800/50'
                    }
                  `}
                  title={`Question ${questionNum} (${unansweredQuestions.includes(questionNum) ? 'Unanswered' : 'Answered'})`}
                >
                  {questionNum}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons - Pause, Cancel, and Complete */}
        <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handlePause}
              disabled={isLoading || isCompleting}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Pause Test
            </button>
            
            {onCancelTest && (
              <button
                onClick={onCancelTest}
                disabled={isLoading || isCompleting}
                className="flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 border border-red-300 dark:border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Cancel test and return to dashboard"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel Test
              </button>
            )}
          </div>

          {showCompleteButton && (
            <div className="flex items-center gap-3">
              {hasUnansweredQuestions && (
                <span className="text-sm text-orange-600 dark:text-orange-400">
                  {unansweredQuestions.length} questions unanswered
                </span>
              )}
              
              <button
                onClick={handleComplete}
                disabled={isLoading || isCompleting}
                className={`
                  flex items-center gap-2 px-6 py-2 font-medium rounded-lg transition-colors disabled:cursor-not-allowed
                  ${canSubmitTest 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                  }
                  ${(isLoading || isCompleting) ? 'opacity-50' : ''}
                `}
              >
                {(isLoading || isCompleting) && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {canSubmitTest ? 'Complete Test' : 'Submit Partial Test'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {compact ? renderCompactNavigation() : renderFullNavigation()}
      
      {/* Test Submit Modal */}
      <TestSubmitModal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        onConfirmSubmit={handleConfirmSubmit}
        isSubmitting={isCompleting}
      />
    </>
  );
};