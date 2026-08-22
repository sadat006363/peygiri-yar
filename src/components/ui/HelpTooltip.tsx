'use client';

import { useState } from 'react';

interface HelpTooltipProps {
  children: React.ReactNode;
}

export const HelpTooltip = ({ children }: HelpTooltipProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-400 hover:text-gray-600 text-sm font-medium transition-colors ml-1.5"
        aria-label="Help"
      >
        ❓
      </button>
      {isOpen && (
        <div className="absolute z-50 w-64 p-3 bg-white rounded-lg shadow-lg border border-gray-200 text-sm text-gray-700 -right-2 top-6 animate-fade-in">
          {children}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-1 right-2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};