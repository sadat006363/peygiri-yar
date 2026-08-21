'use client';

import { useEffect, useState } from 'react';
import { useItemStore } from '@/stores/itemStore';
import { Item } from '@/lib/types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export const TodayTasks = () => {
  const { activeItems, fetchItems, isLoading, deleteItem } = useItemStore();
  const [todayItems, setTodayItems] = useState<Item[]>([]);

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    if (activeItems.length === 0) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayList = activeItems.filter(i => {
      if (!i.dueDate) return false;
      const due = new Date(i.dueDate);
      due.setHours(0, 0, 0, 0);
      return due.getTime() === today.getTime();
    });

    setTodayItems(todayList);
  }, [activeItems]);

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this task? It will also be removed from History.')) {
      await deleteItem(id);
      // آیتم از دیتابیس حذف می‌شود و fetchItems دوباره فراخوانی می‌شود
    }
  };

  if (isLoading) return <p className="text-gray-400 text-center py-4">Loading...</p>;

  if (todayItems.length === 0) {
    return (
      <Card className="bg-gray-50 border-dashed">
        <p className="text-gray-400 text-center py-4">📭 No tasks for today.</p>
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
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  item.priority === 'high' ? 'bg-red-100 text-red-700' :
                  item.priority === 'medium' ? 'bg-orange-100 text-orange-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {item.priority}
                </span>
                {item.followUpStatus && (
                  <span className="text-xs text-gray-500">
                    🔄 {item.followUpStatus.replace('_', ' ')}
                  </span>
                )}
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