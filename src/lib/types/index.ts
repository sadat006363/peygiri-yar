export type Category = 'customer' | 'task' | 'cost' | 'idea';
export type ItemStatus = 'pending' | 'approved' | 'rejected';

export interface Item {
  id?: number; // Dexie auto-increment
  rawText: string;
  category: Category;
  title: string;
  description: string;
  status: ItemStatus;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: string; // optional
}