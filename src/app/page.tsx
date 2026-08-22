'use client';

import { useState, useEffect } from 'react';
import { RecordButton } from '@/components/recorder/RecordButton';
import { ApprovalList } from '@/components/review/ApprovalList';
// import { ReviewQueue } from '@/components/review/ReviewQueue'; // غیرفعال برای MVP
import { HistoryList } from '@/components/history/HistoryList';
import { TodayTasks } from '@/components/dashboard/TodayTasks';
import { UnscheduledTasks } from '@/components/dashboard/UnscheduledTasks';
// import { DashboardSummary } from '@/components/dashboard/DashboardSummary'; // غیرفعال برای MVP
import { OnboardingModal } from '@/components/ui/OnboardingModal';
// import { HelpTooltip } from '@/components/ui/HelpTooltip'; // حذف شد
import { useItemStore } from '@/stores/itemStore';
import { Card } from '@/components/ui/Card';

export default function Home() {
  const { fetchItems } = useItemStore();
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    fetchItems();
    const hasSeen = localStorage.getItem('onboardingSeen');
    if (hasSeen) {
      setOnboardingComplete(true);
    }
    setIsMounted(true);
  }, []);

  const toggleSection = (sectionId: string) => {
    if (openSection === sectionId) {
      setOpenSection(null);
    } else {
      setOpenSection(sectionId);
    }
  };

  // جلوگیری از رندر سمت سرور برای کامپوننت‌های تعاملی
  if (!isMounted) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="text-center py-8">
            <h1 className="text-4xl font-extrabold tracking-tight">🎯 Peygiri Yar</h1>
            <p className="text-gray-500 mt-2 text-lg">Loading...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <OnboardingModal onComplete={() => setOnboardingComplete(true)} />

        <header className="text-center py-8">
          <div className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
            <h1 className="text-4xl font-extrabold tracking-tight">🎯 Peygiri Yar</h1>
          </div>
          <p className="text-gray-500 mt-2 text-lg">Smart voice assistant for tracking</p>
          <div className="w-24 h-1 bg-gradient-to-r from-indigo-400 to-purple-400 mx-auto mt-3 rounded-full"></div>
        </header>

        {/* ===== SECTION: Dashboard Summary (غیرفعال برای MVP) ===== */}
        {/*
        <div className="border border-gray-200 rounded-lg mb-4 overflow-hidden bg-white shadow-sm">
          <button
            onClick={() => toggleSection('summary')}
            className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-800">📊 Dashboard Summary</h2>
            </div>
            <span className="text-gray-500 text-xl">
              {openSection === 'summary' ? '▲' : '▼'}
            </span>
          </button>
          {openSection === 'summary' && (
            <div className="p-4 bg-white">
              <DashboardSummary />
            </div>
          )}
        </div>
        */}

        <Card className="mb-8 bg-white/80 backdrop-blur-sm border border-white/50 shadow-xl">
          <div className="py-4">
            <RecordButton />
          </div>
        </Card>

        {/* SECTION 1: Today's Tasks */}
        <div className="border border-gray-200 rounded-lg mb-4 overflow-hidden bg-white shadow-sm">
          <button
            onClick={() => toggleSection('today')}
            className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <h2 className="text-lg font-bold text-gray-800">📅 Today's Tasks</h2>
            <span className="text-gray-500 text-xl">
              {openSection === 'today' ? '▲' : '▼'}
            </span>
          </button>
          {openSection === 'today' && (
            <div className="p-4 bg-white">
              <TodayTasks />
            </div>
          )}
        </div>

        {/* SECTION 2: Unscheduled */}
        <div className="border border-gray-200 rounded-lg mb-4 overflow-hidden bg-white shadow-sm">
          <button
            onClick={() => toggleSection('unscheduled')}
            className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <h2 className="text-lg font-bold text-gray-800">📌 Unscheduled</h2>
            <span className="text-gray-500 text-xl">
              {openSection === 'unscheduled' ? '▲' : '▼'}
            </span>
          </button>
          {openSection === 'unscheduled' && (
            <div className="p-4 bg-white">
              <UnscheduledTasks />
            </div>
          )}
        </div>

        {/* ===== SECTION: Needs Review (غیرفعال برای MVP) ===== */}
        {/*
        <div className="border border-gray-200 rounded-lg mb-4 overflow-hidden bg-white shadow-sm">
          <button
            onClick={() => toggleSection('review')}
            className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-800">🔍 Needs Review</h2>
            </div>
            <span className="text-gray-500 text-xl">
              {openSection === 'review' ? '▲' : '▼'}
            </span>
          </button>
          {openSection === 'review' && (
            <div className="p-4 bg-white">
              <ReviewQueue />
            </div>
          )}
        </div>
        */}

        {/* SECTION 4: Pending Approval */}
        <div className="border border-gray-200 rounded-lg mb-4 overflow-hidden bg-white shadow-sm">
          <button
            onClick={() => toggleSection('pending')}
            className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <h2 className="text-lg font-bold text-gray-800">⏳ Pending Approval</h2>
            <span className="text-gray-500 text-xl">
              {openSection === 'pending' ? '▲' : '▼'}
            </span>
          </button>
          {openSection === 'pending' && (
            <div className="p-4 bg-white">
              <ApprovalList />
            </div>
          )}
        </div>

        {/* SECTION 5: History */}
        <div className="border border-gray-200 rounded-lg mb-4 overflow-hidden bg-white shadow-sm">
          <button
            onClick={() => toggleSection('history')}
            className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <h2 className="text-lg font-bold text-gray-800">📜 History</h2>
            <span className="text-gray-500 text-xl">
              {openSection === 'history' ? '▲' : '▼'}
            </span>
          </button>
          {openSection === 'history' && (
            <div className="p-4 bg-white">
              <HistoryList />
            </div>
          )}
        </div>

        <footer className="text-center text-xs text-gray-400 mt-12 border-t border-gray-200 pt-6">
          Peygiri Yar · MVP · All data is stored locally on your device
        </footer>
      </div>
    </main>
  );
}