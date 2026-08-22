'use client';

import { useEffect } from 'react';
import { useItemStore } from '@/stores/itemStore';
import { ItemCard } from '../review/ItemCard';
import { Card } from '../ui/Card';

export const HistoryList = () => {
  const { items, fetchItems, isLoading } = useItemStore();

  useEffect(() => {
    fetchItems();
  }, []);

  const historyItems = items.filter(i => i.status !== 'pending');

  if (isLoading) return <p className="text-gray-400 text-center py-4">Loading...</p>;

  if (historyItems.length === 0) {
    return (
      <Card className="bg-gray-50 border border-gray-200">
        <p className="text-gray-500 text-center py-4">📭 No history yet. Start recording to build your timeline!</p>
      </Card>
    );
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