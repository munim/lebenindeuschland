'use client';

import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-12">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
            <span>© 2025 Abdul Munim</span>
            <span>•</span>
            <span>Life in Germany Test Practice</span>
          </div>
            <p className="text-xs text-gray-500 dark:text-gray-500">
            This is a practice application for the German citizenship test.
            For official information, please visit the{' '}
            <a
              href="https://www.bamf.de/DE/Themen/Integration/ZugewanderteTeilnehmende/Einbuergerung/einbuergerung-node.html#a_284306_1"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-blue-600 dark:text-blue-400"
            >
              official government resources
            </a>
            .
            </p>
        </div>
      </div>
    </footer>
  );
};