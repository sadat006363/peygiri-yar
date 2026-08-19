import { Item } from '@/lib/types';

const timers: Map<number, NodeJS.Timeout> = new Map();

export const scheduleNotification = (item: Item) => {
  if (!item.dueDate || !item.id) return;
  if (typeof window === 'undefined') return;

  // لغو تایمر قبلی
  if (timers.has(item.id)) {
    clearTimeout(timers.get(item.id));
    timers.delete(item.id);
  }

  const due = new Date(item.dueDate);
  const now = new Date();
  const timeUntilDue = due.getTime() - now.getTime();

  if (timeUntilDue <= 0) {
    // اگر موعد گذشته، یک بار فوری یادآوری کن
    sendNotification(item);
    return;
  }

  // محاسبه زمان یادآوری بر اساس فاصله
  let remindAt: Date;
  const oneDay = 24 * 60 * 60 * 1000;
  const oneHour = 60 * 60 * 1000;

  if (timeUntilDue < oneDay) {
    // کمتر از ۲۴ ساعت: ۳۰ دقیقه قبل
    remindAt = new Date(due.getTime() - 30 * 60 * 1000);
  } else if (timeUntilDue < 2 * oneDay) {
    // بین ۱ تا ۲ روز: یک روز قبل + صبح روز قبل
    remindAt = new Date(due);
    remindAt.setDate(due.getDate() - 1);
    remindAt.setHours(9, 0, 0, 0);
  } else {
    // بیشتر از ۲ روز: دو روز قبل
    remindAt = new Date(due);
    remindAt.setDate(due.getDate() - 2);
    remindAt.setHours(9, 0, 0, 0);
  }

  const timeUntilRemind = remindAt.getTime() - now.getTime();
  if (timeUntilRemind > 0) {
    const timer = setTimeout(() => {
      sendNotification(item);
      timers.delete(item.id!);
    }, timeUntilRemind);
    timers.set(item.id, timer);
    console.log(`✅ یادآوری برای آیتم ${item.id} در ${remindAt.toLocaleString()} برنامه‌ریزی شد.`);
  }
};

const sendNotification = (item: Item) => {
  if (Notification.permission === 'granted') {
    new Notification('⏰ پیگیری‌یار: یادآوری', {
      body: `📌 ${item.title}\n📅 موعد: ${item.dueDate}`,
      icon: '/icon-192.png',
    });
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
};

export const clearAllNotifications = () => {
  timers.forEach((timer, id) => {
    clearTimeout(timer);
    timers.delete(id);
  });
  console.log('🧹 همه‌ی نوتیفیکیشن‌ها لغو شدند.');
};