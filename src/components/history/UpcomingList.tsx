'use client';

import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrashIcon } from '@heroicons/react/24/outline';
import { useItemStore } from '@/stores/itemStore';
import { ItemCard } from '../review/ItemCard';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export const UpcomingList = () => {
  const { items, fetchItems, isLoading, clearNonPendingItems } = useItemStore();

  useEffect(() => {
    fetchItems();
  }, []);

  const upcomingItems = useMemo(() => {
    const filtered = items.filter(i => i.status !== 'pending');
    return filtered.sort((a, b) => {
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  }, [items]);

  const handleClearAll = async () => {
    if (upcomingItems.length === 0) {
      alert('📭 No items to clear.');
      return;
    }

    const confirmed = confirm(
      `⚠️ Are you sure you want to delete all ${upcomingItems.length} items from Upcoming?\n\nThis action cannot be undone.`
    );

    if (confirmed) {
      await clearNonPendingItems();
    }
  };

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
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-gray-700">📅 Upcoming ({upcomingItems.length})</h3>
        <Button
          variant="danger"
          size="sm"
          onClick={handleClearAll}
          className="flex items-center gap-1"
        >
          <TrashIcon className="w-4 h-4" />
          Clear All
        </Button>
      </div>
      {upcomingItems.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  );
};