export type Category = 'customer' | 'task' | 'cost' | 'idea';
export type ItemStatus = 'pending' | 'approved' | 'rejected';
export type Priority = 'high' | 'medium' | 'low';

export interface Item {
  id?: number;
  rawText: string;
  category: Category;
  title: string;
  description: string;
  status: ItemStatus;
  priority: Priority;          // ✅ جدید
  dueDate?: string;            // ✅ جدید (ISO format)
  createdAt: Date;
  updatedAt: Date;
}