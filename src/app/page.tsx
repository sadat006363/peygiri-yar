'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MicrophoneIcon,
  CalendarDaysIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ListBulletIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

import { RecordButton } from '@/components/recorder/RecordButton';
import { ApprovalList } from '@/components/review/ApprovalList';
import { HistoryList } from '@/components/history/HistoryList';
import { TodayTasks } from '@/components/dashboard/TodayTasks';
import { OnboardingModal } from '@/components/ui/OnboardingModal';
import { useItemStore } from '@/stores/itemStore';
import { Card } from '@/components/ui/Card';

export default function Home() {
  const { 
    fetchItems, 
    pendingItems, 
    activeItems, 
    completedItems, 
    rejectedItems,
    items 
  } = useItemStore();
  
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    fetchItems();
    const hasSeen = localStorage.getItem('onboardingSeen');
    if (hasSeen) setOnboardingComplete(true);
    setIsMounted(true);
  }, []);

  const toggleSection = (sectionId: string) => {
    setOpenSection(prev => prev === sectionId ? null : sectionId);
  };

  // محاسبه تعداد آیتم‌های Today
  const getTodayTasksCount = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return activeItems.filter(i => {
      if (!i.dueDate) return false;
      const due = new Date(i.dueDate);
      due.setHours(0, 0, 0, 0);
      return due.getTime() === today.getTime();
    }).length;
  };

  const todayTasksCount = getTodayTasksCount();
  
  // تعداد آیتم‌های History (همه‌ی آیتم‌ها به جز pending)
  const historyCount = items.filter(i => i.status !== 'pending').length;

  const hasPending = pendingItems.length > 0;

  const sectionVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  if (!isMounted) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-800">🎯 Peygiri Yar</h1>
          <p className="text-gray-500 mt-2">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <OnboardingModal onComplete={() => setOnboardingComplete(true)} />

        <header className="text-center py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text"
          >
            <h1 className="text-4xl font-extrabold tracking-tight">🎯 Peygiri Yar</h1>
          </motion.div>
          <p className="text-gray-500 mt-2 text-lg">Smart voice assistant for tracking</p>
          <div className="w-24 h-1 bg-gradient-to-r from-indigo-400 to-purple-400 mx-auto mt-3 rounded-full"></div>
        </header>

        <Card className="mb-8 bg-white/80 backdrop-blur-sm border border-white/50 shadow-xl">
          <div className="py-4">
            <RecordButton />
          </div>
        </Card>

        {/* SECTION 1: Today's Tasks */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200/60 mb-4 overflow-hidden">
          <button
            onClick={() => toggleSection('today')}
            className="w-full flex justify-between items-center p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2 text-gray-800">
              <CalendarDaysIcon className="w-6 h-6 text-indigo-600" />
              <h2 className="text-lg font-bold">Today's Tasks</h2>
              {todayTasksCount > 0 && (
                <span className="inline-flex items-center justify-center px-2.5 py-0.5 text-xs font-bold leading-none text-white bg-indigo-500 rounded-full">
                  {todayTasksCount}
                </span>
              )}
            </div>
            <motion.span
              animate={{ rotate: openSection === 'today' ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="text-gray-500"
            >
              <ChevronUpDownIcon className="w-5 h-5" />
            </motion.span>
          </button>
          <AnimatePresence>
            {openSection === 'today' && (
              <motion.div
                variants={sectionVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="p-4 border-t border-gray-100"
              >
                <TodayTasks />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* SECTION 2: Pending Approval (with blinking alert) */}
        <div className={`bg-white rounded-2xl shadow-md border mb-4 overflow-hidden transition-colors ${
          hasPending ? 'border-yellow-400 ring-2 ring-yellow-300/50' : 'border-gray-200/60'
        }`}>
          <button
            onClick={() => toggleSection('pending')}
            className={`w-full flex justify-between items-center p-4 transition-colors ${
              hasPending ? 'bg-yellow-50 hover:bg-yellow-100' : 'hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2 text-gray-800">
              <ClockIcon className="w-6 h-6 text-yellow-600" />
              <h2 className="text-lg font-bold">Pending Approval</h2>
              {hasPending && (
                <>
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="relative flex h-3 w-3"
                  >
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </motion.span>
                  <span className="inline-flex items-center justify-center px-2.5 py-0.5 text-xs font-bold leading-none text-white bg-red-500 rounded-full animate-pulse">
                    {pendingItems.length}
                  </span>
                </>
              )}
            </div>
            <motion.span
              animate={{ rotate: openSection === 'pending' ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="text-gray-500"
            >
              <ChevronUpDownIcon className="w-5 h-5" />
            </motion.span>
          </button>
          <AnimatePresence>
            {openSection === 'pending' && (
              <motion.div
                variants={sectionVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="p-4 border-t border-gray-100"
              >
                <ApprovalList />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* SECTION 3: History */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200/60 mb-4 overflow-hidden">
          <button
            onClick={() => toggleSection('history')}
            className="w-full flex justify-between items-center p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2 text-gray-800">
              <ListBulletIcon className="w-6 h-6 text-purple-600" />
              <h2 className="text-lg font-bold">History</h2>
              {historyCount > 0 && (
                <span className="inline-flex items-center justify-center px-2.5 py-0.5 text-xs font-bold leading-none text-white bg-purple-500 rounded-full">
                  {historyCount}
                </span>
              )}
            </div>
            <motion.span
              animate={{ rotate: openSection === 'history' ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="text-gray-500"
            >
              <ChevronUpDownIcon className="w-5 h-5" />
            </motion.span>
          </button>
          <AnimatePresence>
            {openSection === 'history' && (
              <motion.div
                variants={sectionVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="p-4 border-t border-gray-100"
              >
                <HistoryList />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <footer className="text-center text-xs text-gray-400 mt-12 border-t border-gray-200 pt-6">
          Peygiri Yar · MVP · All data is stored locally on your device
        </footer>
      </div>
    </main>
  );
}

// کامپوننت آیکون چپ‌راست
function ChevronUpDownIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
    </svg>
  );
}