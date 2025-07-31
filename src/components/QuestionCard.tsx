'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Question } from '@/types/question';
import { useLanguage } from '@/contexts/LanguageContext';
import { InfoToggle } from './InfoToggle';

interface AnswerOptionProps {
  text: string;
  translatedText?: string;
  isCorrect: boolean;
  index: number;
  onToggle: {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchEnd: (e: React.TouchEvent) => void;
    onClick: (e: React.MouseEvent) => void;
  };
  isToggled: boolean;
}

const AnswerOption: React.FC<AnswerOptionProps> = ({ 
  text, 
  translatedText, 
  isCorrect, 
  index, 
  onToggle, 
  isToggled 
}) => {
  const getDisplayText = () => {
    // If toggled and we have a translation, show it
    if (isToggled && translatedText) {
      return translatedText;
    }
    // Otherwise show the German text
    return text;
  };

  return (
    <button
      onClick={onToggle.onClick}
      onTouchStart={onToggle.onTouchStart}
      onTouchEnd={onToggle.onTouchEnd}
      className={`w-full text-left p-3 rounded-lg border transition-all duration-300 min-h-[60px] select-none ${
        isCorrect
          ? 'bg-green-100 dark:bg-green-900/30 border-green-500 text-green-800 dark:text-green-200'
          : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
            isCorrect
              ? 'bg-green-500 text-white'
              : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
          }`}>
            {String.fromCharCode(65 + index)}
          </span>
          <span className="transition-all duration-300 transform">
            {getDisplayText()}
          </span>
        </div>
        {isCorrect && (
          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </div>
    </button>
  );
};

interface ShuffledOption {
  key: 'a' | 'b' | 'c' | 'd';
  text: string;
  translatedText?: string;
  isCorrect: boolean;
}

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ question, questionNumber }) => {
  const { language } = useLanguage();
  const [questionToggled, setQuestionToggled] = useState(false);
  const [answerToggles, setAnswerToggles] = useState<Record<string, boolean>>({});
  const [infoToggled, setInfoToggled] = useState(false);
  const [shuffledOptions, setShuffledOptions] = useState<ShuffledOption[]>([]);
  const [imageLoaded, setImageLoaded] = useState(false);

  const translation = question.translation?.[language];

  useEffect(() => {
    const options: ShuffledOption[] = [
      { key: 'a', text: question.a, translatedText: translation?.a, isCorrect: question.solution === 'a' },
      { key: 'b', text: question.b, translatedText: translation?.b, isCorrect: question.solution === 'b' },
      { key: 'c', text: question.c, translatedText: translation?.c, isCorrect: question.solution === 'c' },
      { key: 'd', text: question.d, translatedText: translation?.d, isCorrect: question.solution === 'd' },
    ];
    
    const shuffled = [...options];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    // Reset states immediately without delay
    setQuestionToggled(false);
    setAnswerToggles({});
    setInfoToggled(false);
    setImageLoaded(false);
    setShuffledOptions(shuffled);
  }, [question, translation]);

  const getQuestionDisplayText = () => {
    console.log('Question toggle state:', questionToggled);
    console.log('Current language:', language);
    console.log('Available translation:', translation?.question);
    
    // If toggled and we have a translation, show it
    if (questionToggled && translation?.question) {
      return translation.question;
    }
    // Otherwise show the German text
    return question.question;
  };

  const handleAnswerToggle = (optionKey: string) => {
    setAnswerToggles(prev => ({
      ...prev,
      [optionKey]: !prev[optionKey]
    }));
  };

  const handleQuestionToggle = () => {
    setQuestionToggled(!questionToggled);
  };

  // Prevent double firing on mobile (both touch and click events)
  const createSafeToggleHandler = (toggleFn: () => void) => {
    let touchStarted = false;
    
    return {
      onTouchStart: (e: React.TouchEvent) => {
        touchStarted = true;
        e.preventDefault(); // Prevent text selection
      },
      onTouchEnd: (e: React.TouchEvent) => {
        if (touchStarted) {
          e.preventDefault();
          e.stopPropagation();
          toggleFn();
          touchStarted = false;
        }
      },
      onClick: () => {
        if (!touchStarted) {
          // Only handle click if it wasn't a touch event
          toggleFn();
        }
      }
    };
  };

  const handleInfoToggle = () => {
    setInfoToggled(!infoToggled);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
      <div className="mb-4">
        <button
          {...createSafeToggleHandler(handleQuestionToggle)}
          className="text-left w-full hover:text-blue-600 dark:hover:text-blue-400 transition-colors group select-none"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Question {questionNumber}
          </h3>
          <p className="text-gray-800 dark:text-gray-200 transition-all duration-300 transform group-hover:scale-[1.01]">
            {getQuestionDisplayText()}
          </p>
        </button>
      </div>

      {question.image && question.image !== '-' && (
        <div className="mb-4">
          <Image
            src={question.image}
            alt={`Question ${questionNumber} illustration`}
            className={`max-w-full h-auto rounded-lg transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            width={800}
            height={600}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageLoaded(false)}
          />
        </div>
      )}

      <div className="space-y-2 min-h-[200px]">
        {shuffledOptions.map((option, index) => (
          <AnswerOption
            key={index}
            text={option.text}
            translatedText={option.translatedText}
            isCorrect={option.isCorrect}
            index={index}
            onToggle={createSafeToggleHandler(() => handleAnswerToggle(option.key))}
            isToggled={answerToggles[option.key] || false}
          />
        ))}
      </div>

      <InfoToggle
        germanContext={question.context}
        translatedContext={translation?.context}
        onContentToggle={handleInfoToggle}
        isContentToggled={infoToggled}
      />
    </div>
  );
};