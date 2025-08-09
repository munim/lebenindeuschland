'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface TestModeContextType {
  isTestMode: boolean;
  setTestMode: (enabled: boolean) => void;
}

const TestModeContext = createContext<TestModeContextType | undefined>(undefined);

export const useTestMode = () => {
  const context = useContext(TestModeContext);
  if (context === undefined) {
    throw new Error('useTestMode must be used within a TestModeProvider');
  }
  return context;
};

interface TestModeProviderProps {
  children: ReactNode;
}

export const TestModeProvider: React.FC<TestModeProviderProps> = ({ children }) => {
  const [isTestMode, setIsTestMode] = useState(false);

  const setTestMode = (enabled: boolean) => {
    setIsTestMode(enabled);
  };

  return (
    <TestModeContext.Provider value={{ isTestMode, setTestMode }}>
      {children}
    </TestModeContext.Provider>
  );
};
