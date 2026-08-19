'use client';

import { useState, useEffect, useRef } from 'react';
import { useRecorder } from '@/hooks/useRecorder';
import { useItemStore } from '@/stores/itemStore';

export const RecordButton = () => {
  const { isRecording, audioBlob, startRecording, stopRecording, resetAudio, isRecordingRef } = useRecorder();
  const [isProcessing, setIsProcessing] = useState(false);
  const { addItem } = useItemStore();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const timeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isProcessingRef = useRef(false);

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
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timeIntervalRef.current) {
        clearInterval(timeIntervalRef.current);
        timeIntervalRef.current = null;
      }
    }
  }, [isRecording]);

  useEffect(() => {
    if (!isRecording && audioBlob && !isProcessingRef.current) {
      console.log('🔄 پردازش خودکار شروع شد...');
      isProcessingRef.current = true;
      handleSend();
    }
  }, [isRecording, audioBlob]);

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

  // ============= تابع جستجو در حافظه‌ی اصلاحات =============
  const searchCorrectionMemory = async (text: string): Promise<{ 
    found: boolean; 
    corrections: any[]; 
    suggestion?: string;
  }> => {
    try {
      console.log('🔍 جستجو در حافظه‌ی اصلاحات...');
      const res = await fetch('/api/correction-memory/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      
      if (!res.ok) {
        console.warn('⚠️ خطا در جستجوی حافظه');
        return { found: false, corrections: [] };
      }
      
      const data = await res.json();
      console.log('✅ نتیجه جستجو:', data);
      return data;
    } catch (error) {
      console.warn('⚠️ خطا در جستجوی حافظه:', error);
      return { found: false, corrections: [] };
    }
  };

  // ============= تابع اصلی handleSend =============
  const handleSend = async () => {
    console.log('📤 handleSend فراخوانی شد.');

    if (!audioBlob) {
      console.warn('⚠️ audioBlob خالی است.');
      isProcessingRef.current = false;
      return;
    }

    if (audioBlob.size < 5000) {
      console.warn('⚠️ حجم فایل صوتی بسیار کم است.');
      alert('❌ No speech detected. Please record a voice message and try again.');
      resetAudio();
      isProcessingRef.current = false;
      return;
    }

    setIsProcessing(true);

    try {
      // =====================================================
      // مرحله 1: تبدیل صدا به متن با Whisper
      // =====================================================
      console.log('📤 مرحله 1: ارسال فایل صوتی به /api/transcribe...');
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.webm');

      const transcribeRes = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      console.log(`📥 پاسخ /api/transcribe: status ${transcribeRes.status}`);

      if (!transcribeRes.ok) {
        const errorText = await transcribeRes.text();
        console.error('❌ خطا در transcribe:', errorText);
        throw new Error(errorText || 'Transcription failed');
      }

      const transcribeData = await transcribeRes.json();
      const rawText = transcribeData.text;
      console.log('✅ متن خام از Whisper:', rawText);

      if (rawText.trim().length < 2) {
        alert('❌ No clear speech detected. Please speak clearly and try again.');
        resetAudio();
        setIsProcessing(false);
        isProcessingRef.current = false;
        return;
      }

      // =====================================================
      // مرحله 1.5: جستجو در حافظه‌ی اصلاحات (✅ جدید)
      // =====================================================
      const memoryResult = await searchCorrectionMemory(rawText);
      let correctedText = rawText;
      let memoryChanges: any[] = [];

      if (memoryResult.found && memoryResult.corrections.length > 0) {
        console.log('✅ کلمه/عبارت در حافظه پیدا شد:', memoryResult.corrections);
        
        // اعمال اصلاحات از حافظه روی متن
        let tempText = rawText;
        for (const mem of memoryResult.corrections) {
          // بررسی اینکه آیا کلمه در متن وجود دارد
          if (tempText.includes(mem.originalText)) {
            tempText = tempText.replaceAll(mem.originalText, mem.correctedText);
            memoryChanges.push({
              original: mem.originalText,
              corrected: mem.correctedText,
              reason: 'از حافظه‌ی اصلاحات کاربر',
              confidence: 0.95,
              fromMemory: true,
            });
            console.log(`🔄 اصلاح از حافظه: "${mem.originalText}" → "${mem.correctedText}"`);
          }
        }
        
        // اگر تغییری اعمال شد، متن را به‌روز می‌کنیم
        if (memoryChanges.length > 0) {
          correctedText = tempText;
        }
      }

      // =====================================================
      // مرحله 2: اصلاح متن با GPT (با استفاده از اصلاحات حافظه)
      // =====================================================
      console.log('📤 مرحله 2: ارسال متن به /api/correct برای اصلاح...');
      
      // اگر از حافظه اصلاح شده، به GPT هم می‌فرستیم برای اصلاحات بیشتر
      const correctionPayload = {
        text: correctedText,
        knownPeople: ['علی رضایی', 'رضا موسوی', 'سارا احمدی'],
        knownProjects: ['PromptYar', 'Zbloue', 'Direct2Chat'],
        knownTerms: ['Whisper', 'Next.js', 'Supabase'],
        // اضافه کردن اصلاحات حافظه به عنوان context
        memoryCorrections: memoryChanges.map(c => ({
          original: c.original,
          corrected: c.corrected,
        })),
      };
      console.log('📦 داده‌های ارسالی به correction:', correctionPayload);

      let gptCorrectedText = correctedText;
      let correctionChanges: any[] = [];
      let needsConfirmation = false;
      let confidence = 1.0;

      try {
        const correctRes = await fetch('/api/correct', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(correctionPayload),
        });

        console.log(`📥 پاسخ /api/correct: status ${correctRes.status}`);

        if (!correctRes.ok) {
          const errorText = await correctRes.text();
          console.warn('⚠️ خطا در اصلاح متن:', errorText);
        } else {
          const correctData = await correctRes.json();
          console.log('✅ داده‌های اصلاح‌شده:', correctData);

          // ترکیب اصلاحات حافظه و اصلاحات GPT
          gptCorrectedText = correctData.correctedText || correctedText;
          correctionChanges = correctData.changes || [];
          needsConfirmation = correctData.needsConfirmation !== false;
          
          // محاسبه‌ی میانگین confidence
          const allChanges = [...memoryChanges, ...correctionChanges];
          if (allChanges.length > 0) {
            const totalConfidence = allChanges.reduce((sum: number, c: any) => sum + (c.confidence || 0.5), 0);
            confidence = Math.min(totalConfidence / allChanges.length, 1.0);
          }
          
          // اگر GPT اصلاحات بیشتری داشت، متن نهایی را از GPT بگیریم
          if (correctionChanges.length > 0) {
            correctedText = gptCorrectedText;
          }
          
          console.log('✅ متن اصلاح‌شده نهایی:', correctedText);
          console.log(`📊 تعداد کل اصلاحات: ${allChanges.length}`);
          console.log(`📊 اطمینان متوسط: ${confidence.toFixed(2)}`);
        }
      } catch (error: any) {
        console.warn('⚠️ خطا در فراخوانی correction API:', error.message);
      }

      // =====================================================
      // مرحله 3: ساختاردهی با GPT
      // =====================================================
      console.log('📤 مرحله 3: ارسال متن به /api/structure...');
      const structureRes = await fetch('/api/structure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: correctedText }),
      });

      console.log(`📥 پاسخ /api/structure: status ${structureRes.status}`);

      if (!structureRes.ok) {
        const errorText = await structureRes.text();
        console.error('❌ خطا در structure:', errorText);
        throw new Error(errorText || 'Structuring failed');
      }

      const structuredData = await structureRes.json();
      console.log('✅ داده ساختاردهی‌شده:', structuredData);

      // =====================================================
      // مرحله 4: ذخیره‌سازی در دیتابیس
      // =====================================================
      console.log('📤 مرحله 4: ذخیره آیتم در دیتابیس...');
      await addItem({
        rawText: rawText,
        correctedText: correctedText,
        rawTranscript: rawText,
        correctedTranscript: correctedText,
        correctionStatus: (memoryChanges.length > 0 || correctionChanges.length > 0) ? 'ai_corrected' : 'none',
        confidence: confidence,
        category: structuredData.category || 'idea',
        title: structuredData.title || 'Untitled',
        description: structuredData.description || correctedText,
        priority: structuredData.priority || 'medium',
        dueDate: structuredData.dueDate || null,
      });

      console.log('✅ آیتم با موفقیت ذخیره شد.');
      resetAudio();

    } catch (error: any) {
      console.error('❌ خطای کلی در handleSend:', error);
      alert('❌ Error: ' + (error.message || 'Something went wrong'));
      resetAudio();
    } finally {
      setIsProcessing(false);
      isProcessingRef.current = false;
      console.log('✅ پردازش به پایان رسید.');
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
    </div>
  );
};