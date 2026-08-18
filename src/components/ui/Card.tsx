'use client';
import { ReactNode } from 'react';

export const Card = ({ children, className = '' }: { children: ReactNode; className?: string }) => {
  return (
    <div className={`bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow p-5 border border-gray-100 ${className}`}>
      {children}
    </div>
  );
};