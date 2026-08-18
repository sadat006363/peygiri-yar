import Dexie, { Table } from 'dexie';
import { Item } from '../types';
export class AppDatabase extends Dexie {
  items!: Table<Item, number>;
  constructor() {
    super('PeygiriYarDB');
    this.version(1).stores({
      items: '++id, category, status, createdAt, updatedAt',
    });
  }
}
export const db = new AppDatabase();