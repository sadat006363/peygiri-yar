'use client';

import { useEffect, useState } from 'react';
import { useItemStore } from '@/stores/itemStore';
import { Card } from '../ui/Card';

interface SummaryData {
  needsFollowup: number;
  waitingForReply: number;
  overdue: number;
  ideas: number;
  expenses: number;
  totalActive: number;
  totalPending: number;
}

export const DashboardSummary = () => {
  const { items, fetchItems, isLoading } = useItemStore();
  const [summary, setSummary] = useState<SummaryData>({
    needsFollowup: 0,
    waitingForReply: 0,
    overdue: 0,
    ideas: 0,
    expenses: 0,
    totalActive: 0,
    totalPending: 0,
  });

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    if (items.length === 0) return;

    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    const activeItems = items.filter(i => i.status === 'active');
    const pendingItems = items.filter(i => i.status === 'pending');

    // نیاز به پیگیری
    const needsFollowup = activeItems.filter(i => i.followUpStatus === 'needs_followup').length;

    // منتظر پاسخ
    const waitingForReply = activeItems.filter(i => i.followUpStatus === 'waiting_for_reply').length;

    // دیرکرد (تاریخ سررسید گذشته باشد)
    const overdue = activeItems.filter(i => {
      if (!i.dueDate) return false;
      const due = new Date(i.dueDate);
      due.setHours(0, 0, 0, 0);
      return due.getTime() < today.getTime() && i.status === 'active';
    }).length;

    // ایده‌ها
    const ideas = activeItems.filter(i => i.category === 'idea').length;

    // هزینه‌ها
    const expenses = activeItems.filter(i => i.category === 'cost').length;

    setSummary({
      needsFollowup,
      waitingForReply,
      overdue,
      ideas,
      expenses,
      totalActive: activeItems.length,
      totalPending: pendingItems.length,
    });
  }, [items]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-gray-100 animate-pulse h-20" />
        ))}
      </div>
    );
  }

  const totalItems = summary.totalActive + summary.totalPending;

  if (totalItems === 0) {
    return (
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 mb-6">
        <p className="text-gray-500 text-center py-3">📊 No items yet. Start by recording your first voice note!</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {/* Overdue */}
      <Card className={`border-l-4 ${summary.overdue > 0 ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50'}`}>
        <p className="text-xs text-gray-500">🔴 Overdue</p>
        <p className="text-2xl font-bold text-gray-800">{summary.overdue}</p>
      </Card>

      {/* Needs Follow-up */}
      <Card className={`border-l-4 ${summary.needsFollowup > 0 ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-gray-50'}`}>
        <p className="text-xs text-gray-500">🔄 Follow-up</p>
        <p className="text-2xl font-bold text-gray-800">{summary.needsFollowup}</p>
      </Card>

      {/* Waiting for Reply */}
      <Card className={`border-l-4 ${summary.waitingForReply > 0 ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200 bg-gray-50'}`}>
        <p className="text-xs text-gray-500">⏳ Waiting</p>
        <p className="text-2xl font-bold text-gray-800">{summary.waitingForReply}</p>
      </Card>

      {/* Pending Approval */}
      <Card className={`border-l-4 ${summary.totalPending > 0 ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
        <p className="text-xs text-gray-500">⏳ Pending</p>
        <p className="text-2xl font-bold text-gray-800">{summary.totalPending}</p>
      </Card>

      {/* Ideas (full width on mobile) */}
      <Card className="border-l-4 border-purple-300 bg-purple-50 col-span-2 md:col-span-1">
        <p className="text-xs text-gray-500">💡 Ideas</p>
        <p className="text-2xl font-bold text-gray-800">{summary.ideas}</p>
      </Card>

      {/* Expenses (full width on mobile) */}
      <Card className="border-l-4 border-green-300 bg-green-50 col-span-2 md:col-span-1">
        <p className="text-xs text-gray-500">💰 Expenses</p>
        <p className="text-2xl font-bold text-gray-800">{summary.expenses}</p>
      </Card>

      {/* Total Active */}
      <Card className="border-l-4 border-indigo-300 bg-indigo-50 col-span-2 md:col-span-1">
        <p className="text-xs text-gray-500">📋 Active Items</p>
        <p className="text-2xl font-bold text-gray-800">{summary.totalActive}</p>
      </Card>

      {/* Total Items */}
      <Card className="border-l-4 border-gray-400 bg-gray-50 col-span-2 md:col-span-1">
        <p className="text-xs text-gray-500">📊 Total Items</p>
        <p className="text-2xl font-bold text-gray-800">{totalItems}</p>
      </Card>
    </div>
  );
};