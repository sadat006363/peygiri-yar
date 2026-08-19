import Dexie, { Table } from 'dexie';
import { Item, CorrectionMemory } from '../types';

export class AppDatabase extends Dexie {
  items!: Table<Item, number>;
  corrections!: Table<CorrectionMemory, number>; // ✅ جدید

  constructor() {
    super('PeygiriYarDB');
    this.version(2).stores({
      items: '++id, category, status, createdAt, updatedAt, priority, dueDate',
      corrections: '++id, originalText, correctedText, usageCount, lastUsed, createdAt', // ✅ جدید
    });
  }
}

export const db = new AppDatabase();