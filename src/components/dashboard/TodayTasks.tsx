'use client';

import { useEffect, useState } from 'react';
import { useItemStore } from '@/stores/itemStore';
import { Item } from '@/lib/types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

const formatDate = (date: string) => {
  if (!date) return '';
  try {
    const d = new Date(date);
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return date;
  }
};

export const TodayTasks = () => {
  const { activeItems, fetchItems, isLoading, deleteItem } = useItemStore();
  const [todayItems, setTodayItems] = useState<Item[]>([]);

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    if (activeItems.length === 0) {
      setTodayItems([]);
      return;
    }

    // ✅ دریافت تاریخ امروز به‌صورت محلی (بدون UTC)
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;
    console.log('📅 تاریخ امروز (محلی):', todayStr);

    const todayList = activeItems.filter(i => {
      if (!i.dueDate) return false;
      return i.dueDate === todayStr;
    });

    console.log(`📊 تعداد آیتم‌های امروز: ${todayList.length}`);
    setTodayItems(todayList);
  }, [activeItems]);

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this task?')) {
      await deleteItem(id);
    }
  };

  if (isLoading) return <p className="text-gray-400 text-center py-4">Loading...</p>;

  if (todayItems.length === 0) {
    return (
      <Card className="bg-green-50 border border-green-200">
        <p className="text-green-700 text-center py-4">🎉 No tasks for today! Enjoy your day.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-gray-700">📅 Today ({todayItems.length})</h3>
      {todayItems.map((item) => (
        <Card key={item.id} className="border-l-4 border-indigo-500 bg-indigo-50/50">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h4 className="font-bold text-gray-800">{item.title}</h4>
              <p className="text-sm text-gray-600">{item.description}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-400">📅 {formatDate(item.dueDate!)}</span>
              </div>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={() => item.id && handleDelete(item.id)}
              className="ml-2"
            >
              🗑 Delete
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};