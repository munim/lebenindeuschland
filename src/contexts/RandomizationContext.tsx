'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { isRandomizationEnabled, setRandomizationEnabled } from '@/lib/randomization';

interface RandomizationContextType {
  isEnabled: boolean;
  isInitialized: boolean;
  toggleRandomization: (enabled: boolean) => void;
  currentSeed: number | null;
  setCurrentSeed: (seed: number | null) => void;
}

const RandomizationContext = createContext<RandomizationContextType | undefined>(undefined);

export function useRandomization() {
  const context = useContext(RandomizationContext);
  if (!context) {
    throw new Error('useRandomization must be used within a RandomizationProvider');
  }
  return context;
}

interface RandomizationProviderProps {
  children: ReactNode;
}

export function RandomizationProvider({ children }: RandomizationProviderProps) {
  const [isEnabled, setIsEnabled] = useState(false); // Always start with false for consistent hydration
  const [currentSeed, setCurrentSeed] = useState<number | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize from localStorage after hydration
  useEffect(() => {
    setIsEnabled(isRandomizationEnabled());
    setIsInitialized(true);
  }, []);

  const toggleRandomization = (enabled: boolean) => {
    setIsEnabled(enabled);
    setRandomizationEnabled(enabled);
    
    // Clear current seed when disabling randomization
    if (!enabled) {
      setCurrentSeed(null);
    }
  };

  return (
    <RandomizationContext.Provider 
      value={{
        isEnabled: isInitialized ? isEnabled : false, // Always false until initialized
        isInitialized,
        toggleRandomization,
        currentSeed,
        setCurrentSeed
      }}
    >
      {children}
    </RandomizationContext.Provider>
  );
}