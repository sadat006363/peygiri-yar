import { useState, useRef } from 'react';

export const useRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const isRecordingRef = useRef(false);

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

      // ✅ تنظیمات کیفیت صدا
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });

      console.log('✅ دسترسی به میکروفون گرفته شد.');
      setStream(mediaStream);

      // ✅ پاک کردن داده‌های قبلی
      setAudioBlob(null);
      chunksRef.current = [];

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

      const mediaRecorder = new MediaRecorder(mediaStream, options);
      mediaRecorderRef.current = mediaRecorder;
      console.log('📹 MediaRecorder ساخته شد.');

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
          console.log(`📦 تکه داده دریافت شد: ${e.data.size} بایت`);
        }
      };

      mediaRecorder.onstop = () => {
        console.log('⏹ ضبط متوقف شد. تعداد تکه‌ها:', chunksRef.current.length);

        if (chunksRef.current.length === 0) {
          console.warn('⚠️ هیچ داده‌ای دریافت نشد.');
          setIsRecording(false);
          isRecordingRef.current = false;
          mediaRecorderRef.current = null;
          return;
        }

        // ✅ ساخت Blob با MIME واقعی از MediaRecorder
        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: mimeType });
        console.log(`📦 حجم کل فایل صوتی: ${blob.size} بایت، MIME: ${mimeType}`);
        setAudioBlob(blob);

        // ✅ آزاد کردن stream فقط در onstop
        if (stream) {
          stream.getTracks().forEach((track) => {
            track.stop();
            console.log('🎤 یک ترک میکروفون آزاد شد.');
          });
          setStream(null);
        }

        setIsRecording(false);
        isRecordingRef.current = false;
        mediaRecorderRef.current = null;
        console.log('📊 isRecordingRef به false تنظیم شد.');
      };

      mediaRecorder.onerror = (event) => {
        console.error('❌ خطا در MediaRecorder:', event);
        setIsRecording(false);
        isRecordingRef.current = false;
        mediaRecorderRef.current = null;
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
          setStream(null);
        }
      };

      // ✅ شروع ضبط با timeslice 1000ms برای دریافت داده‌های منظم
      mediaRecorder.start(1000);
      isRecordingRef.current = true;
      setIsRecording(true);
      console.log('🔴 ضبط شروع شد.');

    } catch (error: any) {
      console.error('❌ خطا در دسترسی به میکروفون:', error);
      alert('❌ خطای میکروفون: ' + (error.message || 'خطای ناشناخته'));
      setIsRecording(false);
      isRecordingRef.current = false;
      setStream(null);
    }
  };

  const stopRecording = () => {
    console.log('⏹ stopRecording فراخوانی شد.');
    console.log(`📊 isRecording state: ${isRecording}`);
    console.log(`📊 isRecordingRef: ${isRecordingRef.current}`);

    try {
      if (mediaRecorderRef.current && isRecordingRef.current) {
        console.log('🛑 در حال توقف MediaRecorder...');
        mediaRecorderRef.current.stop();
        // stream در onstop آزاد می‌شود
      } else {
        console.warn('⚠️ ضبط در حال اجرا نیست یا MediaRecorder موجود نیست.');
        setIsRecording(false);
        isRecordingRef.current = false;
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
          setStream(null);
        }
      }
    } catch (error: any) {
      console.error('❌ خطا در stopRecording:', error);
      setIsRecording(false);
      isRecordingRef.current = false;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
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
    stream,
    startRecording,
    stopRecording,
    resetAudio,
    isRecordingRef,
  };
};