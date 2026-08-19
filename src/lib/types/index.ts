export type Category = 'customer' | 'task' | 'cost' | 'idea';
export type ItemStatus = 'pending' | 'active' | 'completed' | 'rejected';
export type Priority = 'high' | 'medium' | 'low';
export type CorrectionStatus = 'none' | 'ai_corrected' | 'user_corrected';

export interface Item {
  id?: number;
  rawText: string;
  correctedText?: string;
  category: Category;
  title: string;
  description: string;
  status: ItemStatus;
  priority: Priority;
  dueDate?: string;
  createdAt: Date;
  updatedAt: Date;
  // فیلدهای اصلاح
  correctionStatus?: CorrectionStatus;
  confidence?: number;
  rawTranscript?: string;
  correctedTranscript?: string;
  // فیلدهای قبلی
  followUpCondition?: string | null;
  followUpDate?: string | null;
  project?: string | null;
  tags?: string[];
}

// ✅ جدید: حافظه‌ی اصلاحات
export interface CorrectionMemory {
  id?: number;
  originalText: string;    // کلمه/عبارت اشتباه
  correctedText: string;   // کلمه/عبارت اصلاح‌شده
  userId?: string;         // برای آینده (وقتی احراز هویت اضافه شد)
  usageCount: number;      // تعداد دفعات استفاده
  lastUsed: Date;
  createdAt: Date;
}