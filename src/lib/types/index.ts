export type Category = 'customer' | 'task' | 'cost' | 'idea';
export type ItemStatus = 'pending' | 'active' | 'completed' | 'rejected' | 'needs_review';
export type Priority = 'high' | 'medium' | 'low';
export type CorrectionStatus = 'none' | 'ai_corrected' | 'user_corrected';

export type FollowUpStatus = 
  | 'waiting_for_reply'
  | 'awaiting_payment'
  | 'scheduled'
  | 'needs_followup'
  | 'completed';

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
  correctionStatus?: CorrectionStatus;
  confidence?: number;
  rawTranscript?: string;
  correctedTranscript?: string;
  
  // ✅ فیلدهای عملیاتی
  nextAction?: string;
  waitingFor?: string;
  owner?: string;
  amount?: number;
  currency?: string;
  
  followUpStatus?: FollowUpStatus;
  followUpDate?: string | null;
  followUpCondition?: string | null;
  project?: string | null;
  tags?: string[];
}

export interface CorrectionMemory {
  id?: number;
  originalText: string;
  correctedText: string;
  userId?: string;
  usageCount: number;
  lastUsed: Date;
  createdAt: Date;
}