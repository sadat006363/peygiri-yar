'use client';

import { useState, useEffect, useRef } from 'react';
import { useRecorder } from '@/hooks/useRecorder';
import { useItemStore } from '@/stores/itemStore';
import { Button } from '../ui/Button';

export const RecordButton = () => {
  const { isRecording, audioBlob, startRecording, stopRecording, resetAudio, isRecordingRef } = useRecorder();
  const [isProcessing, setIsProcessing] = useState(false);
  const { addItem } = useItemStore();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const timeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isProcessingRef = useRef(false); // ✅ برای جلوگیری از اجرای هم‌زمان

  // پاک کردن تایمرها هنگام unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (timeIntervalRef.current) clearInterval(timeIntervalRef.current);
    };
  }, []);

  // مدیریت تایمر زمان ضبط (شمارنده)
  useEffect(() => {
    if (isRecording) {
      setRecordingTime(0);
      timeIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timeIntervalRef.current) {
        clearInterval(timeIntervalRef.current);
        timeIntervalRef.current = null;
      }
    }
  }, [isRecording]);

  // ✅ پردازش خودکار بعد از توقف ضبط
  useEffect(() => {
    // اگر ضبط متوقف شده، فایل صوتی وجود دارد، و در حال پردازش نیستیم
    if (!isRecording && audioBlob && !isProcessingRef.current) {
      console.log('🔄 پردازش خودکار شروع شد...');
      isProcessingRef.current = true;
      handleSend();
    }
  }, [isRecording, audioBlob]);

  // تابع handleClick برای شروع/توقف ضبط
  const handleClick = async () => {
    console.log('🖱️ دکمه کلیک شد.');
    console.log(`📊 isRecording: ${isRecording}`);
    console.log(`📊 isRecordingRef: ${isRecordingRef.current}`);

    if (isRecordingRef.current) {
      console.log('⏹ توقف دستی ضبط...');
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      stopRecording();
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      return;
    }

    console.log('🎤 شروع ضبط...');
    await startRecording();

    if (isRecordingRef.current) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      timerRef.current = setTimeout(() => {
        console.log('⏰ توقف خودکار پس از دو دقیقه...');
        if (isRecordingRef.current) {
          stopRecording();
        }
        timerRef.current = null;
      }, 120000);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // تابع handleSend (با تغییرات جزئی برای مدیریت isProcessingRef)
  const handleSend = async () => {
    console.log('📤 handleSend فراخوانی شد.');

    if (!audioBlob) {
      console.warn('⚠️ audioBlob خالی است.');
      isProcessingRef.current = false;
      return;
    }

    // بررسی حجم فایل (کمتر از ۵۰۰۰ بایت = بدون صدا)
    if (audioBlob.size < 5000) {
      console.warn('⚠️ حجم فایل صوتی بسیار کم است.');
      alert('❌ No speech detected. Please record a voice message and try again.');
      resetAudio();
      isProcessingRef.current = false;
      return;
    }

    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.webm');

      const transcribeRes = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!transcribeRes.ok) {
        const errorText = await transcribeRes.text();
        throw new Error(errorText || 'Transcription failed');
      }

      const transcribeData = await transcribeRes.json();
      const rawText = transcribeData.text;

      if (rawText.trim().length < 2) {
        alert('❌ No clear speech detected. Please speak clearly and try again.');
        resetAudio();
        setIsProcessing(false);
        isProcessingRef.current = false;
        return;
      }

      const structureRes = await fetch('/api/structure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: rawText }),
      });

      if (!structureRes.ok) {
        const errorText = await structureRes.text();
        throw new Error(errorText || 'Structuring failed');
      }

      const structuredData = await structureRes.json();

      await addItem({
        rawText,
        category: structuredData.category || 'idea',
        title: structuredData.title || 'Untitled',
        description: structuredData.description || rawText,
      });

      resetAudio();
      console.log('✅ آیتم با موفقیت ذخیره شد.');
      // پیام موفقیت (اختیاری - می‌توانید حذف کنید)
      // alert('✅ Item saved. Please review in Pending Approval.');

    } catch (error: any) {
      console.error('❌ خطا:', error);
      alert('❌ Error: ' + (error.message || 'Something went wrong'));
      resetAudio();
    } finally {
      setIsProcessing(false);
      isProcessingRef.current = false;
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <button
          type="button"
          onClick={handleClick}
          disabled={isProcessing}
          className={`relative z-10 w-24 h-24 rounded-full text-white text-4xl shadow-xl transition-all duration-300 ${
            isRecording
              ? 'bg-gradient-to-r from-red-500 to-pink-500 animate-pulse ring-4 ring-red-300'
              : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:scale-105 hover:shadow-2xl'
          }`}
        >
          {isRecording ? '⏹' : '🎙'}
        </button>

        {isRecording && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-2 rounded-full border-4 border-red-300/50 animate-ping"
          />
        )}
      </div>

      {isRecording && (
        <div className="text-center">
          <p className="text-sm text-red-500 font-medium">⚫ Recording... (tap to stop)</p>
          <p className="text-xs text-gray-400 mt-1">
            ⏱️ {formatTime(recordingTime)} / max 2:00
          </p>
        </div>
      )}

      {/* ❌ دکمه‌های Save و Cancel حذف شدند */}
    </div>
  );
};