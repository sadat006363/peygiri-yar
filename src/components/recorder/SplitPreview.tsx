'use client';

import { useState } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Modal } from '../ui/Modal';

interface SplitItem {
  category: string;
  title: string;
  description: string;
  priority: string;
  dueDate: string | null;
  nextAction: string | null;
  waitingFor: string | null;
  confidence: number;
}

interface SplitPreviewProps {
  isOpen: boolean;
  items: SplitItem[];
  onClose: () => void;
  onConfirm: (items: SplitItem[]) => void;
  onDiscard: () => void;
}

const categoryLabels: Record<string, string> = {
  customer: '👤 Customer',
  task: '✅ Task',
  cost: '💰 Cost',
  idea: '💡 Idea',
};

const priorityLabels: Record<string, string> = {
  high: '🔴 High',
  medium: '🟡 Medium',
  low: '🔵 Low',
};

export const SplitPreview = ({
  isOpen,
  items,
  onClose,
  onConfirm,
  onDiscard,
}: SplitPreviewProps) => {
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(
    new Set(items.map((_, i) => i))
  );

  const toggleItem = (index: number) => {
    const newSet = new Set(selectedIndices);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setSelectedIndices(newSet);
  };

  const handleConfirm = () => {
    const confirmedItems = items.filter((_, i) => selectedIndices.has(i));
    if (confirmedItems.length === 0) {
      alert('Please select at least one item to save.');
      return;
    }
    onConfirm(confirmedItems);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h3 className="text-xl font-bold mb-4 text-gray-800">✂️ Split Items</h3>
      <p className="text-sm text-gray-600 mb-4">
        Your voice note contains multiple items. Select which ones you want to save:
      </p>
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {items.map((item, index) => (
          <Card
            key={index}
            className={`cursor-pointer transition-all ${
              selectedIndices.has(index)
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => toggleItem(index)}
          >
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={selectedIndices.has(index)}
                onChange={() => toggleItem(index)}
                className="mt-1 w-4 h-4 text-indigo-600"
              />
              <div className="flex-1">
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100">
                    {categoryLabels[item.category] || item.category}
                  </span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100">
                    {priorityLabels[item.priority] || item.priority}
                  </span>
                  {item.confidence < 0.85 && (
                    <span className="text-xs text-orange-600">⚠️ Low confidence</span>
                  )}
                </div>
                <h4 className="font-semibold text-gray-800 mt-1">{item.title}</h4>
                <p className="text-sm text-gray-600">{item.description}</p>
                {item.dueDate && (
                  <p className="text-xs text-gray-500 mt-1">📅 Due: {item.dueDate}</p>
                )}
                {item.nextAction && (
                  <p className="text-xs text-green-600">🎯 Next: {item.nextAction}</p>
                )}
                {item.waitingFor && (
                  <p className="text-xs text-orange-600">⏳ Waiting: {item.waitingFor}</p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
      <div className="flex justify-end gap-3 mt-6">
        <Button variant="secondary" onClick={onDiscard}>
          Discard All
        </Button>
        <Button variant="primary" onClick={handleConfirm}>
          Save Selected ({selectedIndices.size})
        </Button>
      </div>
    </Modal>
  );
};