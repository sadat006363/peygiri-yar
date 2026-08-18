import { create } from 'zustand';
import { Item, ItemStatus } from '@/lib/types';
import { itemRepository } from '@/lib/storage/repository';

interface ItemState {
  items: Item[];
  isLoading: boolean;
  pendingItems: Item[];
  approvedItems: Item[];
  fetchItems: () => Promise<void>;
  addItem: (item: Omit<Item, 'id'>) => Promise<void>;
  updateItem: (id: number, updates: Partial<Item>) => Promise<void>;
  deleteItem: (id: number) => Promise<void>;
}

export const useItemStore = create<ItemState>((set, get) => ({
  items: [],
  isLoading: false,
  pendingItems: [],
  approvedItems: [],

  fetchItems: async () => {
    set({ isLoading: true });
    const allItems = await itemRepository.getAll();
    // مرتب‌سازی بر اساس زمان (جدیدترین اول)
    const sorted = allItems.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    set({
      items: sorted,
      pendingItems: sorted.filter(i => i.status === 'pending'),
      approvedItems: sorted.filter(i => i.status === 'approved' || i.status === 'rejected'),
      isLoading: false,
    });
  },

  addItem: async (item) => {
    const newItem = {
      ...item,
      status: 'pending' as ItemStatus,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const id = await itemRepository.add(newItem);
    await get().fetchItems(); // ریفرش لیست
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