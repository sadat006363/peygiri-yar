import { db } from './db';
import { Item, ItemStatus } from '../types';

export const itemRepository = {
  async add(item: Omit<Item, 'id'>): Promise<number> {
    return await db.items.add(item as any);
  },

  async getAll(): Promise<Item[]> {
    return await db.items.toArray();
  },

  async getByStatus(status: ItemStatus): Promise<Item[]> {
    // status از نوع ItemStatus است و مقدار دارد
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