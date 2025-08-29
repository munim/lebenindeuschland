import { useCallback, useMemo } from 'react';
import { useTestSessionContext } from '@/contexts/TestSessionContext';
import { Question } from '@/types/question';

export interface AnswerValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface AnswerStats {
  totalAnswered: number;
  totalUnanswered: number;
  answerDistribution: {
    a: number;
    b: number;
    c: number;
    d: number;
  };
}

export function useTestAnswers() {
  const { 
    currentSession, 
    currentQuestionIndex, 
    submitAnswer, 
    isSubmitting,
    error 
  } = useTestSessionContext();

  const currentQuestion = useMemo(() => {
    if (!currentSession) return null;
    return currentSession.questions[currentQuestionIndex] || null;
  }, [currentSession, currentQuestionIndex]);

  const currentAnswer = useMemo(() => {
    if (!currentSession || !currentQuestion) return null;
    return currentSession.answers[currentQuestion.id] || null;
  }, [currentSession, currentQuestion]);

  const allAnswers = useMemo(() => {
    return currentSession?.answers || {};
  }, [currentSession]);

  const answerStats: AnswerStats = useMemo(() => {
    if (!currentSession) {
      return {
        totalAnswered: 0,
        totalUnanswered: 0,
        answerDistribution: { a: 0, b: 0, c: 0, d: 0 },
      };
    }

    const totalAnswered = Object.keys(currentSession.answers).length;
    const totalUnanswered = currentSession.questions.length - totalAnswered;

    const distribution = { a: 0, b: 0, c: 0, d: 0 };
    Object.values(currentSession.answers).forEach((answer) => {
      if (answer === 'a' || answer === 'b' || answer === 'c' || answer === 'd') {
        distribution[answer]++;
      }
    });

    return {
      totalAnswered,
      totalUnanswered,
      answerDistribution: distribution,
    };
  }, [currentSession]);

  const validateAnswer = useCallback((answer: string): AnswerValidation => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic validation
    if (!answer) {
      errors.push('Answer is required');
    }

    if (answer && !['a', 'b', 'c', 'd'].includes(answer.toLowerCase())) {
      errors.push('Answer must be a, b, c, or d');
    }

    // Warnings for answer patterns
    if (currentSession && answer) {
      const answerCount = Object.values(currentSession.answers).filter(a => a === answer).length;
      const totalAnswered = Object.keys(currentSession.answers).length;
      
      // Warn if same answer selected too frequently
      if (totalAnswered >= 10 && answerCount / totalAnswered > 0.6) {
        warnings.push(`You've selected "${answer.toUpperCase()}" for most questions`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }, [currentSession]);

  const handleSubmitAnswer = useCallback(async (answer: string): Promise<boolean> => {
    if (!currentQuestion) {
      console.error('No current question available');
      return false;
    }

    const validation = validateAnswer(answer);
    if (!validation.isValid) {
      console.error('Invalid answer:', validation.errors);
      return false;
    }

    try {
      await submitAnswer(currentQuestion.id, answer);
      return true;
    } catch (error) {
      console.error('Failed to submit answer:', error);
      return false;
    }
  }, [currentQuestion, submitAnswer, validateAnswer]);

  const getAnswerForQuestion = useCallback((questionId: string): string | null => {
    if (!currentSession) return null;
    return currentSession.answers[questionId] || null;
  }, [currentSession]);

  const getAnswerForQuestionIndex = useCallback((questionIndex: number): string | null => {
    if (!currentSession || questionIndex < 0 || questionIndex >= currentSession.questions.length) {
      return null;
    }
    
    const question = currentSession.questions[questionIndex];
    return currentSession.answers[question.id] || null;
  }, [currentSession]);

  const isQuestionAnswered = useCallback((questionId: string): boolean => {
    return Boolean(allAnswers[questionId]);
  }, [allAnswers]);

  const getUnansweredQuestions = useCallback((): Question[] => {
    if (!currentSession) return [];
    
    return currentSession.questions.filter(
      question => !currentSession.answers[question.id]
    );
  }, [currentSession]);

  const getAnsweredQuestions = useCallback((): Question[] => {
    if (!currentSession) return [];
    
    return currentSession.questions.filter(
      question => currentSession.answers[question.id]
    );
  }, [currentSession]);

  const clearAnswerForQuestion = useCallback(async (questionId: string): Promise<void> => {
    // This would need to be implemented in the service layer
    // For now, we could submit an empty string or implement a dedicated clear method
    await submitAnswer(questionId, '');
  }, [submitAnswer]);

  const hasAnswerChanged = useCallback((questionId: string, newAnswer: string): boolean => {
    const currentAnswer = getAnswerForQuestion(questionId);
    return currentAnswer !== newAnswer;
  }, [getAnswerForQuestion]);

  const getAnswerSummary = useCallback(() => {
    if (!currentSession) return [];
    
    return currentSession.questions.map((question, index) => ({
      questionNumber: index + 1,
      questionId: question.id,
      questionText: question.question.substring(0, 100) + '...',
      answer: currentSession.answers[question.id] || null,
      isAnswered: Boolean(currentSession.answers[question.id]),
    }));
  }, [currentSession]);

  const canSubmitTest = useMemo(() => {
    return answerStats.totalUnanswered === 0;
  }, [answerStats.totalUnanswered]);

  const getCompletionStatus = useCallback(() => {
    if (!currentSession) {
      return { completed: false, remaining: 0, percentage: 0 };
    }

    const total = currentSession.questions.length;
    const completed = answerStats.totalAnswered;
    const remaining = answerStats.totalUnanswered;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { completed: completed === total, remaining, percentage };
  }, [currentSession, answerStats]);

  return {
    // Current question and answer
    currentQuestion,
    currentAnswer,
    allAnswers,

    // Answer management
    handleSubmitAnswer,
    validateAnswer,
    getAnswerForQuestion,
    getAnswerForQuestionIndex,
    isQuestionAnswered,
    clearAnswerForQuestion,
    hasAnswerChanged,

    // Question collections
    getUnansweredQuestions,
    getAnsweredQuestions,
    getAnswerSummary,

    // Statistics and status
    answerStats,
    canSubmitTest,
    getCompletionStatus,

    // Loading states
    isSubmitting,
    error,
  };
}