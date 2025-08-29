import { useEffect, useRef, useCallback } from 'react';
import { useTestSessionContext } from '@/contexts/TestSessionContext';

export interface AutoSaveConfig {
  enabled: boolean;
  intervalMs: number;
  onAnswer: boolean;
  onNavigate: boolean;
  onVisibilityChange: boolean;
}

export interface AutoSaveStatus {
  isAutoSaving: boolean;
  lastSaveTime: Date | null;
  saveCount: number;
  hasUnsavedChanges: boolean;
  error: string | null;
}

const DEFAULT_CONFIG: AutoSaveConfig = {
  enabled: true,
  intervalMs: 30000, // 30 seconds
  onAnswer: true,
  onNavigate: true,
  onVisibilityChange: true,
};

export function useAutoSave(config: Partial<AutoSaveConfig> = {}) {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const { currentSession, currentQuestionIndex } = useTestSessionContext();
  
  const autoSaveStatusRef = useRef<AutoSaveStatus>({
    isAutoSaving: false,
    lastSaveTime: null,
    saveCount: 0,
    hasUnsavedChanges: false,
    error: null,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedDataRef = useRef<string>('');

  const saveSession = useCallback(async () => {
    if (!currentSession || !mergedConfig.enabled) return;

    try {
      autoSaveStatusRef.current.isAutoSaving = true;
      autoSaveStatusRef.current.error = null;

      // Import the service dynamically
      const { TestSessionService } = await import('@/lib/services/TestSessionService');
      const service = new TestSessionService();

      // Save current progress
      if (Object.keys(currentSession.answers).length > 0) {
        await service.navigateToQuestion(currentSession.id, currentQuestionIndex);
      }

      // Update save status
      autoSaveStatusRef.current.lastSaveTime = new Date();
      autoSaveStatusRef.current.saveCount++;
      autoSaveStatusRef.current.hasUnsavedChanges = false;

      // Update last saved data snapshot
      lastSavedDataRef.current = JSON.stringify({
        answers: currentSession.answers,
        currentQuestionIndex,
      });

    } catch (error) {
      console.error('Auto-save failed:', error);
      autoSaveStatusRef.current.error = (error as Error).message;
    } finally {
      autoSaveStatusRef.current.isAutoSaving = false;
    }
  }, [currentSession, currentQuestionIndex, mergedConfig.enabled]);

  const checkForChanges = useCallback(() => {
    if (!currentSession) return false;

    const currentData = JSON.stringify({
      answers: currentSession.answers,
      currentQuestionIndex,
    });

    const hasChanges = currentData !== lastSavedDataRef.current;
    autoSaveStatusRef.current.hasUnsavedChanges = hasChanges;
    return hasChanges;
  }, [currentSession, currentQuestionIndex]);

  // Trigger save on answer changes
  useEffect(() => {
    if (!mergedConfig.onAnswer || !currentSession) return;

    const hasChanges = checkForChanges();
    if (hasChanges) {
      const debounceTimer = setTimeout(() => {
        saveSession();
      }, 1000); // 1 second debounce

      return () => clearTimeout(debounceTimer);
    }
  }, [currentSession?.answers, currentSession, mergedConfig.onAnswer, saveSession, checkForChanges]);

  // Trigger save on navigation changes
  useEffect(() => {
    if (!mergedConfig.onNavigate || !currentSession) return;

    const hasChanges = checkForChanges();
    if (hasChanges) {
      saveSession();
    }
  }, [currentQuestionIndex, currentSession, mergedConfig.onNavigate, saveSession, checkForChanges]);

  // Periodic auto-save
  useEffect(() => {
    if (!mergedConfig.enabled || mergedConfig.intervalMs <= 0) return;

    intervalRef.current = setInterval(() => {
      const hasChanges = checkForChanges();
      if (hasChanges) {
        saveSession();
      }
    }, mergedConfig.intervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [mergedConfig.enabled, mergedConfig.intervalMs, saveSession, checkForChanges]);

  // Save on page visibility change (user switching tabs/minimizing)
  useEffect(() => {
    if (!mergedConfig.onVisibilityChange) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User is leaving/minimizing - save immediately
        const hasChanges = checkForChanges();
        if (hasChanges) {
          saveSession();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [mergedConfig.onVisibilityChange, saveSession, checkForChanges]);

  // Save before page unload
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      const hasChanges = checkForChanges();
      if (hasChanges) {
        // Attempt synchronous save (limited time)
        saveSession();
        
        // Show warning to user
        event.preventDefault();
        return 'You have unsaved test progress. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [saveSession, checkForChanges]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      // Final save attempt on cleanup
      const hasChanges = checkForChanges();
      if (hasChanges) {
        saveSession();
      }
    };
  }, [saveSession, checkForChanges]);

  const forceSave = useCallback(async () => {
    await saveSession();
  }, [saveSession]);

  const getStatus = useCallback((): AutoSaveStatus => {
    checkForChanges(); // Update unsaved changes status
    return { ...autoSaveStatusRef.current };
  }, [checkForChanges]);

  const resetSaveStatus = useCallback(() => {
    autoSaveStatusRef.current = {
      isAutoSaving: false,
      lastSaveTime: null,
      saveCount: 0,
      hasUnsavedChanges: false,
      error: null,
    };
    lastSavedDataRef.current = '';
  }, []);

  return {
    // Status
    getStatus,
    isEnabled: mergedConfig.enabled,
    config: mergedConfig,

    // Actions
    forceSave,
    resetSaveStatus,
    
    // Quick access to common status values
    get isAutoSaving() {
      return autoSaveStatusRef.current.isAutoSaving;
    },
    get hasUnsavedChanges() {
      checkForChanges();
      return autoSaveStatusRef.current.hasUnsavedChanges;
    },
    get lastSaveTime() {
      return autoSaveStatusRef.current.lastSaveTime;
    },
    get saveCount() {
      return autoSaveStatusRef.current.saveCount;
    },
    get error() {
      return autoSaveStatusRef.current.error;
    },
  };
}