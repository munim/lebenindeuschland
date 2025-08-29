'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { AppMode } from '@/types/question';

interface AppModeContextType {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  isStudyMode: boolean;
  isTestMode: boolean;
}

const AppModeContext = createContext<AppModeContextType | undefined>(undefined);

export const useAppMode = () => {
  const context = useContext(AppModeContext);
  if (context === undefined) {
    throw new Error('useAppMode must be used within an AppModeProvider');
  }
  return context;
};

interface AppModeProviderProps {
  children: ReactNode;
}

const STORAGE_KEY = 'lebenindeutschland_app_mode';

export const AppModeProvider: React.FC<AppModeProviderProps> = ({ children }) => {
  const [mode, setModeState] = useState<AppMode>('study');

  // Load saved mode preference on mount
  useEffect(() => {
    const savedMode = localStorage.getItem(STORAGE_KEY);
    if (savedMode === 'study' || savedMode === 'test') {
      setModeState(savedMode);
    }
  }, []);

  const setMode = (newMode: AppMode) => {
    setModeState(newMode);
    localStorage.setItem(STORAGE_KEY, newMode);
  };

  const isStudyMode = mode === 'study';
  const isTestMode = mode === 'test';

  return (
    <AppModeContext.Provider value={{ mode, setMode, isStudyMode, isTestMode }}>
      {children}
    </AppModeContext.Provider>
  );
};