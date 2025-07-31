'use client';

import React, { useState, useEffect } from 'react';
import { Question } from '@/types/question';
import { QuestionCard } from '@/components/QuestionCard';
import { Pagination } from '@/components/Pagination';
import { LanguageSelector } from '@/components/LanguageSelector';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Footer } from '@/components/Footer';

const ITEMS_PER_PAGE = 1;

async function loadQuestions(): Promise<Question[]> {
  try {
    const response = await fetch('/api/questions');
    if (!response.ok) {
      throw new Error('Failed to fetch questions');
    }
    return response.json();
  } catch (error) {
    console.error('Error loading questions:', error);
    return [];
  }
}

export default function Home() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuestions().then((data) => {
      setQuestions(data);
      setLoading(false);
    });
  }, []);

  const totalPages = Math.ceil(questions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentQuestions = questions.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading questions...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors flex flex-col">
      <div className="flex-1">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header Section */}
          <header className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Leben In Deutschland
            </h1>
            <div className="flex items-center space-x-4">
              <LanguageSelector />
              <ThemeToggle />
            </div>
          </header>

          {/* Intro Section */}
          <div className="mb-8 text-center">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
              Questions and Answers
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Here you can find all questions and answers for the &apos;Life in Germany&apos; test
            </p>
          </div>

          {/* Content Section */}
          <div className="space-y-6">
            {currentQuestions.map((question, index) => (
              <QuestionCard
                key="question-card"
                question={question}
                questionNumber={startIndex + index + 1}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {questions.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}

          {questions.length === 0 && !loading && (
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