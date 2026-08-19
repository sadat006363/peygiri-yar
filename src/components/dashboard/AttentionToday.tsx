'use client';

import { useEffect, useState } from 'react';
import { useItemStore } from '@/stores/itemStore';
import { Item } from '@/lib/types';
import { Card } from '../ui/Card';

export const AttentionToday = () => {
  const { items, fetchItems, isLoading } = useItemStore();
  const [attentionItems, setAttentionItems] = useState<{
    dueToday: Item[];
    overdue: Item[];
    awaiting: Item[];
  }>({ dueToday: [], overdue: [], awaiting: [] });

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    if (items.length === 0) return;

    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    const active = items.filter(i => i.status === 'active');
    const dueToday = active.filter(i => {
      if (!i.dueDate) return false;
      const due = new Date(i.dueDate);
      due.setHours(0, 0, 0, 0);
      return due.getTime() === today.getTime();
    });
    const overdue = active.filter(i => {
      if (!i.dueDate) return false;
      const due = new Date(i.dueDate);
      due.setHours(0, 0, 0, 0);
      return due.getTime() < today.getTime();
    });
    const awaiting = active.filter(i => i.followUpCondition && i.followUpCondition.length > 0);

    setAttentionItems({ dueToday, overdue, awaiting });
  }, [items]);

  if (isLoading) return <p className="text-gray-400 text-center py-4">Loading...</p>;

  const total = attentionItems.dueToday.length + attentionItems.overdue.length + attentionItems.awaiting.length;
  if (total === 0) {
    return (
      <Card className="bg-green-50 border border-green-200">
        <p className="text-green-700 text-center py-4">✅ All clear! Nothing needs your attention today.</p>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200">
      <h3 className="text-lg font-bold text-gray-800 mb-3">🔔 What needs your attention today?</h3>
      <div className="space-y-3">
        {attentionItems.overdue.length > 0 && (
          <div className="bg-red-100/70 rounded-lg p-3 border-l-4 border-red-500">
            <p className="text-sm font-semibold text-red-700">🔴 Overdue ({attentionItems.overdue.length})</p>
            <ul className="text-sm text-gray-700 mt-1 list-disc list-inside">
              {attentionItems.overdue.slice(0, 5).map((item) => (
                <li key={item.id}>{item.title}</li>
              ))}
            </ul>
          </div>
        )}
        {attentionItems.dueToday.length > 0 && (
          <div className="bg-yellow-100/70 rounded-lg p-3 border-l-4 border-yellow-500">
            <p className="text-sm font-semibold text-yellow-700">🟡 Due today ({attentionItems.dueToday.length})</p>
            <ul className="text-sm text-gray-700 mt-1 list-disc list-inside">
              {attentionItems.dueToday.slice(0, 5).map((item) => (
                <li key={item.id}>{item.title}</li>
              ))}
            </ul>
          </div>
        )}
        {attentionItems.awaiting.length > 0 && (
          <div className="bg-blue-100/70 rounded-lg p-3 border-l-4 border-blue-500">
            <p className="text-sm font-semibold text-blue-700">🔵 Awaiting follow-up ({attentionItems.awaiting.length})</p>
            <ul className="text-sm text-gray-700 mt-1 list-disc list-inside">
              {attentionItems.awaiting.slice(0, 5).map((item) => (
                <li key={item.id}>{item.title}</li>
              ))}
            </ul>
          </div>
        )}
        {total > 5 && <p className="text-xs text-gray-400 mt-2">... and {total - 5} more</p>}
      </div>
    </Card>
  );
};