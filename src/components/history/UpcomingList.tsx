'use client';

import { useEffect, useMemo } from 'react';
import { useItemStore } from '@/stores/itemStore';
import { ItemCard } from '../review/ItemCard';
import { Card } from '../ui/Card';

export const UpcomingList = () => {
  const { items, fetchItems, isLoading } = useItemStore();

  useEffect(() => {
    fetchItems();
  }, []);

  // ✅ فیلتر کردن آیتم‌های غیر pending و مرتب‌سازی بر اساس تاریخ سررسید (نزدیک‌ترین به دورترین)
  const upcomingItems = useMemo(() => {
    const filtered = items.filter(i => i.status !== 'pending');
    return filtered.sort((a, b) => {
      // اگر هر دو تاریخ داشته باشند، بر اساس تاریخ مرتب کن
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      // اگر یکی تاریخ داشت، آن را جلوتر بیاور
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      // اگر هیچکدام تاریخ نداشتند، بر اساس تاریخ ایجاد مرتب کن
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  }, [items]);

  if (isLoading) return <p className="text-gray-400 text-center py-4">Loading...</p>;

  if (upcomingItems.length === 0) {
    return (
      <Card className="bg-gray-50 border border-gray-200">
        <p className="text-gray-500 text-center py-4">📭 No upcoming items. Start recording to build your list!</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4 mt-8">
      <h3 className="font-bold text-gray-700">📅 Upcoming ({upcomingItems.length})</h3>
      {upcomingItems.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  );
};