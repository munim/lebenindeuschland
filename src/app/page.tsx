'use client';

import React, { useState, useEffect } from 'react';
import { Question, QuestionsResponse } from '@/types/question';
import { QuestionCard } from '@/components/QuestionCard';
import { Pagination } from '@/components/Pagination';
import { LanguageSelector } from '@/components/LanguageSelector';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Footer } from '@/components/Footer';
import { fetchQuestions } from '@/lib/api';

export default function Home() {
  const [questionsData, setQuestionsData] = useState<QuestionsResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setLoading(true);
        setError(null);
        // Always load German for the main page to get translations
        const data = await fetchQuestions('de', currentPage);
        setQuestionsData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load questions');
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [currentPage]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading questions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-red-600 dark:text-red-400">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors flex flex-col">
      <div className="flex-1">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <header className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Leben In Deutschland
            </h1>
            <div className="flex items-center space-x-4">
              <LanguageSelector />
              <ThemeToggle />
            </div>
          </header>

          <div className="mb-8 text-center">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
              Questions and Answers
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Here you can find all questions and answers for the &apos;Life in Germany&apos; test
            </p>
            {questionsData && (
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                Page {questionsData.pagination.page} of {questionsData.pagination.totalPages} 
                ({questionsData.pagination.totalQuestions} total questions)
              </p>
            )}
          </div>

          <div className="space-y-6">
            {questionsData?.questions.map((question: Question) => (
              <QuestionCard
                key={`question-${question.id}`}
                question={question}
                questionNumber={parseInt(question.num)}
              />
            ))}
          </div>

          {questionsData && (
            <Pagination
              currentPage={questionsData.pagination.page}
              totalPages={questionsData.pagination.totalPages}
              onPageChange={setCurrentPage}
            />
          )}

          {!questionsData?.questions.length && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">
                No questions available. Please check your data configuration.
              </p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}