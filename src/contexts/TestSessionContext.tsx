'use client';

import { createContext, useContext, ReactNode, useReducer, useEffect, useCallback } from 'react';
import { TestSession, TestResult, TestConfig } from '@/types/question';

interface TestSessionState {
  currentSession: TestSession | null;
  isLoading: boolean;
  error: string | null;
  currentQuestionIndex: number;
  isSubmitting: boolean;
}

interface TestSessionActions {
  startTest: (config: TestConfig) => Promise<void>;
  submitAnswer: (questionId: string, answer: string) => Promise<void>;
  navigateToQuestion: (index: number) => void;
  pauseTest: () => Promise<void>;
  resumeTest: (sessionId: string) => Promise<void>;
  completeTest: () => Promise<TestResult | null>;
  resetSession: () => void;
  loadUnfinishedSession: () => Promise<TestSession | null>;
}

interface TestSessionContextType extends TestSessionState, TestSessionActions {}

interface TestSessionAction {
  type: 
    | 'SET_LOADING' 
    | 'SET_ERROR' 
    | 'START_SESSION' 
    | 'UPDATE_SESSION'
    | 'SET_CURRENT_QUESTION'
    | 'SET_SUBMITTING'
    | 'RESET_SESSION';
  payload?: boolean | string | number | TestSession | null;
}

const initialState: TestSessionState = {
  currentSession: null,
  isLoading: false,
  error: null,
  currentQuestionIndex: 0,
  isSubmitting: false,
};

function testSessionReducer(state: TestSessionState, action: TestSessionAction): TestSessionState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: Boolean(action.payload), error: null };
    
    case 'SET_ERROR':
      return { ...state, error: typeof action.payload === 'string' ? action.payload : null, isLoading: false };
    
    case 'START_SESSION':
      const sessionPayload = action.payload as TestSession;
      return {
        ...state,
        currentSession: sessionPayload,
        currentQuestionIndex: sessionPayload?.currentQuestionIndex || 0,
        isLoading: false,
        error: null,
      };
    
    case 'UPDATE_SESSION':
      const updatedSessionPayload = action.payload as TestSession;
      return {
        ...state,
        currentSession: updatedSessionPayload,
        currentQuestionIndex: updatedSessionPayload?.currentQuestionIndex || state.currentQuestionIndex,
      };
    
    case 'SET_CURRENT_QUESTION':
      const questionIndex = typeof action.payload === 'number' ? action.payload : 0;
      return {
        ...state,
        currentQuestionIndex: questionIndex,
        currentSession: state.currentSession ? {
          ...state.currentSession,
          currentQuestionIndex: questionIndex,
        } : null,
      };
    
    case 'SET_SUBMITTING':
      return { ...state, isSubmitting: Boolean(action.payload) };
    
    case 'RESET_SESSION':
      return initialState;
    
    default:
      return state;
  }
}

const TestSessionContext = createContext<TestSessionContextType | null>(null);

interface TestSessionProviderProps {
  children: ReactNode;
}

export function TestSessionProvider({ children }: TestSessionProviderProps) {
  const [state, dispatch] = useReducer(testSessionReducer, initialState);

  const loadUnfinishedSession = useCallback(async (): Promise<TestSession | null> => {
    try {
      const { TestSessionService } = await import('@/lib/services/TestSessionService');
      const service = new TestSessionService();
      const session = await service.findActiveSession();
      
      if (session) {
        dispatch({ type: 'START_SESSION', payload: session });
        return session;
      }
      return null;
    } catch (error) {
      console.error('Failed to load unfinished session:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    loadUnfinishedSession();
  }, [loadUnfinishedSession]);

  const startTest = useCallback(async (config: TestConfig) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const { TestSessionService } = await import('@/lib/services/TestSessionService');
      const service = new TestSessionService();
      const session = await service.createSession(config);
      
      dispatch({ type: 'START_SESSION', payload: session });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    }
  }, []);

  const submitAnswer = useCallback(async (questionId: string, answer: string) => {
    if (!state.currentSession) return;

    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      
      const { TestSessionService } = await import('@/lib/services/TestSessionService');
      const service = new TestSessionService();
      await service.submitAnswer(state.currentSession.id, questionId, answer);
      
      // Update local state instead of fetching from service
      dispatch({ 
        type: 'UPDATE_SESSION', 
        payload: {
          ...state.currentSession,
          answers: {
            ...state.currentSession.answers,
            [questionId]: answer
          }
        }
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [state.currentSession]);

  const navigateToQuestion = useCallback((index: number) => {
    if (!state.currentSession || index < 0 || index >= state.currentSession.questions.length) {
      return;
    }
    
    // Update local state immediately for better UX
    dispatch({ type: 'SET_CURRENT_QUESTION', payload: index });
    
    // Save to backend asynchronously without waiting
    const saveNavigation = async () => {
      try {
        const { TestSessionService } = await import('@/lib/services/TestSessionService');
        const service = new TestSessionService();
        await service.navigateToQuestion(state.currentSession!.id, index);
      } catch (error) {
        console.error('Failed to save navigation:', error);
      }
    };
    
    saveNavigation();
  }, [state.currentSession]);

  const pauseTest = useCallback(async () => {
    if (!state.currentSession) return;

    try {
      const { TestSessionService } = await import('@/lib/services/TestSessionService');
      const service = new TestSessionService();
      await service.pauseSession(state.currentSession.id);
      
      const updatedSession = await service.findActiveSession();
      if (updatedSession) {
        dispatch({ type: 'UPDATE_SESSION', payload: updatedSession });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    }
  }, [state.currentSession]);

  const resumeTest = useCallback(async (sessionId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const { TestSessionService } = await import('@/lib/services/TestSessionService');
      const service = new TestSessionService();
      const session = await service.resumeSession(sessionId);
      
      dispatch({ type: 'START_SESSION', payload: session });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    }
  }, []);

  const completeTest = useCallback(async (): Promise<TestResult | null> => {
    if (!state.currentSession) return null;

    // Prevent double completion
    if (state.currentSession.status !== 'active') {
      console.log('Test completion already in progress or completed');
      return null;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const { TestSessionService } = await import('@/lib/services/TestSessionService');
      const service = new TestSessionService();
      const result = await service.completeSession(state.currentSession.id);
      
      // Don't reset session immediately - keep it for results display
      dispatch({ 
        type: 'UPDATE_SESSION', 
        payload: {
          ...state.currentSession,
          status: 'completed',
          endTime: new Date()
        }
      });
      
      return result;
    } catch (error) {
      console.error('Failed to complete test:', error);
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      return null;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.currentSession]);

  const resetSession = useCallback(() => {
    dispatch({ type: 'RESET_SESSION' });
  }, []);

  const contextValue: TestSessionContextType = {
    ...state,
    startTest,
    submitAnswer,
    navigateToQuestion,
    pauseTest,
    resumeTest,
    completeTest,
    resetSession,
    loadUnfinishedSession,
  };

  return (
    <TestSessionContext.Provider value={contextValue}>
      {children}
    </TestSessionContext.Provider>
  );
}

export function useTestSessionContext(): TestSessionContextType {
  const context = useContext(TestSessionContext);
  if (!context) {
    throw new Error('useTestSessionContext must be used within a TestSessionProvider');
  }
  return context;
}