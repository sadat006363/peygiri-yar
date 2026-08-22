'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  PencilSquareIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { Item } from '@/lib/types';
import { useItemStore } from '@/stores/itemStore';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

// ✅ تابع کمکی برای نمایش تاریخ به‌صورت خوانا
const formatDate = (date: string | undefined) => {
  if (!date) return '';
  try {
    const d = new Date(date);
    // فرمت: "23 Aug 2026"
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return date;
  }
};

export const ItemCard = ({ item }: { item: Item }) => {
  const { updateItem, deleteItem } = useItemStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState<string>(item.title ?? '');
  const [editDesc, setEditDesc] = useState<string>(item.description ?? '');
  const [editDueDate, setEditDueDate] = useState<string>(item.dueDate ?? '');

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
        dueDate: editDueDate || undefined,
      });
      setIsEditing(false);
      alert('✅ Item updated successfully!');
    }
  };

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.01, boxShadow: '0 10px 30px -15px rgba(0,0,0,0.2)' }}
        transition={{ duration: 0.2 }}
      >
        <Card className="transition-all hover:border-indigo-200">
          <div className="flex flex-col gap-2">
            {/* وضعیت */}
            <div className="flex flex-wrap justify-between items-start gap-2">
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                item.status === 'pending' ? 'bg-gray-100 text-gray-700' :
                item.status === 'active' ? 'bg-green-100 text-green-700' :
                item.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                'bg-red-100 text-red-700'
              }`}>
                {item.status === 'pending' ? '⏳ Pending' :
                 item.status === 'active' ? '✅ Active' :
                 item.status === 'completed' ? '✔ Completed' :
                 '✖ Rejected'}
              </span>
              {item.dueDate && (
                <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-purple-100 text-purple-700">
                  📅 {formatDate(item.dueDate)}
                </span>
              )}
            </div>

            <h4 className="font-bold text-gray-800 text-lg">{item.title}</h4>
            <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>

            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-gray-400">
                {item.createdAt ? new Date(item.createdAt).toLocaleString('en-US') : 'Just now'}
              </span>
            </div>

            {item.status === 'pending' && (
              <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-gray-100">
                <Button variant="success" size="sm" onClick={handleApprove}>
                  <CheckCircleIcon className="w-4 h-4 mr-1" /> Approve
                </Button>
                <Button variant="danger" size="sm" onClick={handleReject}>
                  <XCircleIcon className="w-4 h-4 mr-1" /> Reject
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
                  <PencilSquareIcon className="w-4 h-4 mr-1" /> Edit
                </Button>
              </div>
            )}

            {(item.status === 'active' || item.status === 'completed' || item.status === 'rejected') && (
              <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-gray-100">
                <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
                  <PencilSquareIcon className="w-4 h-4 mr-1" /> Edit
                </Button>
                <Button variant="danger" size="sm" onClick={handleDelete}>
                  <TrashIcon className="w-4 h-4 mr-1" /> Delete
                </Button>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

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
        <input
          type="date"
          value={editDueDate}
          onChange={(e) => setEditDueDate(e.target.value)}
          className="w-full border border-gray-300 rounded-xl p-3 mb-4 focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
          placeholder="Due Date"
        />
        <div className="flex gap-3">
          <Button variant="primary" onClick={handleSaveEdit}>💾 Save</Button>
          <Button variant="secondary" onClick={() => setIsEditing(false)}>Cancel</Button>
        </div>
      </Modal>
    </>
  );
};