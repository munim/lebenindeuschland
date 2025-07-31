'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language } from '@/types/question';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  inlineToggle: boolean;
  setInlineToggle: (toggle: boolean) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('de');
  const [inlineToggle, setInlineToggle] = useState(false);

  useEffect(() => {
    const savedLanguage = localStorage.getItem('selected-language') as Language;
    if (savedLanguage && ['de', 'en', 'tr'].includes(savedLanguage)) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('selected-language', lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, inlineToggle, setInlineToggle }}>
      {children}
    </LanguageContext.Provider>
  );
};