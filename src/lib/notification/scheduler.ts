import { Item } from '@/lib/types';

// ذخیره‌ی تایمرها برای لغو در صورت نیاز
const timers: Map<number, NodeJS.Timeout> = new Map();

export const scheduleNotification = (item: Item) => {
  if (!item.dueDate || !item.id) return;
  if (typeof window === 'undefined') return; // فقط در مرورگر

  // اگر نوتیفیکیشن قبلاً برنامه‌ریزی شده، لغو کن
  if (timers.has(item.id)) {
    clearTimeout(timers.get(item.id));
    timers.delete(item.id);
  }

  const due = new Date(item.dueDate);
  const now = new Date();
  const oneDayBefore = new Date(due);
  oneDayBefore.setDate(due.getDate() - 1);
  oneDayBefore.setHours(9, 0, 0, 0); // صبح روز قبل

  const timeUntilNotify = oneDayBefore.getTime() - now.getTime();

  if (timeUntilNotify > 0) {
    const timer = setTimeout(() => {
      if (Notification.permission === 'granted') {
        new Notification('⏰ پیگیری‌یار: یادآوری', {
          body: `📌 ${item.title}\n📅 موعد: ${item.dueDate}`,
          icon: '/icon-192.png',
        });
        console.log(`✅ نوتیفیکیشن برای آیتم ${item.id} نمایش داده شد.`);
      } else if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification('⏰ پیگیری‌یار: یادآوری', {
              body: `📌 ${item.title}\n📅 موعد: ${item.dueDate}`,
              icon: '/icon-192.png',
            });
          }
        });
      }
      timers.delete(item.id!);
    }, timeUntilNotify);

    timers.set(item.id, timer);
    console.log(`✅ نوتیفیکیشن برای آیتم ${item.id} در ${oneDayBefore.toLocaleString()} برنامه‌ریزی شد.`);
  }
};

// لغو همه‌ی نوتیفیکیشن‌ها (در صورت نیاز)
export const clearAllNotifications = () => {
  for (const [id, timer] of timers) {
    clearTimeout(timer);
    timers.delete(id);
  }
  console.log('🧹 همه‌ی نوتیفیکیشن‌ها لغو شدند.');
};