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
  needsReviewItems: Item[];
  fetchItems: () => Promise<void>;
  addItem: (item: Omit<Item, 'id' | 'createdAt' | 'updatedAt'> & { status?: ItemStatus }) => Promise<number>;
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
  needsReviewItems: [],

  fetchItems: async () => {
    console.log('📊 fetchItems شروع شد.');
    set({ isLoading: true });
    try {
      const allItems = await itemRepository.getAll();
      const sorted = allItems.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      set({
        items: sorted,
        pendingItems: sorted.filter(i => i.status === 'pending'),
        activeItems: sorted.filter(i => i.status === 'active'),
        completedItems: sorted.filter(i => i.status === 'completed'),
        rejectedItems: sorted.filter(i => i.status === 'rejected'),
        needsReviewItems: sorted.filter(i => i.status === 'needs_review'),
        isLoading: false,
      });
    } catch (error) {
      console.error('❌ خطا در fetchItems:', error);
      set({ isLoading: false });
    }
  },

  addItem: async (item: Omit<Item, 'id' | 'createdAt' | 'updatedAt'> & { status?: ItemStatus }): Promise<number> => {
    console.log('📤 addItem فراخوانی شد:', item);
    try {
      const now = new Date();
      // اگر status در ورودی وجود داشت، از آن استفاده کن، در غیر این صورت پیش‌فرض 'pending'
      const finalStatus = item.status || 'pending';
      
      const newItem: Omit<Item, 'id'> = {
        ...item,
        status: finalStatus,
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
        followUpStatus: item.followUpStatus || undefined,
        nextAction: item.nextAction || undefined,
        waitingFor: item.waitingFor || undefined,
        owner: item.owner || undefined,
        amount: item.amount || undefined,
        currency: item.currency || undefined,
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