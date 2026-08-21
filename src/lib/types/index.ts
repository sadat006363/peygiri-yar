export type Category = 'customer' | 'task' | 'cost' | 'idea';
export type ItemStatus = 'pending' | 'active' | 'completed' | 'rejected';
export type Priority = 'high' | 'medium' | 'low';
export type CorrectionStatus = 'none' | 'ai_corrected' | 'user_corrected';

// ✅ جدید: وضعیت‌های پیگیری مرحله‌ای
export type FollowUpStatus = 
  | 'waiting_for_reply'    // منتظر پاسخ
  | 'awaiting_payment'     // منتظر پرداخت
  | 'scheduled'            // برنامه‌ریزی‌شده
  | 'needs_followup'       // نیاز به پیگیری مجدد
  | 'completed';           // انجام‌شده

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
  // ✅ جدید: فیلدهای Follow-up
  followUpStatus?: FollowUpStatus;
  followUpDate?: string | null;
  // فیلدهای قبلی
  followUpCondition?: string | null;
  project?: string | null;
  tags?: string[];
}

// ✅ جدید: حافظه‌ی اصلاحات
export interface CorrectionMemory {
  id?: number;
  originalText: string;
  correctedText: string;
  userId?: string;
  usageCount: number;
  lastUsed: Date;
  createdAt: Date;
}