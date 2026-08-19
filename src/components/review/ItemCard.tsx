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

export const ItemCard = ({ item }: { item: Item }) => {
  const { updateItem, deleteItem } = useItemStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(item.title);
  const [editDesc, setEditDesc] = useState(item.description);

  const handleApprove = async () => {
    if (item.id) {
      await updateItem(item.id, { status: 'approved' });
      // ✅ برنامه‌ریزی نوتیفیکیشن (گام ۳)
      if (item.dueDate) {
        scheduleNotification(item);
      }
    }
  };
  const handleReject = async () => {
    if (item.id) await updateItem(item.id, { status: 'rejected' });
  };
  const handleDelete = async () => {
    if (item.id && confirm('Are you sure you want to delete this item?')) {
      await deleteItem(item.id);
    }
  };
  const handleSaveEdit = async () => {
    if (item.id) {
      await updateItem(item.id, { title: editTitle, description: editDesc });
      setIsEditing(false);
    }
  };

  // ✅ تابع برنامه‌ریزی نوتیفیکیشن (گام ۳)
  const scheduleNotification = (item: Item) => {
    if (!item.dueDate) return;
    const due = new Date(item.dueDate);
    const now = new Date();
    const oneDayBefore = new Date(due);
    oneDayBefore.setDate(due.getDate() - 1);

    const timeUntilNotify = oneDayBefore.getTime() - now.getTime();
    if (timeUntilNotify > 0) {
      setTimeout(() => {
        if (Notification.permission === 'granted') {
          new Notification('⏰ پیگیری‌یار: یادآوری', {
            body: `📌 ${item.title}\n📅 موعد: ${item.dueDate}`,
            icon: '/icon-192.png',
          });
        }
      }, timeUntilNotify);
      console.log(`✅ نوتیفیکیشن برای ${item.dueDate} برنامه‌ریزی شد.`);
    }
  };

  return (
    <>
      <Card className="transition-all hover:border-indigo-200">
        <div className="flex flex-col gap-2">
          {/* برچسب‌ها: دسته + اولویت */}
          <div className="flex flex-wrap justify-between items-start gap-2">
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${categoryColors[item.category]}`}>
              {categoryLabels[item.category] || item.category}
            </span>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${priorityColors[item.priority]}`}>
              {priorityLabels[item.priority]}
            </span>
            {item.status !== 'pending' && (
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${item.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {item.status === 'approved' ? '✔ Approved' : '✖ Rejected'}
              </span>
            )}
          </div>

          <h4 className="font-bold text-gray-800 text-lg">{item.title}</h4>
          <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>

          {/* تاریخ سررسید */}
          {item.dueDate && (
            <div className="text-xs text-gray-500">
              📅 Due: {new Date(item.dueDate).toLocaleDateString('en-US')}
            </div>
          )}

          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-gray-400">
              {item.createdAt ? new Date(item.createdAt).toLocaleString('en-US') : 'Just now'}
            </span>
          </div>

          {item.status === 'pending' && (
            <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-gray-100">
              <Button variant="success" size="sm" onClick={handleApprove}>✔ Approve</Button>
              <Button variant="danger" size="sm" onClick={handleReject}>✖ Reject</Button>
              <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>✎ Edit</Button>
            </div>
          )}
          {(item.status === 'approved' || item.status === 'rejected') && (
            <div className="mt-2 pt-2 border-t border-gray-100">
              <Button variant="secondary" size="sm" onClick={handleDelete}>🗑 Delete</Button>
            </div>
          )}
        </div>
      </Card>

      <Modal isOpen={isEditing} onClose={() => setIsEditing(false)}>
        <h3 className="text-xl font-bold mb-4 text-gray-800">✎ Edit Item</h3>
        <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full border border-gray-300 rounded-xl p-3 mb-3" placeholder="Title" />
        <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} className="w-full border border-gray-300 rounded-xl p-3 mb-4" rows={3} placeholder="Description" />
        <div className="flex gap-3">
          <Button variant="primary" onClick={handleSaveEdit}>💾 Save</Button>
          <Button variant="secondary" onClick={() => setIsEditing(false)}>Cancel</Button>
        </div>
      </Modal>
    </>
  );
};