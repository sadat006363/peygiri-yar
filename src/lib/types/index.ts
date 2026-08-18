export type Category = 'customer' | 'task' | 'cost' | 'idea';
export type ItemStatus = 'pending' | 'approved' | 'rejected';

export interface Item {
  id?: number;
  rawText: string;
  category: Category;
  title: string;
  description: string;
  status?: ItemStatus;      // اختیاری
  createdAt?: Date;         // اختیاری
  updatedAt?: Date;         // اختیاری
  dueDate?: string;
}