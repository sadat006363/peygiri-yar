'use client';
import { useEffect } from 'react';
import { useItemStore } from '@/stores/itemStore';
import { ItemCard } from '../review/ItemCard';

export const HistoryList = () => {
  const { approvedItems, fetchItems, isLoading } = useItemStore();

  useEffect(() => {
    fetchItems();
  }, []);

  if (isLoading) return <p className="text-gray-400 text-center py-4">Loading...</p>;

  if (approvedItems.length === 0) {
    return <p className="text-gray-400 text-center py-4">No history yet.</p>;
  }

  return (
    <div className="space-y-4 mt-8">
      <h3 className="font-bold text-gray-700">📜 History ({approvedItems.length})</h3>
      {approvedItems.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  );
};