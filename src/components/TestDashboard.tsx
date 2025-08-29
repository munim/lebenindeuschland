'use client';

import React from 'react';

export const TestDashboard: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          🎯 Test Center
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Take practice tests, view your history, and track your progress
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Start New Test Card */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Start New Test
          </h2>
          <div className="space-y-4">
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <p>• 33 Questions</p>
              <p>• Pass: 30/33 correct</p>
              <p>• Balanced across categories</p>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select State (Optional)
                </label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  defaultValue=""
                >
                  <option value="">All States</option>
                  <option value="BW">Baden-Württemberg</option>
                  <option value="BY">Bayern</option>
                  <option value="BE">Berlin</option>
                  <option value="BB">Brandenburg</option>
                  <option value="HB">Bremen</option>
                  <option value="HH">Hamburg</option>
                  <option value="HE">Hessen</option>
                  <option value="MV">Mecklenburg-Vorpommern</option>
                  <option value="NI">Niedersachsen</option>
                  <option value="NW">Nordrhein-Westfalen</option>
                  <option value="RP">Rheinland-Pfalz</option>
                  <option value="SL">Saarland</option>
                  <option value="SN">Sachsen</option>
                  <option value="ST">Sachsen-Anhalt</option>
                  <option value="SH">Schleswig-Holstein</option>
                  <option value="TH">Thüringen</option>
                </select>
              </div>
              <button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                disabled
              >
                Start Test (Coming Soon)
              </button>
            </div>
          </div>
        </div>

        {/* Test History Card */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Test History
          </h2>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-4">📊</div>
            <p className="text-lg font-medium mb-2">No tests taken yet</p>
            <p className="text-sm">Take your first test to see your progress here</p>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          📈 Your Progress
        </h2>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>Progress tracking will appear after taking tests</p>
        </div>
      </div>
    </div>
  );
};