'use client';

import { useState, useEffect } from 'react';
import { Button } from './Button';
import { Modal } from './Modal';

interface OnboardingModalProps {
  onComplete: () => void;
}

export const OnboardingModal = ({ onComplete }: OnboardingModalProps) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // بررسی اینکه آیا کاربر قبلاً این مودال را دیده است
    const hasSeen = localStorage.getItem('onboardingSeen');
    if (!hasSeen) {
      setIsOpen(true);
    }
  }, []);

  const handleStart = () => {
    localStorage.setItem('onboardingSeen', 'true');
    setIsOpen(false);
    onComplete();
  };

  return (
    <Modal isOpen={isOpen} onClose={() => {}}>
      <div className="text-center">
        <div className="text-6xl mb-4">🎯</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to Peygiri Yar!</h2>
        <p className="text-gray-600 mb-4">
          Your smart voice assistant for tracking tasks, customers, expenses, and ideas.
        </p>
        <div className="text-left bg-gray-50 rounded-lg p-4 mb-6 space-y-2 text-sm text-gray-700">
          <p>🎙️ <strong>Record</strong> – Tap the mic and speak naturally</p>
          <p>🧠 <strong>Smart Processing</strong> – AI categorizes, prioritizes, and extracts key details</p>
          <p>✅ <strong>Review & Confirm</strong> – Approve, edit, or reject items</p>
          <p>📊 <strong>Stay on Track</strong> – Today's tasks, follow-ups, and smart reminders</p>
        </div>
        <Button variant="primary" onClick={handleStart} className="w-full">
          🚀 Get Started
        </Button>
      </div>
    </Modal>
  );
};