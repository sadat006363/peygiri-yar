'use client';

import { useEffect } from 'react';
import { useItemStore } from '@/stores/itemStore';
import { ItemCard } from '../review/ItemCard';

export const HistoryList = () => {
  const { completedItems, rejectedItems, fetchItems, isLoading } = useItemStore();

  useEffect(() => {
    fetchItems();
  }, []);

  const historyItems = [...completedItems, ...rejectedItems].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  if (isLoading) return <p className="text-gray-400 text-center py-4">Loading...</p>;

  if (historyItems.length === 0) {
    return <p className="text-gray-400 text-center py-4">No history yet.</p>;
  }

  return (
    <div className="space-y-4 mt-8">
      <h3 className="font-bold text-gray-700">📜 History ({historyItems.length})</h3>
      {historyItems.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  );
};