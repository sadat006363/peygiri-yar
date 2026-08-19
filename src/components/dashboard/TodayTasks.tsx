'use client';

import { useEffect, useState } from 'react';
import { useItemStore } from '@/stores/itemStore';
import { Item } from '@/lib/types';
import { Card } from '../ui/Card';

export const TodayTasks = () => {
  const { items, fetchItems, isLoading } = useItemStore();
  const [todayItems, setTodayItems] = useState<Item[]>([]);
  const [weekItems, setWeekItems] = useState<Item[]>([]);

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    if (items.length === 0) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekLater = new Date(today);
    weekLater.setDate(today.getDate() + 7);

    const approved = items.filter(i => i.status === 'approved');

    const todayList = approved.filter(i => {
      if (!i.dueDate) return false;
      const due = new Date(i.dueDate);
      due.setHours(0, 0, 0, 0);
      return due.getTime() === today.getTime();
    });

    const weekList = approved.filter(i => {
      if (!i.dueDate) return false;
      const due = new Date(i.dueDate);
      due.setHours(0, 0, 0, 0);
      return due.getTime() >= today.getTime() && due.getTime() <= weekLater.getTime() && due.getTime() !== today.getTime();
    });

    setTodayItems(todayList);
    setWeekItems(weekList);
  }, [items]);

  if (isLoading) return <p className="text-gray-400 text-center py-4">Loading...</p>;

  if (todayItems.length === 0 && weekItems.length === 0) {
    return (
      <Card className="bg-gray-50 border-dashed">
        <p className="text-gray-400 text-center py-4">📭 No upcoming tasks for today or this week.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {todayItems.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-3">📅 Today ({todayItems.length})</h3>
          <div className="space-y-2">
            {todayItems.map((item) => (
              <Card key={item.id} className="border-l-4 border-indigo-500 bg-indigo-50/50">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-gray-800">{item.title}</h4>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${item.priority === 'high' ? 'bg-red-100 text-red-700' : item.priority === 'medium' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                    {item.priority}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {weekItems.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-3">📆 This Week ({weekItems.length})</h3>
          <div className="space-y-2">
            {weekItems.map((item) => (
              <Card key={item.id} className="border-l-4 border-orange-300">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-gray-800">{item.title}</h4>
                    <p className="text-sm text-gray-600">{item.description}</p>
                    <p className="text-xs text-gray-400 mt-1">📅 {item.dueDate ? new Date(item.dueDate).toLocaleDateString('en-US') : ''}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${item.priority === 'high' ? 'bg-red-100 text-red-700' : item.priority === 'medium' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                    {item.priority}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};