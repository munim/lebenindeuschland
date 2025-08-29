import { useMemo, useState, useEffect, useCallback } from 'react';
import { useTestSessionContext } from '@/contexts/TestSessionContext';

export interface ProgressStats {
  currentQuestionNumber: number;
  totalQuestions: number;
  questionsAnswered: number;
  questionsRemaining: number;
  percentageComplete: number;
  percentageAnswered: number;
  isComplete: boolean;
  elapsedTimeSeconds: number;
  timeRemainingSeconds: number;
  isTimeWarning: boolean;
  isTimeCritical: boolean;
  isTimeExpired: boolean;
}

export interface QuestionProgress {
  questionIndex: number;
  questionNumber: number;
  isAnswered: boolean;
  isCurrent: boolean;
}

const EXAM_DURATION_MINUTES = 60;
const EXAM_DURATION_SECONDS = EXAM_DURATION_MINUTES * 60;

export function useTestProgress() {
  const { currentSession, currentQuestionIndex, completeTest } = useTestSessionContext();
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  // Auto-complete test when time expires
  const handleTimeExpired = useCallback(async () => {
    if (currentSession && currentSession.status === 'active') {
      console.log('Test time expired - auto-submitting');
      try {
        await completeTest();
      } catch (error) {
        console.error('Failed to auto-complete test on time expiry:', error);
      }
    }
  }, [currentSession, completeTest]);

  // Update current time every second when there's an active session
  useEffect(() => {
    if (!currentSession) return;

    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, [currentSession]);

  const progressStats: ProgressStats = useMemo(() => {
    if (!currentSession) {
      return {
        currentQuestionNumber: 0,
        totalQuestions: 0,
        questionsAnswered: 0,
        questionsRemaining: 0,
        percentageComplete: 0,
        percentageAnswered: 0,
        isComplete: false,
        elapsedTimeSeconds: 0,
        timeRemainingSeconds: EXAM_DURATION_SECONDS,
        isTimeWarning: false,
        isTimeCritical: false,
        isTimeExpired: false,
      };
    }

    const totalQuestions = currentSession.questions.length;
    const questionsAnswered = Object.keys(currentSession.answers).length;
    const questionsRemaining = totalQuestions - questionsAnswered;
    const currentQuestionNumber = currentQuestionIndex + 1;
    
    // Calculate percentages
    const percentageComplete = totalQuestions > 0 
      ? Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100) 
      : 0;
    const percentageAnswered = totalQuestions > 0 
      ? Math.round((questionsAnswered / totalQuestions) * 100) 
      : 0;

    // Calculate elapsed time using current time
    // Handle both Date object and ISO string from localStorage
    const startTime = currentSession.startTime instanceof Date 
      ? currentSession.startTime.getTime()
      : new Date(currentSession.startTime).getTime();
    const elapsedTimeSeconds = Math.floor((currentTime - startTime) / 1000);
    
    // Calculate remaining time (60 minutes total)
    const timeRemainingSeconds = Math.max(0, EXAM_DURATION_SECONDS - elapsedTimeSeconds);
    
    // Time warnings
    const isTimeExpired = timeRemainingSeconds <= 0;
    const isTimeCritical = timeRemainingSeconds <= 300; // 5 minutes
    const isTimeWarning = timeRemainingSeconds <= 900; // 15 minutes

    return {
      currentQuestionNumber,
      totalQuestions,
      questionsAnswered,
      questionsRemaining,
      percentageComplete,
      percentageAnswered,
      isComplete: questionsAnswered === totalQuestions,
      elapsedTimeSeconds,
      timeRemainingSeconds,
      isTimeWarning,
      isTimeCritical,
      isTimeExpired,
    };
  }, [currentSession, currentQuestionIndex, currentTime]);

  // Handle time expiration
  useEffect(() => {
    if (progressStats.isTimeExpired && currentSession?.status === 'active') {
      handleTimeExpired();
    }
  }, [progressStats.isTimeExpired, currentSession?.status, handleTimeExpired]);

  const questionProgress: QuestionProgress[] = useMemo(() => {
    if (!currentSession) return [];

    return currentSession.questions.map((question, index) => ({
      questionIndex: index,
      questionNumber: index + 1,
      isAnswered: Boolean(currentSession.answers[question.id]),
      isCurrent: index === currentQuestionIndex,
    }));
  }, [currentSession, currentQuestionIndex]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressMessage = (): string => {
    if (!currentSession) return 'No active test session';

    const { questionsAnswered, questionsRemaining, isComplete } = progressStats;

    if (isComplete) {
      return 'All questions answered - ready to submit!';
    }

    if (questionsAnswered === 0) {
      return 'Test started - begin answering questions';
    }

    if (questionsRemaining === 1) {
      return 'One question remaining';
    }

    return `${questionsRemaining} questions remaining`;
  };

  const getUnansweredQuestionNumbers = (): number[] => {
    return questionProgress
      .filter(q => !q.isAnswered)
      .map(q => q.questionNumber);
  };

  const getAnsweredQuestionNumbers = (): number[] => {
    return questionProgress
      .filter(q => q.isAnswered)
      .map(q => q.questionNumber);
  };

  const isQuestionAnswered = (questionIndex: number): boolean => {
    if (!currentSession || questionIndex < 0 || questionIndex >= currentSession.questions.length) {
      return false;
    }
    
    const question = currentSession.questions[questionIndex];
    return Boolean(currentSession.answers[question.id]);
  };

  const getNextUnansweredQuestion = (): number | null => {
    const unanswered = questionProgress.find(q => !q.isAnswered);
    return unanswered ? unanswered.questionIndex : null;
  };

  const getPreviousAnsweredQuestion = (): number | null => {
    const answered = questionProgress
      .slice()
      .reverse()
      .find(q => q.isAnswered && q.questionIndex < currentQuestionIndex);
    return answered ? answered.questionIndex : null;
  };

    return {
      // Core progress data
      progressStats,
      questionProgress,

      // Helper functions
      formatTime,
      getProgressMessage,
      getUnansweredQuestionNumbers,
      getAnsweredQuestionNumbers,
      isQuestionAnswered,
      getNextUnansweredQuestion,
      getPreviousAnsweredQuestion,

      // Quick access to common values
      currentQuestionNumber: progressStats.currentQuestionNumber,
      totalQuestions: progressStats.totalQuestions,
      percentageComplete: progressStats.percentageComplete,
      percentageAnswered: progressStats.percentageAnswered,
      elapsedTime: formatTime(progressStats.elapsedTimeSeconds),
      timeRemaining: formatTime(progressStats.timeRemainingSeconds),
      isTimeWarning: progressStats.isTimeWarning,
      isTimeCritical: progressStats.isTimeCritical,
      isTimeExpired: progressStats.isTimeExpired,
      isComplete: progressStats.isComplete,
    };
  }