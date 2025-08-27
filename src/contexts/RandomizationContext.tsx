'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { isRandomizationEnabled, setRandomizationEnabled } from '@/lib/randomization';

interface RandomizationContextType {
  isEnabled: boolean;
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
  const [isEnabled, setIsEnabled] = useState(() => {
    // Initialize from localStorage immediately if available
    if (typeof window !== 'undefined') {
      return isRandomizationEnabled();
    }
    return false;
  });
  const [currentSeed, setCurrentSeed] = useState<number | null>(null);

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
        isEnabled,
        toggleRandomization,
        currentSeed,
        setCurrentSeed
      }}
    >
      {children}
    </RandomizationContext.Provider>
  );
}