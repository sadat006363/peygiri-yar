export type Category = 'customer' | 'task' | 'cost' | 'idea';
export type ItemStatus = 'pending' | 'approved' | 'rejected';

export interface Item {
  id?: number; // فقط id اختیاری است (چون Dexie آن را تولید می‌کند)
  rawText: string;
  category: Category;
  title: string;
  description: string;
  status: ItemStatus;      // اجباری
  createdAt: Date;         // اجباری
  updatedAt: Date;         // اجباری
  dueDate?: string;        // اختیاری
}