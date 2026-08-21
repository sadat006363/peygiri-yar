'use client';

import { useEffect, useState } from 'react';
import { useItemStore } from '@/stores/itemStore';
import { Item } from '@/lib/types';
import { Card } from '../ui/Card';

interface DailyBriefingProps {
  onItemClick?: (item: Item) => void; // ✅ جدید: تابع برای کلیک روی آیتم
}

export const DailyBriefing = ({ onItemClick }: DailyBriefingProps) => {
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

    const activeItems = items.filter(i => i.status === 'active');
    const pending = items.filter(i => i.status === 'pending');

    const todayList = activeItems.filter(i => {
      if (!i.dueDate) return false;
      const due = new Date(i.dueDate);
      due.setHours(0, 0, 0, 0);
      return due.getTime() === today.getTime();
    });

    const tomorrowList = activeItems.filter(i => {
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

  // ✅ تابع کمکی برای کلیک روی آیتم
  const handleItemClick = (item: Item) => {
    if (onItemClick) {
      onItemClick(item);
    } else {
      // اگر تابعی ارائه نشده، حداقل لاگ بگیر
      console.log('📋 کلیک روی آیتم:', item.title);
    }
  };

  return (
    <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100">
      <div className="space-y-2">
        <h3 className="text-lg font-bold text-gray-800">🌅 Daily Briefing</h3>

        {briefing.today.length > 0 && (
          <div className="bg-white/70 rounded-lg p-3">
            <p className="text-sm font-semibold text-indigo-700">📅 Today ({briefing.today.length})</p>
            <ul className="text-sm text-gray-700 mt-1 list-disc list-inside">
              {briefing.today.slice(0, 5).map((item) => (
                <li 
                  key={item.id} 
                  className="cursor-pointer hover:text-indigo-600 hover:underline transition-colors"
                  onClick={() => handleItemClick(item)}
                >
                  {item.title}
                </li>
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
                <li 
                  key={item.id} 
                  className="cursor-pointer hover:text-orange-600 hover:underline transition-colors"
                  onClick={() => handleItemClick(item)}
                >
                  {item.title}
                </li>
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