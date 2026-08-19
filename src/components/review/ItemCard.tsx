'use client';

import { useState } from 'react';
import { Item, Priority } from '@/lib/types';
import { useItemStore } from '@/stores/itemStore';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

const categoryColors: Record<string, string> = {
  customer: 'bg-blue-100 text-blue-800',
  task: 'bg-green-100 text-green-800',
  cost: 'bg-yellow-100 text-yellow-800',
  idea: 'bg-purple-100 text-purple-800',
};
const categoryLabels: Record<string, string> = {
  customer: '👤 Customer',
  task: '✅ Task',
  cost: '💰 Cost',
  idea: '💡 Idea',
};

const priorityColors: Record<Priority, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-orange-100 text-orange-700',
  low: 'bg-blue-100 text-blue-700',
};
const priorityLabels: Record<Priority, string> = {
  high: '🔴 High',
  medium: '🟡 Medium',
  low: '🔵 Low',
};

const statusLabels: Record<string, string> = {
  pending: '⏳ Pending',
  active: '✅ Active',
  completed: '✔ Completed',
  rejected: '✖ Rejected',
};
const statusColors: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-700',
  active: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  rejected: 'bg-red-100 text-red-700',
};

export const ItemCard = ({ item }: { item: Item }) => {
  const { updateItem, deleteItem } = useItemStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(item.title);
  const [editDesc, setEditDesc] = useState(item.description);
  const [editPriority, setEditPriority] = useState<Priority>(item.priority);
  const [editDueDate, setEditDueDate] = useState(item.dueDate || '');

  const handleApprove = async () => {
    if (item.id) {
      await updateItem(item.id, { status: 'active' });
    }
  };

  const handleReject = async () => {
    if (item.id) {
      await updateItem(item.id, { status: 'rejected' });
    }
  };

  const handleComplete = async () => {
    if (item.id) {
      await updateItem(item.id, { status: 'completed' });
    }
  };

  const handleSnooze = async () => {
    if (item.id) {
      const currentDue = item.dueDate ? new Date(item.dueDate) : new Date();
      currentDue.setDate(currentDue.getDate() + 1);
      await updateItem(item.id, {
        dueDate: currentDue.toISOString().split('T')[0],
        updatedAt: new Date(),
      });
      alert('⏰ Item snoozed for one day.');
    }
  };

  const handleDelete = async () => {
    if (item.id && confirm('Are you sure you want to delete this item?')) {
      await deleteItem(item.id);
    }
  };

  const handleSaveEdit = async () => {
    if (item.id) {
      await updateItem(item.id, {
        title: editTitle,
        description: editDesc,
        priority: editPriority,
        dueDate: editDueDate || null,
      });
      setIsEditing(false);
    }
  };

  return (
    <>
      <Card className="transition-all hover:border-indigo-200">
        <div className="flex flex-col gap-2">
          {/* برچسب‌ها: دسته + اولویت + وضعیت */}
          <div className="flex flex-wrap justify-between items-start gap-2">
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${categoryColors[item.category]}`}>
              {categoryLabels[item.category] || item.category}
            </span>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${priorityColors[item.priority]}`}>
              {priorityLabels[item.priority]}
            </span>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[item.status]}`}>
              {statusLabels[item.status] || item.status}
            </span>
          </div>

          <h4 className="font-bold text-gray-800 text-lg">{item.title}</h4>
          <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>

          {item.dueDate && (
            <div className="text-xs text-gray-500">
              📅 Due: {new Date(item.dueDate).toLocaleDateString('en-US')}
            </div>
          )}

          {item.project && (
            <div className="text-xs text-gray-500">📁 Project: {item.project}</div>
          )}
          {item.tags && item.tags.length > 0 && (
            <div className="text-xs text-gray-500">🏷️ Tags: {item.tags.join(', ')}</div>
          )}
          {item.followUpCondition && (
            <div className="text-xs text-orange-600">🔄 Follow-up: {item.followUpCondition}</div>
          )}

          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-gray-400">
              {item.createdAt ? new Date(item.createdAt).toLocaleString('en-US') : 'Just now'}
            </span>
          </div>

          {/* دکمه‌های عملیاتی بر اساس وضعیت */}
          {item.status === 'pending' && (
            <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-gray-100">
              <Button variant="success" size="sm" onClick={handleApprove}>✔ Approve</Button>
              <Button variant="danger" size="sm" onClick={handleReject}>✖ Reject</Button>
              <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>✎ Edit</Button>
            </div>
          )}

          {item.status === 'active' && (
            <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-gray-100">
              <Button variant="success" size="sm" onClick={handleComplete}>✅ Complete</Button>
              <Button variant="secondary" size="sm" onClick={handleSnooze}>⏰ Snooze (+1d)</Button>
              <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>✎ Edit</Button>
              <Button variant="danger" size="sm" onClick={handleDelete}>🗑 Delete</Button>
            </div>
          )}

          {(item.status === 'completed' || item.status === 'rejected') && (
            <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-gray-100">
              <Button variant="danger" size="sm" onClick={handleDelete}>🗑 Delete</Button>
            </div>
          )}
        </div>
      </Card>

      <Modal isOpen={isEditing} onClose={() => setIsEditing(false)}>
        <h3 className="text-xl font-bold mb-4 text-gray-800">✎ Edit Item</h3>
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          className="w-full border border-gray-300 rounded-xl p-3 mb-3 focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
          placeholder="Title"
        />
        <textarea
          value={editDesc}
          onChange={(e) => setEditDesc(e.target.value)}
          className="w-full border border-gray-300 rounded-xl p-3 mb-3 focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
          rows={3}
          placeholder="Description"
        />
        <select
          value={editPriority}
          onChange={(e) => setEditPriority(e.target.value as Priority)}
          className="w-full border border-gray-300 rounded-xl p-3 mb-3 focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
        >
          <option value="high">🔴 High</option>
          <option value="medium">🟡 Medium</option>
          <option value="low">🔵 Low</option>
        </select>
        <input
          type="date"
          value={editDueDate}
          onChange={(e) => setEditDueDate(e.target.value)}
          className="w-full border border-gray-300 rounded-xl p-3 mb-4 focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
        />
        <div className="flex gap-3">
          <Button variant="primary" onClick={handleSaveEdit}>💾 Save</Button>
          <Button variant="secondary" onClick={() => setIsEditing(false)}>Cancel</Button>
        </div>
      </Modal>
    </>
  );
};