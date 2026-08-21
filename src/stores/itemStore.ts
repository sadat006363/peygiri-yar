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
  addItem: (item: Omit<Item, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => Promise<number>;
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
    console.log('📊 fetchItems شروع شد.');
    set({ isLoading: true });
    try {
      const allItems = await itemRepository.getAll();
      const sorted = allItems.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      console.log('📊 همه‌ی آیتم‌ها:', sorted.map(i => ({
        id: i.id,
        status: i.status,
        title: i.title,
        dueDate: i.dueDate,
        followUpStatus: i.followUpStatus,
      })));

      const pending = sorted.filter(i => i.status === 'pending');
      const active = sorted.filter(i => i.status === 'active');
      const completed = sorted.filter(i => i.status === 'completed');
      const rejected = sorted.filter(i => i.status === 'rejected');

      console.log(`📊 آمار: pending=${pending.length}, active=${active.length}, completed=${completed.length}, rejected=${rejected.length}`);

      set({
        items: sorted,
        pendingItems: pending,
        activeItems: active,
        completedItems: completed,
        rejectedItems: rejected,
        isLoading: false,
      });
    } catch (error) {
      console.error('❌ خطا در fetchItems:', error);
      set({ isLoading: false });
    }
  },

  addItem: async (item: Omit<Item, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<number> => {
    console.log('📤 addItem فراخوانی شد:', item);
    try {
      const now = new Date();
      const newItem: Omit<Item, 'id'> = {
        ...item,
        status: 'pending',
        createdAt: now,
        updatedAt: now,
        rawTranscript: item.rawTranscript || item.rawText,
        correctedTranscript: item.correctedTranscript || item.rawText,
        correctionStatus: item.correctionStatus || 'none',
        confidence: item.confidence ?? 1.0,
        followUpCondition: item.followUpCondition ?? null,
        followUpDate: item.followUpDate ?? null,
        project: item.project ?? null,
        tags: item.tags || [],
        // ✅ جدید: فیلدهای Follow-up با مقدار پیش‌فرض
        followUpStatus: item.followUpStatus || undefined,
      };
      const savedId = await itemRepository.add(newItem);
      console.log(`✅ آیتم با ID ${savedId} اضافه شد.`);
      await get().fetchItems();
      return savedId;
    } catch (error) {
      console.error('❌ خطا در addItem:', error);
      throw error;
    }
  },

  updateItem: async (id, updates) => {
    console.log(`📤 updateItem فراخوانی شد: id=${id}, updates=`, updates);
    try {
      await itemRepository.update(id, updates);
      console.log('✅ آیتم به‌روزرسانی شد.');
      await get().fetchItems();
    } catch (error) {
      console.error('❌ خطا در updateItem:', error);
    }
  },

  deleteItem: async (id) => {
    console.log(`📤 deleteItem فراخوانی شد: id=${id}`);
    await itemRepository.delete(id);
    await get().fetchItems();
  },
}));