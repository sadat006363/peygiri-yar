export type Category = 'customer' | 'task' | 'cost' | 'idea';
export type ItemStatus = 'pending' | 'active' | 'completed' | 'rejected';
export type Priority = 'high' | 'medium' | 'low';
export type CorrectionStatus = 'none' | 'ai_corrected' | 'user_corrected';

export interface Item {
  id?: number;
  rawText: string;          // ✅ متن اصلی از Whisper
  correctedText?: string;   // ✅ متن اصلاح‌شده توسط AI یا کاربر
  category: Category;
  title: string;
  description: string;
  status: ItemStatus;
  priority: Priority;
  dueDate?: string;
  createdAt: Date;
  updatedAt: Date;
  // فیلدهای جدید برای اصلاح
  correctionStatus?: CorrectionStatus;  // وضعیت اصلاح
  confidence?: number;                  // سطح اطمینان (۰ تا ۱)
  rawTranscript?: string;               // متن خام Whisper (برای نمایش به کاربر)
  correctedTranscript?: string;         // متن اصلاح‌شده
  // فیلدهای قبلی
  followUpCondition?: string | null;
  followUpDate?: string | null;
  project?: string | null;
  tags?: string[];
}