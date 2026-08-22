import { Item } from '@/lib/types';

const timers: Map<number, NodeJS.Timeout> = new Map();

export const scheduleNotification = (item: Item) => {
  if (!item.id) return;
  if (typeof window === 'undefined') return;

  // لغو تایمر قبلی
  if (timers.has(item.id)) {
    clearTimeout(timers.get(item.id));
    timers.delete(item.id);
  }

  const now = new Date();

  // ✅ یادآوری بر اساس نوع آیتم
  const reminderTime = getReminderTime(item);
  if (!reminderTime) return;

  const timeUntilRemind = reminderTime.getTime() - now.getTime();
  if (timeUntilRemind > 0) {
    const timer = setTimeout(() => {
      sendNotification(item);
      timers.delete(item.id!);
    }, timeUntilRemind);
    timers.set(item.id, timer);
    console.log(`✅ یادآوری برای آیتم ${item.id} در ${reminderTime.toLocaleString()} برنامه‌ریزی شد.`);
  }
};

function getReminderTime(item: Item): Date | null {
  const now = new Date();
  const dueDate = item.dueDate ? new Date(item.dueDate) : null;

  switch (item.category) {
    case 'task':
      // تسک: یک روز قبل از موعد
      if (dueDate) {
        const reminder = new Date(dueDate);
        reminder.setDate(dueDate.getDate() - 1);
        reminder.setHours(9, 0, 0, 0);
        return reminder;
      }
      return null;

    case 'customer':
      // مشتری: یک روز قبل + صبح روز موعد
      if (dueDate) {
        const reminder1 = new Date(dueDate);
        reminder1.setDate(dueDate.getDate() - 1);
        reminder1.setHours(9, 0, 0, 0);
        return reminder1;
      }
      return null;

    case 'cost':
      // هزینه: بدون یادآوری فوری (فقط در خلاصه)
      return null;

    case 'idea':
      // ایده: بدون یادآوری
      return null;

    default:
      return null;
  }
}

function sendNotification(item: Item) {
  if (Notification.permission === 'granted') {
    let body = `📌 ${item.title}`;
    if (item.dueDate) {
      body += `\n📅 Due: ${item.dueDate}`;
    }
    if (item.person) {
      body += `\n👤 Person: ${item.person}`;
    }
    if (item.waitingFor) {
      body += `\n⏳ Waiting: ${item.waitingFor}`;
    }
    new Notification('⏰ پیگیری‌یار: یادآوری', {
      body: body,
      icon: '/icon-192.png',
    });
  } else if (Notification.permission === 'default') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        sendNotification(item);
      }
    });
  }
}

export const clearAllNotifications = () => {
  timers.forEach((timer, id) => {
    clearTimeout(timer);
    timers.delete(id);
  });
  console.log('🧹 همه‌ی نوتیفیکیشن‌ها لغو شدند.');
};