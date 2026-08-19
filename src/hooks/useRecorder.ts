import { useState, useRef } from 'react';

export const useRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const isRecordingRef = useRef(false);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = async () => {
    if (isRecordingRef.current) {
      console.log('⚠️ ضبط در حال اجراست، شروع مجدد غیرممکن است.');
      return;
    }

    console.log('🎤 درخواست دسترسی به میکروفون...');

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('❌ مرورگر از getUserMedia پشتیبانی نمی‌کند.');
        alert('مرورگر شما از میکروفون پشتیبانی نمی‌کند.');
        return;
      }

      // ✅ تنظیمات کیفیت صدا برای ضبط با کیفیت بهتر
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,        // نرخ نمونه‌برداری ۱۶ کیلوهرتز (مناسب برای گفتار)
          channelCount: 1,          // مونو (یک کانال)
          echoCancellation: true,   // حذف پژواک
          noiseSuppression: true,   // کاهش نویز پس‌زمینه
          autoGainControl: true,    // تنظیم خودکار بهره (حجم صدا)
        }
      });
      
      console.log('✅ دسترسی به میکروفون گرفته شد.');
      streamRef.current = stream;

      let options: MediaRecorderOptions = {};
      if (MediaRecorder.isTypeSupported('audio/mp4')) {
        options = { mimeType: 'audio/mp4' };
        console.log('📀 فرمت انتخاب شده: audio/mp4');
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        options = { mimeType: 'audio/webm' };
        console.log('📀 فرمت انتخاب شده: audio/webm');
      } else {
        console.warn('⚠️ هیچ فرمت پشتیبانی‌شده‌ای پیدا نشد.');
        options = {};
      }

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
          console.log(`📦 تکه داده دریافت شد: ${e.data.size} بایت`);
        }
      };

      mediaRecorder.onstop = () => {
        console.log('⏹ ضبط متوقف شد. تعداد تکه‌ها:', chunksRef.current.length);
        const blob = new Blob(chunksRef.current, { type: options.mimeType || 'audio/webm' });
        console.log(`📦 حجم کل فایل صوتی: ${blob.size} بایت`);
        setAudioBlob(blob);

        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => {
            track.stop();
            console.log('🎤 یک ترک میکروفون آزاد شد.');
          });
          streamRef.current = null;
        }

        isRecordingRef.current = false;
        setIsRecording(false);
        console.log('📊 isRecordingRef به false تنظیم شد.');
      };

      mediaRecorder.onerror = (event) => {
        console.error('❌ خطا در MediaRecorder:', event);
      };

      mediaRecorder.start();
      isRecordingRef.current = true;
      setIsRecording(true);
      console.log('🔴 ضبط شروع شد.');

    } catch (error: any) {
      console.error('❌ خطا در دسترسی به میکروفون:', error);
      alert('❌ خطای میکروفون: ' + (error.message || 'خطای ناشناخته'));
    }
  };

  const stopRecording = () => {
    console.log('⏹ stopRecording فراخوانی شد.');
    console.log(`📊 isRecording state: ${isRecording}`);
    console.log(`📊 isRecordingRef: ${isRecordingRef.current}`);

    try {
      isRecordingRef.current = false;

      if (mediaRecorderRef.current) {
        console.log(`📊 وضعیت MediaRecorder: ${mediaRecorderRef.current.state}`);
        if (mediaRecorderRef.current.state === 'recording') {
          console.log('🛑 در حال توقف MediaRecorder...');
          mediaRecorderRef.current.stop();
        } else {
          console.warn('⚠️ MediaRecorder در حالت recording نیست، state:', mediaRecorderRef.current.state);
          setIsRecording(false);
        }
      } else {
        console.warn('⚠️ mediaRecorderRef وجود ندارد.');
        setIsRecording(false);
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        console.log('🎤 stream آزاد شد (پشتیبان).');
      }

    } catch (error: any) {
      console.error('❌ خطا در stopRecording:', error);
      setIsRecording(false);
      isRecordingRef.current = false;
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
    isRecordingRef,
    stream: streamRef.current, // ✅ خروجی stream برای متر صدا
  };
};