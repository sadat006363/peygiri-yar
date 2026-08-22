'use client';

import { useState } from 'react';
import { Item, Priority, FollowUpStatus } from '@/lib/types';
import { useItemStore } from '@/stores/itemStore';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

const categoryColors = {
  customer: 'bg-blue-100 text-blue-800',
  task: 'bg-green-100 text-green-800',
  cost: 'bg-yellow-100 text-yellow-800',
  idea: 'bg-purple-100 text-purple-800',
};
const categoryLabels = {
  customer: '👤 Customer',
  task: '✅ Task',
  cost: '💰 Cost',
  idea: '💡 Idea',
};

const priorityColors = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-orange-100 text-orange-700',
  low: 'bg-blue-100 text-blue-700',
};
const priorityLabels = {
  high: '🔴 High',
  medium: '🟡 Medium',
  low: '🔵 Low',
};

const statusLabels = {
  pending: '⏳ Pending',
  active: '✅ Active',
  completed: '✔ Completed',
  rejected: '✖ Rejected',
  needs_review: '🔍 Needs Review',
};
const statusColors = {
  pending: 'bg-gray-100 text-gray-700',
  active: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  rejected: 'bg-red-100 text-red-700',
  needs_review: 'bg-yellow-100 text-yellow-700',
};

const followUpLabels: Record<FollowUpStatus, string> = {
  waiting_for_reply: '⏳ Waiting for Reply',
  awaiting_payment: '💰 Awaiting Payment',
  scheduled: '📅 Scheduled',
  needs_followup: '🔄 Needs Follow-up',
  completed: '✅ Completed',
};
const followUpColors: Record<FollowUpStatus, string> = {
  waiting_for_reply: 'bg-yellow-100 text-yellow-800',
  awaiting_payment: 'bg-red-100 text-red-800',
  scheduled: 'bg-blue-100 text-blue-800',
  needs_followup: 'bg-orange-100 text-orange-800',
  completed: 'bg-green-100 text-green-800',
};

export const ItemCard = ({ item }: { item: Item }) => {
  const { updateItem, deleteItem } = useItemStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState<string>(item.title ?? '');
  const [editDesc, setEditDesc] = useState<string>(item.description ?? '');
  const [editPriority, setEditPriority] = useState<Priority>(item.priority);
  const [editDueDate, setEditDueDate] = useState<string>(item.dueDate ?? '');
  const [editNextAction, setEditNextAction] = useState<string>(item.nextAction ?? '');
  const [editWaitingFor, setEditWaitingFor] = useState<string>(item.waitingFor ?? '');
  // ✅ موجودیت‌ها
  const [editPerson, setEditPerson] = useState<string>(item.person ?? '');
  const [editCompany, setEditCompany] = useState<string>(item.company ?? '');
  const [editProject, setEditProject] = useState<string>(item.project ?? '');
  const [editOwner, setEditOwner] = useState<string>(item.owner ?? '');

  const handleUpdateFollowUpStatus = async (status: FollowUpStatus) => {
    if (item.id) {
      await updateItem(item.id, { followUpStatus: status });
    }
  };

  const handleApprove = async () => {
    console.log('🟢 دکمه Approve کلیک شد.');
    if (item.id) {
      await updateItem(item.id, { status: 'active' });
    }
  };

  const handleReject = async () => {
    console.log('🔴 دکمه Reject کلیک شد.');
    if (item.id) {
      await updateItem(item.id, { status: 'rejected' });
    }
  };

  const handleComplete = async () => {
    console.log('✅ دکمه Complete کلیک شد.');
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

  const saveToCorrectionMemory = async (original: string, corrected: string) => {
    if (original.trim() === corrected.trim()) return;
    try {
      const res = await fetch('/api/correction-memory/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          original: original.trim(),
          corrected: corrected.trim(),
        }),
      });
      if (res.ok) {
        console.log('✅ اصلاحات در حافظه ذخیره شد.');
      } else {
        console.warn('⚠️ خطا در ذخیره اصلاحات در حافظه.');
      }
    } catch (error) {
      console.warn('⚠️ خطا در ذخیره اصلاحات:', error);
    }
  };

  const handleSaveEdit = async () => {
    if (item.id) {
      if (item.description !== editDesc) {
        await saveToCorrectionMemory(item.description, editDesc);
      }
      if (item.title !== editTitle) {
        await saveToCorrectionMemory(item.title, editTitle);
      }
      await updateItem(item.id, {
        title: editTitle,
        description: editDesc,
        priority: editPriority,
        dueDate: editDueDate || undefined,
        nextAction: editNextAction || undefined,
        waitingFor: editWaitingFor || undefined,
        person: editPerson || undefined,
        company: editCompany || undefined,
        project: editProject || undefined,
        owner: editOwner || undefined,
      });
      setIsEditing(false);
      alert('✅ Item updated and corrections saved to memory.');
    }
  };

  return (
    <>
      <Card className="transition-all hover:border-indigo-200">
        <div className="flex flex-col gap-2">
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
            {item.status === 'active' && item.followUpStatus && (
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${followUpColors[item.followUpStatus]}`}>
                {followUpLabels[item.followUpStatus]}
              </span>
            )}
          </div>

          <h4 className="font-bold text-gray-800 text-lg">{item.title}</h4>
          <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>

          {item.nextAction && (
            <div className="text-xs text-green-600 font-medium">🎯 Next Action: {item.nextAction}</div>
          )}
          {item.waitingFor && (
            <div className="text-xs text-orange-600 font-medium">⏳ Waiting for: {item.waitingFor}</div>
          )}

          {/* ✅ موجودیت‌ها */}
          {item.person && (
            <div className="text-xs text-blue-600 font-medium">👤 Person: {item.person}</div>
          )}
          {item.company && (
            <div className="text-xs text-purple-600 font-medium">🏢 Company: {item.company}</div>
          )}
          {item.project && (
            <div className="text-xs text-indigo-600 font-medium">📁 Project: {item.project}</div>
          )}
          {item.owner && (
            <div className="text-xs text-gray-600 font-medium">👤 Owner: {item.owner}</div>
          )}

          {item.rawTranscript && item.correctedTranscript && item.rawTranscript !== item.correctedTranscript && (
            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-gray-500">🗣️ Original: {item.rawTranscript}</p>
              <p className="text-xs text-green-600">✨ Corrected: {item.correctedTranscript}</p>
              {item.confidence && item.confidence < 0.85 && (
                <p className="text-xs text-orange-600 mt-1">
                  ⚠️ Low confidence ({Math.round(item.confidence * 100)}%). Please verify.
                </p>
              )}
              {item.correctionStatus === 'ai_corrected' && (
                <p className="text-xs text-blue-500 mt-1">🤖 AI corrected</p>
              )}
            </div>
          )}

          {item.dueDate && (
            <div className="text-xs text-gray-500">📅 Due: {new Date(item.dueDate).toLocaleDateString('en-US')}</div>
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

          {item.confidence !== undefined && item.confidence < 1 && (
            <div className="mt-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Confidence:</span>
                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden max-w-24">
                  <div 
                    className={`h-full rounded-full ${
                      item.confidence >= 0.85 ? 'bg-green-500' :
                      item.confidence >= 0.7 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${item.confidence * 100}%` }}
                  />
                </div>
                <span className={`text-xs font-medium ${
                  item.confidence >= 0.85 ? 'text-green-600' :
                  item.confidence >= 0.7 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {Math.round(item.confidence * 100)}%
                </span>
              </div>
              {item.confidence < 0.85 && (
                <p className="text-[10px] text-orange-600 mt-0.5">
                  ⚠️ Low confidence. Please review the content carefully.
                </p>
              )}
            </div>
          )}

          {item.status === 'pending' && (
            <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-gray-100">
              <Button variant="success" size="sm" onClick={handleApprove}>✔ Approve</Button>
              <Button variant="danger" size="sm" onClick={handleReject}>✖ Reject</Button>
              <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>✎ Edit</Button>
            </div>
          )}

          {item.status === 'active' && (
            <div className="flex flex-col gap-2 mt-3 pt-2 border-t border-gray-100">
              <div className="flex flex-wrap gap-1">
                <Button 
                  variant={item.followUpStatus === 'waiting_for_reply' ? 'primary' : 'secondary'} 
                  size="sm" 
                  onClick={() => handleUpdateFollowUpStatus('waiting_for_reply')}
                >
                  ⏳ Waiting
                </Button>
                <Button 
                  variant={item.followUpStatus === 'awaiting_payment' ? 'primary' : 'secondary'} 
                  size="sm" 
                  onClick={() => handleUpdateFollowUpStatus('awaiting_payment')}
                >
                  💰 Payment
                </Button>
                <Button 
                  variant={item.followUpStatus === 'scheduled' ? 'primary' : 'secondary'} 
                  size="sm" 
                  onClick={() => handleUpdateFollowUpStatus('scheduled')}
                >
                  📅 Scheduled
                </Button>
                <Button 
                  variant={item.followUpStatus === 'needs_followup' ? 'primary' : 'secondary'} 
                  size="sm" 
                  onClick={() => handleUpdateFollowUpStatus('needs_followup')}
                >
                  🔄 Follow-up
                </Button>
                <Button 
                  variant={item.followUpStatus === 'completed' ? 'success' : 'secondary'} 
                  size="sm" 
                  onClick={() => {
                    handleUpdateFollowUpStatus('completed');
                    handleComplete();
                  }}
                >
                  ✅ Done
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" size="sm" onClick={handleSnooze}>⏰ Snooze (+1d)</Button>
                <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>✎ Edit</Button>
                <Button variant="danger" size="sm" onClick={handleDelete}>🗑 Delete</Button>
              </div>
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
          className="w-full border border-gray-300 rounded-xl p-3 mb-3 focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
          placeholder="Due Date"
        />
        <input
          type="text"
          value={editNextAction}
          onChange={(e) => setEditNextAction(e.target.value)}
          className="w-full border border-gray-300 rounded-xl p-3 mb-3 focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
          placeholder="Next Action"
        />
        <input
          type="text"
          value={editWaitingFor}
          onChange={(e) => setEditWaitingFor(e.target.value)}
          className="w-full border border-gray-300 rounded-xl p-3 mb-3 focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
          placeholder="Waiting for"
        />
        <input
          type="text"
          value={editPerson}
          onChange={(e) => setEditPerson(e.target.value)}
          className="w-full border border-gray-300 rounded-xl p-3 mb-3 focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
          placeholder="Person (e.g., 'John')"
        />
        <input
          type="text"
          value={editCompany}
          onChange={(e) => setEditCompany(e.target.value)}
          className="w-full border border-gray-300 rounded-xl p-3 mb-3 focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
          placeholder="Company (e.g., 'Acme Corp')"
        />
        <input
          type="text"
          value={editProject}
          onChange={(e) => setEditProject(e.target.value)}
          className="w-full border border-gray-300 rounded-xl p-3 mb-3 focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
          placeholder="Project (e.g., 'Project X')"
        />
        <input
          type="text"
          value={editOwner}
          onChange={(e) => setEditOwner(e.target.value)}
          className="w-full border border-gray-300 rounded-xl p-3 mb-4 focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
          placeholder="Owner (e.g., 'Me', 'Team')"
        />
        <div className="flex gap-3">
          <Button variant="primary" onClick={handleSaveEdit}>💾 Save</Button>
          <Button variant="secondary" onClick={() => setIsEditing(false)}>Cancel</Button>
        </div>
      </Modal>
    </>
  );
};