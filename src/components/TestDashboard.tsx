'use client';

import React, { useState, useEffect } from 'react';
import { useTestSession } from '@/hooks/useTestSession';
import { useTestResults } from '@/hooks/useTestResults';
import { TestSetupView } from './TestSetupView';
import { ActiveTestView } from './ActiveTestView';
import { TestResultsView } from './TestResultsView';
import { MistakePracticeSetup } from './MistakePracticeSetup';
import { TestSession, TestResult } from '@/types/question';

type TestPhase = 'dashboard' | 'setup' | 'active' | 'results' | 'mistake-practice';

export const TestDashboard: React.FC = () => {
  const { 
    currentSession, 
    isLoading, 
    error, 
    hasActiveSession, 
    loadUnfinishedSession,
    resetSession,
    startMistakePractice
  } = useTestSession();

  const { testResults, loadTestResults } = useTestResults();
  const [currentPhase, setCurrentPhase] = useState<TestPhase>('dashboard');

  // Check for existing session on load
  useEffect(() => {
    const checkForExistingSession = async () => {
      try {
        await loadUnfinishedSession();
      } catch (error) {
        console.error('Failed to load unfinished session:', error);
      }
    };

    checkForExistingSession();
  }, [loadUnfinishedSession]);

  // Update phase based on session status
  useEffect(() => {
    if (hasActiveSession && currentSession) {
      switch (currentSession.status) {
        case 'setup':
          setCurrentPhase('setup');
          break;
        case 'active':
        case 'paused':
          setCurrentPhase('active');
          break;
        case 'completed':
          setCurrentPhase('results');
          break;
        default:
          setCurrentPhase('dashboard');
      }
    } else {
      setCurrentPhase('dashboard');
    }
  }, [hasActiveSession, currentSession]);

  const handleStartNewTest = () => {
    setCurrentPhase('setup');
  };

  const handleStartMistakePractice = () => {
    setCurrentPhase('mistake-practice');
  };

  const handleStartMistakePracticeFromTest = async (testResult: TestResult) => {
    try {
      await startMistakePractice({
        sourceTestIds: [testResult.id || `${testResult.state}-${testResult.completedAt.toISOString()}`],
        maxQuestions: 33
      });
      setCurrentPhase('active');
    } catch (error) {
      console.error('Failed to start mistake practice from test:', error);
    }
  };

  const handleTestStart = () => {
    setCurrentPhase('active');
  };

  const handleTestComplete = async () => {
    setCurrentPhase('results');
    // Reload test results to show updated history
    await loadTestResults();
  };

  const handleTestPause = () => {
    // Stay in active phase for paused tests
    setCurrentPhase('active');
  };

  const handleBackToDashboard = async () => {
    try {
      resetSession();
      setCurrentPhase('dashboard');
      // Reload test results to show updated history
      await loadTestResults();
    } catch (error) {
      console.error('Failed to reset session:', error);
    }
  };

  const handleCancelSetup = () => {
    setCurrentPhase('dashboard');
  };

  // Render different phases
  switch (currentPhase) {
    case 'setup':
      return (
        <TestSetupView
          onTestStart={handleTestStart}
          onCancel={handleCancelSetup}
        />
      );

    case 'mistake-practice':
      return (
        <MistakePracticeSetup
          onTestStart={handleTestStart}
          onCancel={handleCancelSetup}
        />
      );

    case 'active':
      return (
        <ActiveTestView
          onTestComplete={handleTestComplete}
          onTestPause={handleTestPause}
          onTestCancel={handleBackToDashboard}
        />
      );

    case 'results':
      return (
        <TestResultsView
          onBackToDashboard={handleBackToDashboard}
          onRetakeTest={handleStartNewTest}
        />
      );

    case 'dashboard':
    default:
      return <DashboardView 
        onStartNewTest={handleStartNewTest}
        onStartMistakePractice={handleStartMistakePractice}
        onStartMistakePracticeFromTest={handleStartMistakePracticeFromTest}
        testHistory={testResults}
        hasActiveSession={hasActiveSession}
        currentSession={currentSession}
        onResumeTest={() => setCurrentPhase('active')}
        isLoading={isLoading}
        error={error}
      />;
  }
};

interface DashboardViewProps {
  onStartNewTest: () => void;
  onStartMistakePractice: () => void;
  onStartMistakePracticeFromTest: (testResult: TestResult) => void;
  testHistory: TestResult[];
  hasActiveSession: boolean;
  currentSession: TestSession | null;
  onResumeTest: () => void;
  isLoading: boolean;
  error: string | null;
}

const DashboardView: React.FC<DashboardViewProps> = ({
  onStartNewTest,
  onStartMistakePractice,
  onStartMistakePracticeFromTest,
  testHistory,
  hasActiveSession,
  currentSession,
  onResumeTest,
  isLoading,
  error
}) => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          🎯 Test Center
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Take practice tests, view your history, and track your progress
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}

      {/* Resume Test Card - Show if there's an active/paused session */}
      {hasActiveSession && currentSession && currentSession.status !== 'completed' && (
        <div className="mb-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                📝 Resume Your Test
              </h2>
              <p className="text-yellow-700 dark:text-yellow-300 mb-4">
                You have a {currentSession.status} test for {currentSession.state}. 
                Continue where you left off.
              </p>
              <div className="flex items-center gap-4 text-sm text-yellow-600 dark:text-yellow-400">
                <span>Questions: {Object.keys(currentSession.answers || {}).length} / {currentSession.questions?.length || 33} answered</span>
                <span>Status: {currentSession.status}</span>
              </div>
            </div>
            <button
              onClick={onResumeTest}
              disabled={isLoading}
              className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              {isLoading ? 'Loading...' : 'Resume Test'}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Start New Test Card */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            ✨ Start New Test
          </h2>
          <div className="space-y-4">
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <p>• 33 Questions from official question pool</p>
              <p>• Pass: 17/33 correct answers required</p>
              <p>• Balanced across all knowledge categories</p>
              <p>• Includes state-specific questions</p>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
              <h3 className="font-medium text-blue-800 dark:text-blue-200 text-sm mb-1">
                🎯 Test Features
              </h3>
              <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-0.5">
                <li>• Auto-save progress (survive browser refresh)</li>
                <li>• Pause and resume anytime</li>
                <li>• Question navigation and review</li>
                <li>• Instant results with detailed breakdown</li>
              </ul>
            </div>
            
            <button 
              onClick={onStartNewTest}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Loading...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Start New Test
                </>
              )}
            </button>
          </div>
        </div>

        {/* Mistake Practice Card */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            🔄 Mistake Practice
          </h2>
          <div className="space-y-4">
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <p>• Practice questions you got wrong</p>
              <p>• Focus on weak knowledge areas</p>
              <p>• Improve your passing chances</p>
              <p>• Same test format and scoring</p>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-3">
              <h3 className="font-medium text-green-800 dark:text-green-200 text-sm mb-1">
                📚 Practice Options
              </h3>
              <ul className="text-xs text-green-700 dark:text-green-300 space-y-0.5">
                <li>• All your previous mistakes</li>
                <li>• Mistakes from specific categories</li>
                <li>• Recent test mistakes only</li>
                <li>• Appears as &quot;Mistake Practice&quot; in history</li>
              </ul>
            </div>
            
            <button 
              onClick={onStartMistakePractice}
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Loading...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Practice Mistakes
                </>
              )}
            </button>
          </div>
        </div>

        {/* Test History Card */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            📊 Test History
          </h2>
          {testHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <div className="text-4xl mb-4">📈</div>
              <p className="text-lg font-medium mb-2">No tests taken yet</p>
              <p className="text-sm">Take your first test to see your progress here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {testHistory.map((test, index) => (
                <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {test.testType === 'mistake-practice' ? '🔄 ' : ''}{test.state} Test
                        </div>
                        {!test.isFullyCompleted && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200">
                            Incomplete
                          </span>
                        )}
                        {test.testType === 'mistake-practice' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200">
                            Mistake Practice
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Score: {test.score}/33 • {test.passed ? 'Passed' : 'Failed'}
                        {!test.isFullyCompleted && ` • ${test.unansweredQuestions} unanswered`}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {test.completedAt.toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Show Practice Mistakes button only if test has mistakes and isn't already a mistake practice */}
                      {test.testType !== 'mistake-practice' && test.mistakes && test.mistakes.length > 0 && (
                        <button
                          onClick={() => onStartMistakePracticeFromTest(test)}
                          disabled={isLoading}
                          className="px-3 py-1.5 text-xs font-medium bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-800 dark:text-green-200 rounded-lg transition-colors disabled:opacity-50"
                          title={`Practice ${test.mistakes.length} mistakes from this test`}
                        >
                          🔄 Practice ({test.mistakes.length})
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          📈 Your Progress Overview
        </h2>
        
        {testHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>Progress tracking will appear after taking your first test</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {testHistory.length}
              </div>
              <div className="text-sm text-blue-800 dark:text-blue-300 font-medium">
                Tests Taken
              </div>
            </div>
            
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {testHistory.filter(t => t.passed).length}
              </div>
              <div className="text-sm text-green-800 dark:text-green-300 font-medium">
                Tests Passed
              </div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {testHistory.length > 0 ? Math.round(testHistory.reduce((sum, t) => sum + t.score, 0) / testHistory.length) : 0}
              </div>
              <div className="text-sm text-purple-800 dark:text-purple-300 font-medium">
                Average Score
              </div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {testHistory.length > 0 ? Math.round((testHistory.filter(t => t.passed).length / testHistory.length) * 100) : 0}%
              </div>
              <div className="text-sm text-orange-800 dark:text-orange-300 font-medium">
                Pass Rate
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};