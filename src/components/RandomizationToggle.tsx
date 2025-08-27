'use client';

import { useRandomization } from '@/contexts/RandomizationContext';

export function RandomizationToggle() {
  const { isEnabled, toggleRandomization } = useRandomization();

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-700 dark:text-gray-300">Randomize</span>
      <button
        onClick={() => toggleRandomization(!isEnabled)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
          isEnabled ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-700'
        }`}
        role="switch"
        aria-checked={isEnabled}
        aria-label="Toggle question randomization"
        title={isEnabled ? 'Disable question randomization' : 'Enable question randomization'}
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            isEnabled ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}