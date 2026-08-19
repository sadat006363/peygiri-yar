import type { Metadata } from 'next';
import './globals.css';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Peygiri Yar - Voice Assistant',
  description: 'Record tasks, customer follow-ups, costs and ideas with one tap',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Peygiri Yar',
  },
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  // ✅ درخواست مجوز نوتیفیکیشن هنگام بارگذاری
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('🔔 مجوز نوتیفیکیشن:', permission);
      });
    }
  }

  return (
    <html lang="en" dir="ltr">
      <body className="antialiased">{children}</body>
    </html>
  );
}