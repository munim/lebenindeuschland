import { useTestSessionContext } from '@/contexts/TestSessionContext';
import { TestConfig } from '@/types/question';

export function useTestSession() {
  const context = useTestSessionContext();
  
  const {
    currentSession,
    isLoading,
    error,
    currentQuestionIndex,
    isSubmitting,
    startTest,
    submitAnswer,
    navigateToQuestion,
    pauseTest,
    resumeTest,
    completeTest,
    resetSession,
    loadUnfinishedSession,
  } = context;

  const hasActiveSession = currentSession !== null;
  const isTestActive = currentSession?.status === 'active';
  const isTestPaused = currentSession?.status === 'paused';
  const currentQuestion = currentSession?.questions[currentQuestionIndex] || null;
  const totalQuestions = currentSession?.questions.length || 0;
  const hasAnswered = currentQuestion ? 
    Boolean(currentSession?.answers[currentQuestion.id]) : false;

  const canNavigateNext = currentQuestionIndex < totalQuestions - 1;
  const canNavigatePrevious = currentQuestionIndex > 0;

  const getProgress = () => {
    if (!currentSession) {
      return { answered: 0, total: 0, percentage: 0 };
    }

    const answered = Object.keys(currentSession.answers).length;
    const total = currentSession.questions.length;
    const percentage = total > 0 ? Math.round((answered / total) * 100) : 0;

    return { answered, total, percentage };
  };

  const getCurrentAnswer = () => {
    if (!currentQuestion || !currentSession) return null;
    return currentSession.answers[currentQuestion.id] || null;
  };

  const handleSubmitAnswer = async (answer: string) => {
    if (!currentQuestion) return;
    await submitAnswer(currentQuestion.id, answer);
  };

  const handleNext = () => {
    if (canNavigateNext) {
      navigateToQuestion(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (canNavigatePrevious) {
      navigateToQuestion(currentQuestionIndex - 1);
    }
  };

  const handleGoToQuestion = (index: number) => {
    if (index >= 0 && index < totalQuestions) {
      navigateToQuestion(index);
    }
  };

  const getUnansweredQuestions = () => {
    if (!currentSession) return [];
    
    return currentSession.questions.filter(
      question => !currentSession.answers[question.id]
    );
  };

  const isReadyForSubmission = () => {
    return getUnansweredQuestions().length === 0;
  };

  const getSessionDuration = () => {
    if (!currentSession?.startTime) return 0;
    
    const now = new Date().getTime();
    const start = new Date(currentSession.startTime).getTime();
    return Math.floor((now - start) / 1000); // seconds
  };

  const startTestWithConfig = async (stateCode?: string) => {
    const config: TestConfig = {
      stateCode,
      totalQuestions: 33,
      language: 'de', // TODO: get from language context
    };
    
    await startTest(config);
  };

  return {
    // State
    currentSession,
    isLoading,
    error,
    currentQuestionIndex,
    isSubmitting,
    hasActiveSession,
    isTestActive,
    isTestPaused,
    currentQuestion,
    totalQuestions,
    hasAnswered,
    canNavigateNext,
    canNavigatePrevious,

    // Actions
    startTest,
    startTestWithConfig,
    submitAnswer: handleSubmitAnswer,
    navigateToQuestion,
    pauseTest,
    resumeTest,
    completeTest,
    resetSession,
    loadUnfinishedSession,

    // Navigation helpers
    handleNext,
    handlePrevious,
    handleGoToQuestion,

    // Progress and stats
    getProgress,
    getCurrentAnswer,
    getUnansweredQuestions,
    isReadyForSubmission,
    getSessionDuration,
  };
}