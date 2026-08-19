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
  // جدید
  followUpCondition?: string;
  followUpDate?: string;
  project?: string;
  tags?: string[];
}