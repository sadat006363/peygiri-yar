import { db } from './db';
import { Item, ItemStatus, CorrectionMemory } from '../types';

// ============= Item Repository =============
export const itemRepository = {
  async add(item: Omit<Item, 'id'>): Promise<number> {
    return await db.items.add(item as any);
  },

  async getAll(): Promise<Item[]> {
    return await db.items.toArray();
  },

  async getByStatus(status: ItemStatus): Promise<Item[]> {
    return await db.items.where('status').equals(status).toArray();
  },

  async update(id: number, updates: Partial<Item>): Promise<void> {
    await db.items.update(id, { ...updates, updatedAt: new Date() });
  },

  async delete(id: number): Promise<void> {
    await db.items.delete(id);
  },

  async deleteAll(): Promise<void> {
    await db.items.clear();
  },
};

// ============= Correction Memory Repository (✅ جدید) =============
export const correctionMemoryRepository = {
  async add(correction: Omit<CorrectionMemory, 'id'>): Promise<number> {
    return await db.corrections.add(correction as any);
  },

  async getAll(): Promise<CorrectionMemory[]> {
    return await db.corrections.toArray();
  },

  async findById(id: number): Promise<CorrectionMemory | undefined> {
    return await db.corrections.get(id);
  },

  async findByOriginalText(text: string): Promise<CorrectionMemory | undefined> {
    // جستجوی دقیق
    return await db.corrections.where('originalText').equals(text).first();
  },

  async searchByText(text: string): Promise<CorrectionMemory[]> {
    // جستجوی فازی: کلماتی که در متن وجود دارند
    const all = await db.corrections.toArray();
    const words = text.split(/\s+/).filter(w => w.length > 2);
    return all.filter(c => 
      words.some(w => 
        c.originalText.includes(w) || 
        w.includes(c.originalText) ||
        c.correctedText.includes(w) ||
        w.includes(c.correctedText)
      )
    );
  },

  async incrementUsage(id: number): Promise<void> {
    const item = await db.corrections.get(id);
    if (item) {
      await db.corrections.update(id, {
        usageCount: (item.usageCount || 0) + 1,
        lastUsed: new Date(),
      });
    }
  },

  async update(id: number, updates: Partial<CorrectionMemory>): Promise<void> {
    await db.corrections.update(id, { ...updates, lastUsed: new Date() });
  },

  async delete(id: number): Promise<void> {
    await db.corrections.delete(id);
  },

  async deleteAll(): Promise<void> {
    await db.corrections.clear();
  },

  // دریافت پرکاربردترین اصلاحات (برای نمایش به کاربر)
  async getMostUsed(limit: number = 10): Promise<CorrectionMemory[]> {
    const all = await db.corrections.toArray();
    return all
      .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
      .slice(0, limit);
  },
};