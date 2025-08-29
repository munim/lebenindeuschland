'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface SessionStats {
  correct: number;
  incorrect: number;
  total: number;
  startTime: Date;
  answeredQuestions: Set<string>; // Track question IDs to prevent double counting
}

interface SessionStatsContextType {
  stats: SessionStats;
  recordAnswer: (questionId: string, isCorrect: boolean) => void;
  resetSession: () => void;
  getAccuracyPercentage: () => number;
  getSessionDuration: () => number; // in minutes
}

const SessionStatsContext = createContext<SessionStatsContextType | undefined>(undefined);

export const useSessionStats = () => {
  const context = useContext(SessionStatsContext);
  if (context === undefined) {
    throw new Error('useSessionStats must be used within a SessionStatsProvider');
  }
  return context;
};

interface SessionStatsProviderProps {
  children: ReactNode;
}

export const SessionStatsProvider: React.FC<SessionStatsProviderProps> = ({ children }) => {
  const [stats, setStats] = useState<SessionStats>({
    correct: 0,
    incorrect: 0,
    total: 0,
    startTime: new Date(),
    answeredQuestions: new Set()
  });

  const recordAnswer = useCallback((questionId: string, isCorrect: boolean) => {
    setStats(prevStats => {
      // Prevent double counting same question in same session
      if (prevStats.answeredQuestions.has(questionId)) {
        return prevStats;
      }

      const newAnsweredQuestions = new Set(prevStats.answeredQuestions);
      newAnsweredQuestions.add(questionId);

      return {
        ...prevStats,
        correct: prevStats.correct + (isCorrect ? 1 : 0),
        incorrect: prevStats.incorrect + (isCorrect ? 0 : 1),
        total: prevStats.total + 1,
        answeredQuestions: newAnsweredQuestions
      };
    });
  }, []);

  const resetSession = useCallback(() => {
    setStats({
      correct: 0,
      incorrect: 0,
      total: 0,
      startTime: new Date(),
      answeredQuestions: new Set()
    });
  }, []);

  const getAccuracyPercentage = useCallback(() => {
    if (stats.total === 0) return 0;
    return Math.round((stats.correct / stats.total) * 100);
  }, [stats.correct, stats.total]);

  const getSessionDuration = useCallback(() => {
    const now = new Date();
    const durationMs = now.getTime() - (stats.startTime instanceof Date ? stats.startTime.getTime() : new Date(stats.startTime).getTime());
    return Math.floor(durationMs / (1000 * 60)); // Convert to minutes
  }, [stats.startTime]);

  return (
    <SessionStatsContext.Provider 
      value={{
        stats,
        recordAnswer,
        resetSession,
        getAccuracyPercentage,
        getSessionDuration
      }}
    >
      {children}
    </SessionStatsContext.Provider>
  );
};