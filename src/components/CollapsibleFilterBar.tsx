'use client';

import React, { useState } from 'react';
import { useTestMode } from '@/contexts/TestModeContext';
import { CategorySelector } from './CategorySelector';
import { StateSelector } from './StateSelector';

interface CollapsibleFilterBarProps {
  selectedCategory: string | null;
  selectedState: string | null;
  onCategoryChange: (categoryId: string | null) => void;
  onStateChange: (stateCode: string | null) => void;
  onResetFilters: () => void;
  disabled?: boolean;
}

export const CollapsibleFilterBar: React.FC<CollapsibleFilterBarProps> = ({
  selectedCategory,
  selectedState,
  onCategoryChange,
  onStateChange,
  onResetFilters,
  disabled = false,
}) => {
  const { isTestMode } = useTestMode();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const hasActiveFilters = selectedCategory || selectedState;
  const filterCount = (selectedCategory ? 1 : 0) + (selectedState ? 1 : 0);
  
  const getFilterDisplayText = () => {
    if (selectedCategory && selectedState) {
      return 'Category and state filtered';
    } else if (selectedCategory) {
      return 'Category filtered';
    } else if (selectedState) {
      return 'State filtered';
    }
    return '';
  };

  // Disable filters when in test mode
  const isFilterDisabled = disabled || isTestMode;

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden transition-all duration-200">
      {/* Collapsible Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        disabled={isFilterDisabled}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-expanded={isExpanded}
        aria-controls="filter-content"
      >
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            {/* Filter Icon */}
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.708V4z" />
            </svg>
            
            <span className="font-medium text-gray-900 dark:text-gray-100">
              Filters
            </span>
            
            {/* Active Filter Count Badge */}
            {hasActiveFilters && (
              <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-blue-600 rounded-full">
                {filterCount}
              </span>
            )}
          </div>
          
          {/* Filter Status Text (Desktop) */}
          {hasActiveFilters && (
            <span className="hidden sm:inline text-sm text-gray-500 dark:text-gray-400">
              {getFilterDisplayText()}
            </span>
          )}
        </div>
        
        {/* Expand/Collapse Icon */}
        <svg 
          className={`w-5 h-5 text-gray-400 transform transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {/* Expandable Content */}
      <div 
        id="filter-content"
        className={`transition-all duration-200 ease-in-out overflow-hidden ${
          isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 py-4 space-y-4">
          {/* Mobile: Stack vertically with full width */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
              <div className="w-full sm:w-auto">
                <CategorySelector
                  selectedCategory={selectedCategory}
                  onCategoryChange={onCategoryChange}
                  disabled={isFilterDisabled}
                  className="w-full sm:w-auto"
                />
              </div>
              <div className="w-full sm:w-auto">
                <StateSelector
                  selectedState={selectedState}
                  onStateChange={onStateChange}
                  disabled={isFilterDisabled}
                  className="w-full sm:w-auto"
                />
              </div>
            </div>
            
            {/* Reset Button */}
            {hasActiveFilters && (
              <button
                onClick={onResetFilters}
                disabled={isFilterDisabled}
                className="w-full sm:w-auto px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              >
                Reset Filters
              </button>
            )}
          </div>
          
          {/* Mobile Filter Status */}
          {hasActiveFilters && (
            <div className="sm:hidden">
              <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                {getFilterDisplayText()}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};