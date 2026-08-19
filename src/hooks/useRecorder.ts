import { useState, useRef } from 'react';

export const useRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const isRecordingRef = useRef(false);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = async () => {
    // ✅ جلوگیری از شروع مجدد ضبط
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

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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

        // ساخت فایل صوتی از تکه‌ها
        const blob = new Blob(chunksRef.current, { type: options.mimeType || 'audio/webm' });
        console.log(`📦 حجم کل فایل صوتی: ${blob.size} بایت`);
        setAudioBlob(blob);

        // ✅ آزادسازی stream پس از توقف کامل
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => {
            track.stop();
            console.log('🎤 یک ترک میکروفون آزاد شد.');
          });
          streamRef.current = null;
        }

        // ✅ به‌روزرسانی وضعیت‌ها
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
      // ✅ ابتدا ref را false می‌کنیم تا از اجرای مجدد جلوگیری شود
      isRecordingRef.current = false;

      if (mediaRecorderRef.current) {
        console.log(`📊 وضعیت MediaRecorder: ${mediaRecorderRef.current.state}`);

        if (mediaRecorderRef.current.state === 'recording') {
          console.log('🛑 در حال توقف MediaRecorder...');
          mediaRecorderRef.current.stop();
          // توجه: onstop به‌طور خودکار وضعیت‌ها را به‌روز می‌کند
        } else {
          console.warn('⚠️ MediaRecorder در حالت recording نیست، state:', mediaRecorderRef.current.state);
          // اگر در حالت inactive است، فقط state را به‌روز می‌کنیم
          setIsRecording(false);
        }
      } else {
        console.warn('⚠️ mediaRecorderRef وجود ندارد.');
        setIsRecording(false);
      }

      // ✅ آزادسازی stream اگر باقی مانده باشد (به‌عنوان پشتیبان)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        console.log('🎤 stream آزاد شد (پشتیبان).');
      }

    } catch (error: any) {
      console.error('❌ خطا در stopRecording:', error);
      // در صورت خطا، بازنشانی اجباری
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
  };
};