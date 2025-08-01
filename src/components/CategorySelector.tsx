'use client';

import React, { useState, useEffect } from 'react';
import { CategoryInfo } from '@/types/question';
import { useLanguage } from '@/contexts/LanguageContext';

interface CategorySelectorProps {
  selectedCategory: string | null;
  onCategoryChange: (categoryId: string | null) => void;
  disabled?: boolean;
  className?: string;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({ 
  selectedCategory, 
  onCategoryChange,
  disabled = false,
  className = ''
}) => {
  const { language } = useLanguage();
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      if (typeof window === 'undefined') return;
      
      try {
        setLoading(true);
        const response = await fetch(`/data/${language}/categories.json`);
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data = await response.json();
        
        // Remove duplicates and clean up category names
        const uniqueCategories = data.categories.reduce((acc: CategoryInfo[], category: CategoryInfo) => {
          const existing = acc.find(c => c.id === category.id);
          if (!existing) {
            acc.push({
              ...category,
              name: category.name.replace(/^'|'$/g, '') // Remove surrounding quotes
            });
          } else {
            // Sum counts for duplicates
            existing.count += category.count;
          }
          return acc;
        }, []);
        
        // Sort by name
        uniqueCategories.sort((a: CategoryInfo, b: CategoryInfo) => a.name.localeCompare(b.name));
        
        setCategories(uniqueCategories);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [language]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onCategoryChange(value === '' ? null : value);
  };

  if (loading) {
    return (
      <div className={`${className.includes('w-full') ? 'w-full' : 'min-w-[200px]'} ${className}`}>
        <select disabled className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
          <option>Loading...</option>
        </select>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className.includes('w-full') ? 'w-full' : 'min-w-[200px]'} ${className}`}>
        <select disabled className="w-full px-3 py-2 border border-red-300 rounded-lg bg-red-50 text-red-500">
          <option>Error loading</option>
        </select>
      </div>
    );
  }

  return (
    <div className={`${className.includes('w-full') ? 'w-full' : 'min-w-[200px]'} ${className}`}>
      <select
        value={selectedCategory || ''}
        onChange={handleCategoryChange}
        disabled={disabled}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value="">All Categories</option>
        {categories.map(category => (
          <option key={category.id} value={category.id}>
            {category.name} ({category.count})
          </option>
        ))}
      </select>
    </div>
  );
};