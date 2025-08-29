'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { Question } from '@/types/question';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTestAnswers } from '@/hooks/useTestAnswers';
import { InfoToggle } from './InfoToggle';

interface AnswerOptionProps {
  text: string;
  translatedText?: string;
  optionKey: string;
  index: number;
  isSelected: boolean;
  onSelect: (optionKey: string) => void;
  disabled?: boolean;
  showTranslation?: boolean;
}

const AnswerOption: React.FC<AnswerOptionProps> = ({ 
  text, 
  translatedText, 
  optionKey,
  index, 
  isSelected,
  onSelect,
  disabled = false,
  showTranslation = false
}) => {
  const displayText = showTranslation && translatedText ? translatedText : text;

  const getButtonStyles = () => {
    if (disabled) {
      return 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed';
    }
    
    if (isSelected) {
      return 'bg-blue-100 dark:bg-blue-900/30 border-blue-500 text-blue-800 dark:text-blue-200';
    }
    
    return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100';
  };

  const getIndicatorStyles = () => {
    if (disabled) {
      return 'bg-gray-400 dark:bg-gray-600 text-gray-600 dark:text-gray-400';
    }
    
    if (isSelected) {
      return 'bg-blue-500 text-white';
    }
    
    return 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300';
  };

  const handleClick = () => {
    if (!disabled) {
      onSelect(optionKey);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`w-full text-left p-3 rounded-lg border transition-all duration-300 min-h-[60px] select-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${getButtonStyles()}`}
      tabIndex={disabled ? -1 : 0}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${getIndicatorStyles()}`}>
            {index + 1}
          </span>
          <span className="transition-all duration-300">
            {displayText}
          </span>
        </div>
        {isSelected && (
          <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )}
      </div>
    </button>
  );
};

interface TestQuestionCardProps {
  question: Question;
  questionNumber: number;
  onAnswerSelect?: (answer: string) => void;
  showTranslations?: boolean;
  disabled?: boolean;
}

export const TestQuestionCard: React.FC<TestQuestionCardProps> = ({ 
  question, 
  questionNumber,
  onAnswerSelect,
  showTranslations = false,
  disabled = false
}) => {
  const { language } = useLanguage();
  const { currentAnswer, handleSubmitAnswer, isSubmitting } = useTestAnswers();
  
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [infoToggled, setInfoToggled] = useState(false);
  
  const translation = question.translation?.[language];

  // Extract state information from question number
  const getStateInfo = () => {
    if (!question.num || typeof question.num !== 'string') return null;
    
    const stateMapping: Record<string, { name: string; color: string }> = {
      'BW': { name: 'Baden-Württemberg', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700' },
      'BY': { name: 'Bayern', color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 border-indigo-200 dark:border-indigo-700' },
      'BE': { name: 'Berlin', color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700' },
      'BB': { name: 'Brandenburg', color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700' },
      'HB': { name: 'Bremen', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-700' },
      'HH': { name: 'Hamburg', color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-200 border-pink-200 dark:border-pink-700' },
      'HE': { name: 'Hessen', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700' },
      'MV': { name: 'Mecklenburg-Vorpommern', color: 'bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-200 border-teal-200 dark:border-teal-700' },
      'NI': { name: 'Niedersachsen', color: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-200 border-cyan-200 dark:border-cyan-700' },
      'NW': { name: 'Nordrhein-Westfalen', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-700' },
      'RP': { name: 'Rheinland-Pfalz', color: 'bg-lime-100 dark:bg-lime-900/30 text-lime-800 dark:text-lime-200 border-lime-200 dark:border-lime-700' },
      'SL': { name: 'Saarland', color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-700' },
      'SN': { name: 'Sachsen', color: 'bg-violet-100 dark:bg-violet-900/30 text-violet-800 dark:text-violet-200 border-violet-200 dark:border-violet-700' },
      'ST': { name: 'Sachsen-Anhalt', color: 'bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-700' },
      'SH': { name: 'Schleswig-Holstein', color: 'bg-sky-100 dark:bg-sky-900/30 text-sky-800 dark:text-sky-200 border-sky-200 dark:border-sky-700' },
      'TH': { name: 'Thüringen', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-700' },
    };

    const stateCode = question.num.split('-')[0];
    return stateMapping[stateCode] || null;
  };

  // Get category information with icon and styling
  const getCategoryInfo = () => {
    if (!question.category) return null;
    
    const normalizeCategory = (category: string) => {
      return category.replace(/^'|'$/g, '');
    };
    
    const normalizedCategory = normalizeCategory(question.category);
    
    const categoryMapping: Record<string, { name: string; icon: string; color: string }> = {
      'History & Geography': { 
        name: 'History & Geography', 
        icon: '🏛️', 
        color: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600' 
      },
      'Democracy & Politics': { 
        name: 'Democracy & Politics', 
        icon: '🗳️', 
        color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700' 
      },
      'Rights & Freedoms': { 
        name: 'Rights & Freedoms', 
        icon: '⚖️', 
        color: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700' 
      },
      'Law & Governance': { 
        name: 'Law & Governance', 
        icon: '🏛️', 
        color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700' 
      },
      'Elections': { 
        name: 'Elections', 
        icon: '🗳️', 
        color: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700' 
      },
      'Education & Religion': { 
        name: 'Education & Religion', 
        icon: '🎓', 
        color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700' 
      },
      'Economy & Employment': { 
        name: 'Economy & Employment', 
        icon: '💼', 
        color: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700' 
      },
      'Federal System': { 
        name: 'Federal System', 
        icon: '🏢', 
        color: 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-700' 
      },
      'Constitution': { 
        name: 'Constitution', 
        icon: '📜', 
        color: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700' 
      },
      'Assembly & Protests': { 
        name: 'Assembly & Protests', 
        icon: '✊', 
        color: 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700' 
      },
    };

    return categoryMapping[normalizedCategory] || {
      name: normalizedCategory,
      icon: '📚',
      color: 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600'
    };
  };

  const stateInfo = getStateInfo();
  const categoryInfo = getCategoryInfo();

  // Create shuffled options (updates when question changes)
  const shuffledOptions = useMemo(() => {
    const options = [
      { key: 'a', text: question.a },
      { key: 'b', text: question.b },
      { key: 'c', text: question.c },
      { key: 'd', text: question.d },
    ];

    // Use question.num as seed for consistent shuffle
    const seed = parseInt(question.num) || 1;
    let random = seed;
    
    const seededRandom = () => {
      random = (random * 1103515245 + 12345) & 0x7fffffff;
      return random / 0x7fffffff;
    };

    // Fisher-Yates shuffle with seeded random
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(seededRandom() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    return options;
  }, [question.num, question.a, question.b, question.c, question.d]);

  const optionsWithTranslations = useMemo(() => {
    return shuffledOptions.map(option => {
      const selectedLangTranslation = question.translation?.[language]?.[option.key as keyof typeof question.translation[typeof language]];
      const fallbackTranslation = question.translation?.en?.[option.key as keyof typeof question.translation.en];
      
      return {
        ...option,
        translatedText: selectedLangTranslation || fallbackTranslation
      };
    });
  }, [shuffledOptions, language, question]);

  useEffect(() => {
    setImageError(false);
    setInfoToggled(false);
  }, [question]);

  const handleAnswerSelect = useCallback(async (optionKey: string) => {
    if (disabled || isSubmitting) return;

    try {
      await handleSubmitAnswer(optionKey);
      onAnswerSelect?.(optionKey);
    } catch (error) {
      console.error('Failed to submit answer:', error);
    }
  }, [disabled, isSubmitting, handleSubmitAnswer, onAnswerSelect]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (disabled || isSubmitting) return;
      
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const keyNumber = parseInt(e.key);
      if (keyNumber >= 1 && keyNumber <= 4) {
        e.preventDefault();
        const optionIndex = keyNumber - 1;
        if (optionIndex < optionsWithTranslations.length) {
          const selectedOption = optionsWithTranslations[optionIndex];
          handleAnswerSelect(selectedOption.key);
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [optionsWithTranslations, handleAnswerSelect, disabled, isSubmitting]);

  // Handle image loading state
  useEffect(() => {
    if (question.image && question.image !== '-') {
      setImageLoaded(false);
      setImageError(false);
    }
  }, [question.image]);

  const getQuestionDisplayText = () => {
    if (showTranslations && translation?.question) {
      return translation.question;
    }
    return question.question;
  };

  const handleInfoToggle = () => {
    setInfoToggled(!infoToggled);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Question {questionNumber}
            </h3>
            {categoryInfo && (
              <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium border ${categoryInfo.color}`}>
                <span className="mr-1">{categoryInfo.icon}</span>
                {categoryInfo.name}
              </span>
            )}
            {stateInfo && (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${stateInfo.color}`}>
                {stateInfo.name}
              </span>
            )}
          </div>
        </div>
        
        <p className="text-gray-800 dark:text-gray-200">
          {getQuestionDisplayText()}
        </p>
      </div>

      {question.image && question.image !== '-' && (
        <div className="mb-4">
          {!imageError ? (
            <Image
              src={question.image}
              alt={`Question ${questionNumber} illustration`}
              className={`max-w-full h-auto rounded-lg transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              width={800}
              height={600}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              unoptimized
              priority
            />
          ) : (
            <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <span className="text-gray-500 dark:text-gray-400 text-sm">
                Image failed to load
              </span>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col gap-2 min-h-[200px]">
        {optionsWithTranslations.map((option, index) => (
          <AnswerOption
            key={option.key}
            text={option.text}
            translatedText={option.translatedText}
            optionKey={option.key}
            index={index}
            isSelected={currentAnswer === option.key}
            onSelect={handleAnswerSelect}
            disabled={disabled || isSubmitting}
            showTranslation={showTranslations}
          />
        ))}
      </div>

      <InfoToggle
        germanContext={question.context}
        translatedContext={question.translation?.[language]?.context || question.translation?.en?.context}
        onContentToggle={handleInfoToggle}
        isContentToggled={infoToggled}
        isTestMode={true}
        testModeContentToggled={showTranslations}
        showFeedback={false}
      />
    </div>
  );
};