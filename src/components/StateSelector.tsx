'use client';

import React from 'react';

interface StateInfo {
  code: string;
  name: string;
  count: number;
}

interface StateSelectorProps {
  selectedState: string | null;
  onStateChange: (stateCode: string | null) => void;
  disabled?: boolean;
  className?: string;
}

// Static list of German states with question counts
const GERMAN_STATES: StateInfo[] = [
  { code: 'BB', name: 'Brandenburg', count: 10 },
  { code: 'BE', name: 'Berlin', count: 10 },
  { code: 'BW', name: 'Baden-Württemberg', count: 10 },
  { code: 'BY', name: 'Bayern', count: 10 },
  { code: 'HB', name: 'Bremen', count: 10 },
  { code: 'HE', name: 'Hessen', count: 10 },
  { code: 'HH', name: 'Hamburg', count: 10 },
  { code: 'MV', name: 'Mecklenburg-Vorpommern', count: 10 },
  { code: 'NI', name: 'Niedersachsen', count: 10 },
  { code: 'NW', name: 'Nordrhein-Westfalen', count: 10 },
  { code: 'RP', name: 'Rheinland-Pfalz', count: 10 },
  { code: 'SH', name: 'Schleswig-Holstein', count: 10 },
  { code: 'SL', name: 'Saarland', count: 10 },
  { code: 'SN', name: 'Sachsen', count: 10 },
  { code: 'ST', name: 'Sachsen-Anhalt', count: 10 },
  { code: 'TH', name: 'Thüringen', count: 10 }
];

export const StateSelector: React.FC<StateSelectorProps> = ({ 
  selectedState, 
  onStateChange,
  disabled = false,
  className = ''
}) => {
  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onStateChange(value === '' ? null : value);
  };

  return (
    <div className={`${className.includes('w-full') ? 'w-full' : 'min-w-[180px]'} ${className}`}>
      <select
        value={selectedState || ''}
        onChange={handleStateChange}
        disabled={disabled}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value="">All States</option>
        {GERMAN_STATES.map(state => (
          <option key={state.code} value={state.code}>
            {state.name} ({state.count})
          </option>
        ))}
      </select>
    </div>
  );
};