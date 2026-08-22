'use client';

import { useEffect } from 'react';
import { useItemStore } from '@/stores/itemStore';
import { ItemCard } from './ItemCard';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

export const ReviewQueue = () => {
  const { needsReviewItems, fetchItems, isLoading, updateItem } = useItemStore();

  useEffect(() => {
    fetchItems();
  }, []);

  const handleConfirm = async (itemId: number) => {
    await updateItem(itemId, { status: 'pending' });
  };

  const handleDiscard = async (itemId: number) => {
    if (confirm('Are you sure you want to discard this item?')) {
      await updateItem(itemId, { status: 'rejected' });
    }
  };

  if (isLoading) return <p className="text-gray-400 text-center py-4">Loading...</p>;

  if (needsReviewItems.length === 0) {
    return (
      <Card className="bg-green-50 border border-green-200">
        <p className="text-green-700 text-center py-4">✅ No items need review. Everything is clear!</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-gray-700">🔍 Needs Review ({needsReviewItems.length})</h3>
      {needsReviewItems.map((item) => (
        <div key={item.id} className="relative">
          <ItemCard item={item} />
          <div className="flex gap-2 mt-2">
            <Button variant="success" size="sm" onClick={() => item.id && handleConfirm(item.id)}>
              ✔ Confirm
            </Button>
            <Button variant="danger" size="sm" onClick={() => item.id && handleDiscard(item.id)}>
              ✖ Discard
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};