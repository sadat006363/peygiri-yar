import { useState, useRef } from 'react';

export const useRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      console.log("🎤 درخواست دسترسی به میکروفون...");
      
      // بررسی وجود getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error("❌ getUserMedia پشتیبانی نمی‌شود!");
        alert('Microphone is not available. Please use HTTPS or localhost.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("✅ دسترسی به میکروفون گرفته شد.");

      // تشخیص فرمت مناسب
      let options: MediaRecorderOptions = {};
      if (MediaRecorder.isTypeSupported('audio/mp4')) {
        options = { mimeType: 'audio/mp4' };
        console.log("📀 فرمت انتخاب شده: audio/mp4");
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        options = { mimeType: 'audio/webm' };
        console.log("📀 فرمت انتخاب شده: audio/webm");
      } else {
        console.log("📀 فرمت پیش‌فرض استفاده می‌شود");
      }

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      // رویداد دریافت داده
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          console.log(`📦 تکه داده دریافت شد: ${e.data.size} بایت`);
          chunksRef.current.push(e.data);
        } else {
          console.warn("⚠️ تکه داده خالی دریافت شد!");
        }
      };

      // رویداد پایان ضبط
      mediaRecorder.onstop = () => {
        console.log(`⏹ ضبط متوقف شد. تعداد تکه‌ها: ${chunksRef.current.length}`);
        if (chunksRef.current.length === 0) {
          console.error("❌ هیچ داده‌ای ضبط نشد!");
          alert('No audio data was recorded. Please check your microphone.');
          return;
        }
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        console.log(`📁 فایل صوتی ساخته شد: ${blob.size} بایت`);
        setAudioBlob(blob);
        
        // آزاد کردن استریم
        stream.getTracks().forEach(track => {
          track.stop();
          console.log("🔇 ترک میکروفون آزاد شد");
        });
      };

      // شروع ضبط
      mediaRecorder.start(1000); // هر ۱ ثانیه یک تکه داده بگیر
      setIsRecording(true);
      console.log("🔴 ضبط شروع شد.");

    } catch (error: any) {
      console.error("❌ خطا در دسترسی به میکروفون:", error);
      if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        alert('No microphone found. Please connect a microphone and try again.');
      } else if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        alert('Microphone access blocked. Please allow access in browser settings.');
      } else {
        alert('Microphone error: ' + (error.message || 'Unknown error'));
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      console.log("⏹ درخواست توقف ضبط...");
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    } else {
      console.warn("⚠️ تلاش برای توقف ضبط در حالی که در حال ضبط نیستیم!");
    }
  };

  const resetAudio = () => {
    console.log("🔄 ریست فایل صوتی");
    setAudioBlob(null);
    chunksRef.current = [];
  };

  return {
    isRecording,
    audioBlob,
    startRecording,
    stopRecording,
    resetAudio,
  };
};