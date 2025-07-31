'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface StateInfo {
  code: string;
  name: string;
  count: number;
}

interface StateSelectorProps {
  selectedState: string | null;
  onStateChange: (stateCode: string | null) => void;
  disabled?: boolean;
}

// German state mapping
const GERMAN_STATES: Record<string, string> = {
  'NW': 'Nordrhein-Westfalen',
  'BY': 'Bayern',
  'BW': 'Baden-Württemberg', 
  'NI': 'Niedersachsen',
  'HE': 'Hessen',
  'RP': 'Rheinland-Pfalz',
  'SN': 'Sachsen',
  'ST': 'Sachsen-Anhalt',
  'TH': 'Thüringen',
  'BB': 'Brandenburg',
  'MV': 'Mecklenburg-Vorpommern',
  'SL': 'Saarland',
  'HH': 'Hamburg',
  'HB': 'Bremen',
  'BE': 'Berlin',
  'SH': 'Schleswig-Holstein'
};

export const StateSelector: React.FC<StateSelectorProps> = ({ 
  selectedState, 
  onStateChange,
  disabled = false
}) => {
  const { language } = useLanguage();
  const [states, setStates] = useState<StateInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStateQuestions = async () => {
      if (typeof window === 'undefined') return;
      
      try {
        setLoading(true);
        
        // For now, we'll manually count state questions from the main question set
        // In a real implementation, you'd have a dedicated states.json file
        const stateQuestions: StateInfo[] = [];
        
        // Check NW questions (we know there are 10)
        try {
          const response = await fetch(`/data/${language}/questions/page-1.json`);
          if (response.ok) {
            const data = await response.json();
            const nwQuestions = data.questions.filter((q: { num: string }) => q.num.startsWith('NW-'));
            if (nwQuestions.length > 0) {
              stateQuestions.push({
                code: 'NW',
                name: GERMAN_STATES['NW'],
                count: 10 // We know there are 10 NW questions
              });
            }
          }
        } catch {
          console.warn('Could not fetch questions to count states');
        }
        
        setStates(stateQuestions);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load states');
      } finally {
        setLoading(false);
      }
    };

    fetchStateQuestions();
  }, [language]);

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onStateChange(value === '' ? null : value);
  };

  if (loading) {
    return (
      <div className="min-w-[180px]">
        <select disabled className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
          <option>Loading...</option>
        </select>
      </div>
    );
  }

  if (error || states.length === 0) {
    return (
      <div className="min-w-[180px]">
        <select disabled className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
          <option>No States</option>
        </select>
      </div>
    );
  }

  return (
    <div className="min-w-[180px]">
      <select
        value={selectedState || ''}
        onChange={handleStateChange}
        disabled={disabled}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value="">All States</option>
        {states.map(state => (
          <option key={state.code} value={state.code}>
            {state.name} ({state.count})
          </option>
        ))}
      </select>
    </div>
  );
};