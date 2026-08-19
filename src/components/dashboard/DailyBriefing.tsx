'use client';

import { useEffect, useState } from 'react';
import { useItemStore } from '@/stores/itemStore';
import { Item } from '@/lib/types';
import { Card } from '../ui/Card';

export const DailyBriefing = () => {
  const { items, fetchItems, isLoading } = useItemStore();
  const [briefing, setBriefing] = useState<{
    today: Item[];
    tomorrow: Item[];
    totalPending: number;
  }>({ today: [], tomorrow: [], totalPending: 0 });

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    if (items.length === 0) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const approved = items.filter(i => i.status === 'approved');
    const pending = items.filter(i => i.status === 'pending');

    const todayList = approved.filter(i => {
      if (!i.dueDate) return false;
      const due = new Date(i.dueDate);
      due.setHours(0, 0, 0, 0);
      return due.getTime() === today.getTime();
    });

    const tomorrowList = approved.filter(i => {
      if (!i.dueDate) return false;
      const due = new Date(i.dueDate);
      due.setHours(0, 0, 0, 0);
      return due.getTime() === tomorrow.getTime();
    });

    setBriefing({
      today: todayList,
      tomorrow: tomorrowList,
      totalPending: pending.length,
    });
  }, [items]);

  if (isLoading) return <p className="text-gray-400 text-center py-4">Loading briefing...</p>;

  if (briefing.today.length === 0 && briefing.tomorrow.length === 0 && briefing.totalPending === 0) {
    return (
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100">
        <p className="text-gray-500 text-center py-4">🌅 You're all caught up! No tasks for today.</p>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100">
      <div className="space-y-2">
        <h3 className="text-lg font-bold text-gray-800">🌅 Daily Briefing</h3>

        {briefing.today.length > 0 && (
          <div className="bg-white/70 rounded-lg p-3">
            <p className="text-sm font-semibold text-indigo-700">📅 Today ({briefing.today.length})</p>
            <ul className="text-sm text-gray-700 mt-1 list-disc list-inside">
              {briefing.today.slice(0, 5).map((item) => (
                <li key={item.id}>{item.title}</li>
              ))}
              {briefing.today.length > 5 && <li className="text-gray-400">... and {briefing.today.length - 5} more</li>}
            </ul>
          </div>
        )}

        {briefing.tomorrow.length > 0 && (
          <div className="bg-white/70 rounded-lg p-3">
            <p className="text-sm font-semibold text-orange-600">📆 Tomorrow ({briefing.tomorrow.length})</p>
            <ul className="text-sm text-gray-700 mt-1 list-disc list-inside">
              {briefing.tomorrow.slice(0, 3).map((item) => (
                <li key={item.id}>{item.title}</li>
              ))}
              {briefing.tomorrow.length > 3 && <li className="text-gray-400">... and {briefing.tomorrow.length - 3} more</li>}
            </ul>
          </div>
        )}

        {briefing.totalPending > 0 && (
          <div className="text-xs text-gray-500 mt-2">
            ⏳ {briefing.totalPending} item(s) pending approval
          </div>
        )}
      </div>
    </Card>
  );
};