'use client';

import { useState, useEffect, useRef } from 'react';
import { useRecorder } from '@/hooks/useRecorder';
import { useItemStore } from '@/stores/itemStore';
import { Button } from '../ui/Button';

export const RecordButton = () => {
  const { isRecording, audioBlob, startRecording, stopRecording, resetAudio, isRecordingRef } = useRecorder();
  const [isProcessing, setIsProcessing] = useState(false);
  const { addItem } = useItemStore();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const timeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (timeIntervalRef.current) clearInterval(timeIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (isRecording) {
      setRecordingTime(0);
      timeIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timeIntervalRef.current) {
        clearInterval(timeIntervalRef.current);
        timeIntervalRef.current = null;
      }
    }
  }, [isRecording]);

  // ✅ تابع ساده و مطمئن برای کلیک روی دکمه
  const handleClick = () => {
    console.log('🖱️ دکمه کلیک شد.');
    console.log(`📊 isRecording: ${isRecording}`);
    console.log(`📊 isRecordingRef: ${isRecordingRef.current}`);

    // اگر در حال ضبط است، متوقف کن
    if (isRecording || isRecordingRef.current) {
      console.log('⏹ درخواست توقف ضبط (دستی)...');
      // لغو تایمر ایمنی
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      // توقف ضبط
      stopRecording();
      // بازخورد لمسی
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      return; // مهم: بعد از توقف، ادامه نده
    }

    // در غیر این صورت، شروع به ضبط کن
    console.log('🎤 درخواست شروع ضبط...');
    startRecording();

    // تنظیم تایمر ایمنی ۲ دقیقه‌ای
    timerRef.current = setTimeout(() => {
      console.log('⏰ تایمر ایمنی: توقف ضبط...');
      if (isRecordingRef.current) {
        stopRecording();
      }
      timerRef.current = null;
    }, 120000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSend = async () => {
    console.log('📤 دکمه "Save" کلیک شد.');

    if (!audioBlob) {
      console.warn('⚠️ audioBlob خالی است.');
      return;
    }

    // بررسی حجم فایل (کمتر از ۵۰۰۰ بایت = بدون صدا)
    if (audioBlob.size < 5000) {
      console.warn('⚠️ حجم فایل صوتی بسیار کم است.');
      alert('❌ No speech detected. Please record a voice message and try again.');
      resetAudio();
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
      alert('✅ Item successfully saved. Please review it in the "Pending Approval" section.');

    } catch (error: any) {
      console.error('❌ خطا:', error);
      alert('❌ Error: ' + (error.message || 'Something went wrong'));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <button
          onClick={handleClick}
          disabled={isProcessing}
          className={`w-24 h-24 rounded-full text-white text-4xl shadow-xl transition-all duration-300 ${
            isRecording
              ? 'bg-gradient-to-r from-red-500 to-pink-500 animate-pulse ring-4 ring-red-300'
              : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:scale-105 hover:shadow-2xl'
          }`}
        >
          {isRecording ? '⏹' : '🎙'}
        </button>

        {isRecording && (
          <div className="absolute -inset-2 rounded-full border-4 border-red-300/50 animate-ping"></div>
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

      {!isRecording && audioBlob && (
        <div className="flex gap-3 mt-2">
          <Button variant="secondary" onClick={resetAudio} disabled={isProcessing}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleSend} disabled={isProcessing}>
            {isProcessing ? '⏳ Processing...' : '✅ Save'}
          </Button>
        </div>
      )}
    </div>
  );
};