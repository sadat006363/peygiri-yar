import { create } from 'zustand';
import { Item, ItemStatus } from '@/lib/types';
import { itemRepository } from '@/lib/storage/repository';

// تعریف interface برای state و action‌ها
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

// ساخت store با Zustand
export const useItemStore = create<ItemState>((set, get) => ({
  // ============================================
  // مقادیر اولیه state
  // ============================================
  items: [],
  isLoading: false,
  pendingItems: [],
  activeItems: [],
  completedItems: [],
  rejectedItems: [],
  needsReviewItems: [],

  // ============================================
  // fetchItems: دریافت همه‌ی آیتم‌ها از دیتابیس و فیلتر کردن بر اساس وضعیت
  // ============================================
  fetchItems: async () => {
    console.log('📊 fetchItems شروع شد.');
    set({ isLoading: true });
    try {
      const allItems = await itemRepository.getAll();
      
      // مرتب‌سازی بر اساس زمان ایجاد (جدیدترین اول)
      const sorted = allItems.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      // فیلتر کردن بر اساس وضعیت و به‌روزرسانی state
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

  // ============================================
  // addItem: افزودن آیتم جدید
  // ============================================
  addItem: async (item: Omit<Item, 'id' | 'createdAt' | 'updatedAt'> & { status?: ItemStatus }) => {
    console.log('📤 addItem فراخوانی شد، status دریافتی:', item.status);
    
    // اگر status ارسال نشده باشد، پیش‌فرض 'pending' استفاده می‌شود
    const finalStatus = item.status || 'pending';
    console.log('📤 وضعیت نهایی:', finalStatus);
    
    const now = new Date();
    
    // ساخت شیء جدید با تمام فیلدهای مورد نیاز
    const newItem: Omit<Item, 'id'> = {
      ...item,
      status: finalStatus,
      createdAt: now,
      updatedAt: now,
      
      // فیلدهای اضافی با مقدار پیش‌فرض
      rawTranscript: item.rawTranscript || item.rawText,
      correctedTranscript: item.correctedTranscript || item.rawText,
      correctionStatus: item.correctionStatus || 'none',
      confidence: item.confidence ?? 1.0,
      
      // فیلدهای اختیاری (تبدیل null به undefined)
      followUpCondition: item.followUpCondition ?? undefined,
      followUpDate: item.followUpDate ?? undefined,
      project: item.project ?? undefined,
      tags: item.tags || [],
      followUpStatus: item.followUpStatus || undefined,
      
      // فیلدهای عملیاتی (Next Action, Waiting For, ...)
      nextAction: item.nextAction ?? undefined,
      waitingFor: item.waitingFor ?? undefined,
      owner: item.owner ?? undefined,
      amount: item.amount ?? undefined,
      currency: item.currency ?? undefined,
    };
    
    // ذخیره در دیتابیس
    const savedId = await itemRepository.add(newItem);
    console.log(`✅ آیتم با ID ${savedId} و وضعیت ${finalStatus} اضافه شد.`);
    
    // به‌روزرسانی لیست آیتم‌ها پس از افزودن
    await get().fetchItems();
    return savedId;
  },

  // ============================================
  // updateItem: به‌روزرسانی یک آیتم موجود
  // ============================================
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

  // ============================================
  // deleteItem: حذف یک آیتم
  // ============================================
  deleteItem: async (id) => {
    console.log(`📤 deleteItem فراخوانی شد: id=${id}`);
    await itemRepository.delete(id);
    await get().fetchItems();
  },
}));