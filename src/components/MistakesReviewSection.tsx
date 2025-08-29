'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Question } from '@/types/question';

interface MistakeDetail {
  question: Question;
  selectedAnswer: string;
  correctAnswer: string;
}

interface MistakesReviewSectionProps {
  mistakes: Question[];
  userAnswers: Record<string, string>;
  className?: string;
}

export const MistakesReviewSection: React.FC<MistakesReviewSectionProps> = ({
  mistakes,
  userAnswers,
  className = ''
}) => {
  const [expandedMistakes, setExpandedMistakes] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);

  if (mistakes.length === 0) {
    return null;
  }

  const mistakeDetails: MistakeDetail[] = mistakes.map(question => ({
    question,
    selectedAnswer: userAnswers[question.id] || '',
    correctAnswer: question.solution
  }));

  const displayedMistakes = showAll ? mistakeDetails : mistakeDetails.slice(0, 3);

  const toggleExpanded = (questionId: string) => {
    const newExpanded = new Set(expandedMistakes);
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId);
    } else {
      newExpanded.add(questionId);
    }
    setExpandedMistakes(newExpanded);
  };

  const getAnswerText = (question: Question, answerKey: string): string => {
    if (!answerKey) return 'Not answered';
    switch (answerKey) {
      case 'a': return question.a;
      case 'b': return question.b;
      case 'c': return question.c;
      case 'd': return question.d;
      default: return 'Invalid answer';
    }
  };

  const getAnswerIcon = (isCorrect: boolean, isSelected: boolean) => {
    if (isCorrect && isSelected) {
      // This shouldn't happen in mistakes, but just in case
      return '✅';
    } else if (isCorrect) {
      return '✅';
    } else if (isSelected) {
      return '❌';
    } else {
      return '⚪';
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Questions Review
          </h3>
          <div className="ml-auto bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 px-3 py-1 rounded-full text-sm font-medium">
            {mistakes.length} incorrect
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Review your incorrect answers to understand where you can improve.
        </p>
      </div>

      {/* Mistakes List */}
      <div className="p-6">
        <div className="space-y-4">
          {displayedMistakes.map((mistake, index) => {
            const isExpanded = expandedMistakes.has(mistake.question.id);
            
            return (
              <div 
                key={mistake.question.id}
                className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden"
              >
                {/* Mistake Summary */}
                <div 
                  className="p-4 bg-gray-50 dark:bg-gray-700/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => toggleExpanded(mistake.question.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-full text-sm font-medium">
                        {index + 1}
                      </span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                            Question #{mistake.question.num}
                          </p>
                          <p className="text-gray-700 dark:text-gray-300 line-clamp-2">
                            {mistake.question.question}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {mistake.question.category}
                          </span>
                          <svg 
                            className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                      
                      {/* Quick Answer Summary */}
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <div className="flex items-center gap-1">
                          <span className="text-red-600 dark:text-red-400">Your answer:</span>
                          <span className="font-medium text-red-700 dark:text-red-300">
                            {mistake.selectedAnswer.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-green-600 dark:text-green-400">Correct:</span>
                          <span className="font-medium text-green-700 dark:text-green-300">
                            {mistake.correctAnswer.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-600">
                    {/* Full Question */}
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                        Question #{mistake.question.num}
                      </h4>
                      <p className="text-gray-800 dark:text-gray-200 mb-3">
                        {mistake.question.question}
                      </p>
                      
                      {/* Context if available */}
                      {mistake.question.context && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3 mb-3">
                          <p className="text-sm text-blue-800 dark:text-blue-200">
                            <strong>Context:</strong> {mistake.question.context}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Answer Options */}
                    <div className="space-y-2">
                      {['a', 'b', 'c', 'd'].map((optionKey) => {
                        const isCorrect = optionKey === mistake.correctAnswer;
                        const isSelected = optionKey === mistake.selectedAnswer;
                        const optionText = getAnswerText(mistake.question, optionKey);
                        
                        return (
                          <div 
                            key={optionKey}
                            className={`flex items-start gap-3 p-3 rounded-lg border-2 transition-colors ${
                              isCorrect 
                                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                                : isSelected 
                                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
                                : 'bg-gray-50 dark:bg-gray-700/30 border-gray-200 dark:border-gray-600'
                            }`}
                          >
                            <div className="flex-shrink-0 pt-1">
                              <span className="text-lg">
                                {getAnswerIcon(isCorrect, isSelected)}
                              </span>
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`font-semibold text-sm ${
                                  isCorrect 
                                    ? 'text-green-800 dark:text-green-200'
                                    : isSelected 
                                    ? 'text-red-800 dark:text-red-200'
                                    : 'text-gray-600 dark:text-gray-400'
                                }`}>
                                  {optionKey.toUpperCase()})
                                </span>
                                
                                {isCorrect && (
                                  <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-2 py-1 rounded-full font-medium">
                                    Correct Answer
                                  </span>
                                )}
                                
                                {isSelected && !isCorrect && (
                                  <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 px-2 py-1 rounded-full font-medium">
                                    Your Answer
                                  </span>
                                )}
                              </div>
                              
                              <p className={`text-sm ${
                                isCorrect 
                                  ? 'text-green-700 dark:text-green-300'
                                  : isSelected 
                                  ? 'text-red-700 dark:text-red-300'
                                  : 'text-gray-700 dark:text-gray-300'
                              }`}>
                                {optionText}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Image if available */}
                    {mistake.question.image && (
                      <div className="mt-4 text-center">
                        <Image 
                          src={mistake.question.image} 
                          alt={`Question ${mistake.question.num} diagram`}
                          width={500}
                          height={300}
                          className="max-w-full h-auto mx-auto rounded-lg border border-gray-200 dark:border-gray-600"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Show More/Less Button */}
        {mistakes.length > 3 && (
          <div className="mt-6 text-center">
            <button
              onClick={() => setShowAll(!showAll)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
            >
              {showAll ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                  Show Less
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  Show All {mistakes.length} Questions
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};