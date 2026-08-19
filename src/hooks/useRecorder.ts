import { useState, useRef } from 'react';

export const useRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    console.log('🎤 درخواست دسترسی به میکروفون...');

    try {
      // بررسی وجود مرورگر و API مورد نیاز
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('❌ مرورگر از getUserMedia پشتیبانی نمی‌کند.');
        alert('مرورگر شما از میکروفون پشتیبانی نمی‌کند. لطفاً از مرورگر جدیدتر استفاده کنید.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('✅ دسترسی به میکروفون گرفته شد.');

      // تشخیص فرمت مناسب برای مرورگر
      let options: MediaRecorderOptions = {};
      if (MediaRecorder.isTypeSupported('audio/mp4')) {
        options = { mimeType: 'audio/mp4' };
        console.log('📀 فرمت انتخاب شده: audio/mp4');
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        options = { mimeType: 'audio/webm' };
        console.log('📀 فرمت انتخاب شده: audio/webm');
      } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
        options = { mimeType: 'audio/ogg' };
        console.log('📀 فرمت انتخاب شده: audio/ogg');
      } else {
        console.warn('⚠️ هیچ فرمت پشتیبانی‌شده‌ای پیدا نشد، از پیش‌فرض استفاده می‌شود.');
        options = {};
      }

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      console.log('📹 MediaRecorder ساخته شد:', mediaRecorder);

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
          console.log(`📦 تکه داده دریافت شد: ${e.data.size} بایت`);
        } else {
          console.warn('⚠️ تکه داده خالی دریافت شد.');
        }
      };

      mediaRecorder.onstop = () => {
        console.log('⏹ ضبط متوقف شد. تعداد تکه‌ها:', chunksRef.current.length);
        const blob = new Blob(chunksRef.current, { type: options.mimeType || 'audio/webm' });
        console.log(`📦 حجم کل فایل صوتی: ${blob.size} بایت`);
        setAudioBlob(blob);

        // آزاد کردن میکروفون
        stream.getTracks().forEach(track => {
          track.stop();
          console.log('🎤 یک ترک میکروفون آزاد شد.');
        });
        console.log('✅ تمام ترک‌های میکروفون آزاد شدند.');
      };

      mediaRecorder.onerror = (event) => {
        console.error('❌ خطا در MediaRecorder:', event);
      };

      mediaRecorder.start();
      setIsRecording(true);
      console.log('🔴 ضبط شروع شد.');

    } catch (error: any) {
      console.error('❌ خطا در دسترسی به میکروفون:', error);

      // نمایش پیام خطای مناسب به کاربر
      if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        alert('❌ هیچ میکروفونی پیدا نشد. لطفاً یک میکروفون وصل کنید و دوباره امتحان کنید.');
      } else if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        alert('❌ دسترسی به میکروفون مسدود شده است. لطفاً در تنظیمات مرورگر اجازه‌ی دسترسی را بدهید.');
      } else if (error.name === 'NotSupportedError') {
        alert('❌ مرورگر شما از ضبط صدا پشتیبانی نمی‌کند. لطفاً از مرورگر جدیدتر استفاده کنید.');
      } else {
        alert('❌ خطای میکروفون: ' + (error.message || 'خطای ناشناخته'));
      }
    }
  };

  const stopRecording = () => {
    console.log('⏹ توقف ضبط درخواست شد.');
    console.log(`📊 وضعیت فعلی isRecording: ${isRecording}`);
    console.log(`📊 mediaRecorderRef.current: ${mediaRecorderRef.current ? 'وجود دارد' : 'وجود ندارد'}`);

    if (mediaRecorderRef.current && isRecording) {
      console.log('🛑 در حال توقف MediaRecorder...');
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      console.log('✅ ضبط با موفقیت متوقف شد. isRecording = false');
    } else {
      console.warn('⚠️ ضبط در حال اجرا نیست یا MediaRecorder موجود نیست.');
      console.warn(`   - isRecording: ${isRecording}`);
      console.warn(`   - mediaRecorderRef: ${mediaRecorderRef.current ? 'موجود' : 'ناموجود'}`);
    }
  };

  const resetAudio = () => {
    console.log('🔄 بازنشانی (Reset) فایل صوتی درخواست شد.');
    setAudioBlob(null);
    chunksRef.current = [];
    console.log('✅ فایل صوتی بازنشانی شد.');
  };

  return {
    isRecording,
    audioBlob,
    startRecording,
    stopRecording,
    resetAudio,
  };
};