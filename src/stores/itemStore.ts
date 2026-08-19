import { create } from 'zustand';
import { Item, ItemStatus } from '@/lib/types';
import { itemRepository } from '@/lib/storage/repository';

interface ItemState {
  items: Item[];
  isLoading: boolean;
  pendingItems: Item[];
  activeItems: Item[];
  completedItems: Item[];
  rejectedItems: Item[];
  fetchItems: () => Promise<void>;
  addItem: (item: Omit<Item, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateItem: (id: number, updates: Partial<Item>) => Promise<void>;
  deleteItem: (id: number) => Promise<void>;
}

export const useItemStore = create<ItemState>((set, get) => ({
  items: [],
  isLoading: false,
  pendingItems: [],
  activeItems: [],
  completedItems: [],
  rejectedItems: [],

  fetchItems: async () => {
    set({ isLoading: true });
    const allItems = await itemRepository.getAll();
    const sorted = allItems.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    set({
      items: sorted,
      pendingItems: sorted.filter(i => i.status === 'pending'),
      activeItems: sorted.filter(i => i.status === 'active'),
      completedItems: sorted.filter(i => i.status === 'completed'),
      rejectedItems: sorted.filter(i => i.status === 'rejected'),
      isLoading: false,
    });
  },

  addItem: async (item: Omit<Item, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date();
    const newItem: Omit<Item, 'id'> = {
      ...item,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
      // استفاده از null به جای undefined برای سازگاری با تایپ
      followUpCondition: item.followUpCondition ?? null,
      followUpDate: item.followUpDate ?? null,
      project: item.project ?? null,
      tags: item.tags || [],
    };
    await itemRepository.add(newItem);
    await get().fetchItems();
  },

  updateItem: async (id, updates) => {
    await itemRepository.update(id, updates);
    await get().fetchItems();
  },

  deleteItem: async (id) => {
    await itemRepository.delete(id);
    await get().fetchItems();
  },
}));