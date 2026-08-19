'use client';

import { useState, useEffect } from 'react';
import { Card } from '../ui/Card';

export const RecordingGuide = () => {
  const [isVisible, setIsVisible] = useState(true);

  // بررسی آیا کاربر قبلاً این راهنما را بسته است
  useEffect(() => {
    const dismissed = localStorage.getItem('recordingGuideDismissed');
    if (dismissed === 'true') {
      setIsVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('recordingGuideDismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 mb-4 shadow-sm">
      <div className="flex justify-between items-start p-1">
        <div className="flex-1">
          <h4 className="text-sm font-bold text-blue-800 flex items-center gap-2">
            <span>🎙️</span> Tips for better recording
          </h4>
          <ul className="text-xs text-blue-700 mt-2 space-y-1.5 list-disc list-inside">
            <li>Hold phone <strong>20-30 cm</strong> from your mouth</li>
            <li>Speak <strong>clearly</strong> and at a <strong>steady pace</strong></li>
            <li>Minimize <strong>background noise</strong> (TV, traffic, etc.)</li>
            <li>Keep recordings under <strong>60 seconds</strong> for best accuracy</li>
            <li>Use <strong>natural language</strong> as if talking to a colleague</li>
          </ul>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600 text-sm p-1"
          aria-label="Close guide"
        >
          ✕
        </button>
      </div>
    </Card>
  );
};