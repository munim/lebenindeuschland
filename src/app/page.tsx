'use client';

import React from 'react';
import { Footer } from '@/components/Footer';
import { StudyView } from '@/components/StudyView';
import { TestDashboard } from '@/components/TestDashboard';
import { AppModeSelector } from '@/components/AppModeSelector';
import { useAppMode } from '@/contexts/AppModeContext';

export default function Home() {
  const { isStudyMode, isTestMode } = useAppMode();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors flex flex-col">
      <div className="flex-1">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <header className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Leben In Deutschland
              </h1>
              <AppModeSelector />
            </div>
          </header>

          {/* Conditionally render based on app mode */}
          {isStudyMode && <StudyView />}
          {isTestMode && <TestDashboard />}
        </div>
      </div>
      <Footer />
    </div>
  );
}