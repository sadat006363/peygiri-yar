'use client';

import { useEffect } from 'react';
import { RecordButton } from '@/components/recorder/RecordButton';
import { ApprovalList } from '@/components/review/ApprovalList';
import { HistoryList } from '@/components/history/HistoryList';
import { TodayTasks } from '@/components/dashboard/TodayTasks';
import { DailyBriefing } from '@/components/dashboard/DailyBriefing';
import { AttentionToday } from '@/components/dashboard/AttentionToday';
import { useItemStore } from '@/stores/itemStore';
import { Card } from '@/components/ui/Card';

export default function Home() {
  const { fetchItems } = useItemStore();

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <header className="text-center py-8">
          <div className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
            <h1 className="text-4xl font-extrabold tracking-tight">🎯 Peygiri Yar</h1>
          </div>
          <p className="text-gray-500 mt-2 text-lg">Smart voice assistant for tracking</p>
          <div className="w-24 h-1 bg-gradient-to-r from-indigo-400 to-purple-400 mx-auto mt-3 rounded-full"></div>
        </header>

        <Card className="mb-8 bg-white/80 backdrop-blur-sm border border-white/50 shadow-xl">
          <div className="py-4">
            <RecordButton />
          </div>
        </Card>

        {/* ===== ATTENTION TODAY (NEW) ===== */}
        <section className="mb-10">
          <AttentionToday />
        </section>

        {/* ===== DAILY BRIEFING ===== */}
        <section className="mb-10">
          <DailyBriefing />
        </section>

        {/* ===== TODAY & THIS WEEK TASKS ===== */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">📋</span>
            <h2 className="text-xl font-bold text-gray-700">Your Tasks</h2>
          </div>
          <TodayTasks />
        </section>

        {/* ===== PENDING APPROVAL ===== */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">⏳</span>
            <h2 className="text-xl font-bold text-gray-700">Pending Approval</h2>
          </div>
          <ApprovalList />
        </section>

        {/* ===== HISTORY ===== */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">📜</span>
            <h2 className="text-xl font-bold text-gray-700">History</h2>
          </div>
          <HistoryList />
        </section>

        <footer className="text-center text-xs text-gray-400 mt-12 border-t border-gray-200 pt-6">
          Peygiri Yar · MVP · All data is stored locally on your device
        </footer>
      </div>
    </main>
  );
}