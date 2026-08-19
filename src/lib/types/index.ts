export type Category = 'customer' | 'task' | 'cost' | 'idea';
export type ItemStatus = 'pending' | 'active' | 'completed' | 'rejected';
export type Priority = 'high' | 'medium' | 'low';

export interface Item {
  id?: number;
  rawText: string;
  category: Category;
  title: string;
  description: string;
  status: ItemStatus;
  priority: Priority;
  dueDate?: string;
  createdAt: Date;
  updatedAt: Date;
  // فیلدهای جدید با قابلیت null
  followUpCondition?: string | null;
  followUpDate?: string | null;
  project?: string | null;
  tags?: string[];
}