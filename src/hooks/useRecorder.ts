import { useState, useRef } from 'react';

export const useRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    console.log('🎤 درخواست دسترسی به میکروفون...');

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('❌ مرورگر از getUserMedia پشتیبانی نمی‌کند.');
        alert('مرورگر شما از میکروفون پشتیبانی نمی‌کند. لطفاً از مرورگر جدیدتر استفاده کنید.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('✅ دسترسی به میکروفون گرفته شد.');

      let options: MediaRecorderOptions = {};
      if (MediaRecorder.isTypeSupported('audio/mp4')) {
        options = { mimeType: 'audio/mp4' };
        console.log('📀 فرمت انتخاب شده: audio/mp4');
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        options = { mimeType: 'audio/webm' };
        console.log('📀 فرمت انتخاب شده: audio/webm');
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
      alert('❌ خطای میکروفون: ' + (error.message || 'خطای ناشناخته'));
    }
  };

  const stopRecording = () => {
    console.log('⏹ stopRecording فراخوانی شد.');
    console.log(`📊 isRecording: ${isRecording}`);
    console.log(`📊 mediaRecorderRef.current: ${mediaRecorderRef.current ? 'موجود' : 'ناموجود'}`);

    try {
      if (mediaRecorderRef.current) {
        console.log(`📊 وضعیت MediaRecorder: ${mediaRecorderRef.current.state}`);
      }

      if (mediaRecorderRef.current && isRecording) {
        console.log('🛑 در حال توقف MediaRecorder...');
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        console.log('✅ ضبط با موفقیت متوقف شد.');
      } else {
        console.warn('⚠️ ضبط در حال اجرا نیست یا MediaRecorder موجود نیست.');
        // اگر isRecording true است ولی mediaRecorder وجود ندارد، بازنشانی کن
        if (isRecording && !mediaRecorderRef.current) {
          console.warn('⚠️ وضعیت ناهماهنگ: isRecording=true ولی mediaRecorder وجود ندارد. بازنشانی...');
          setIsRecording(false);
        }
      }
    } catch (error: any) {
      console.error('❌ خطا در stopRecording:', error);
      setIsRecording(false);
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