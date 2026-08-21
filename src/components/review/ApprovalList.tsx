'use client';

import { useEffect } from 'react';
import { useItemStore } from '@/stores/itemStore';
import { ItemCard } from './ItemCard';

export const ApprovalList = () => {
  const { pendingItems, fetchItems, isLoading } = useItemStore();

  useEffect(() => {
    fetchItems();
  }, []);

  if (isLoading) return <p className="text-gray-400 text-center py-4">Loading...</p>;

  if (pendingItems.length === 0) {
    return <p className="text-gray-400 text-center py-4">No items pending approval.</p>;
  }

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-gray-700">⏳ Pending ({pendingItems.length})</h3>
      {pendingItems.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  );
};