'use client';

import { useState, useEffect, useRef } from 'react';
import { useRecorder } from '@/hooks/useRecorder';
import { useAudioLevel } from '@/hooks/useAudioLevel';
import { useItemStore } from '@/stores/itemStore';
import { RecordingGuide } from './RecordingGuide';

export const RecordButton = () => {
  const { isRecording, audioBlob, startRecording, stopRecording, resetAudio, isRecordingRef, stream } = useRecorder();
  const audioLevel = useAudioLevel(isRecording ? stream : null);
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
        console.log('⏰ توقف خودکار پس از ۶۰ ثانیه...');
        if (isRecordingRef.current) {
          stopRecording();
        }
        timerRef.current = null;
      }, 60000);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getLevelColor = (level: number) => {
    if (level < 0.3) return 'bg-gray-300';
    if (level < 0.6) return 'bg-yellow-400';
    if (level < 0.8) return 'bg-green-500';
    return 'bg-red-500';
  };

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

      console.log('📊 دریافت اصلاحات پرکاربرد...');
      let userCorrections: any[] = [];
      try {
        const memoryRes = await fetch('/api/correction-memory/most-used?limit=20');
        if (memoryRes.ok) {
          const memoryData = await memoryRes.json();
          userCorrections = memoryData.data || [];
          console.log(`✅ ${userCorrections.length} اصلاحات پرکاربرد دریافت شد.`);
        }
      } catch (error: any) {
        console.warn('⚠️ خطا در دریافت اصلاحات پرکاربرد:', error.message);
      }

      console.log('📤 مرحله 2: ارسال متن به /api/correct برای اصلاح...');
      
      const correctionPayload = {
        text: rawText,
        knownPeople: ['علی رضایی', 'رضا موسوی', 'سارا احمدی'],
        knownProjects: ['PromptYar', 'Zbloue', 'Direct2Chat'],
        knownTerms: ['Whisper', 'Next.js', 'Supabase'],
        userCorrections: userCorrections.map((c: any) => ({
          original: c.originalText,
          corrected: c.correctedText,
        })),
      };

      console.log('📦 داده‌های ارسالی به correction:', {
        ...correctionPayload,
        userCorrections: correctionPayload.userCorrections.slice(0, 5),
      });

      let correctedText = rawText;
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

          correctedText = correctData.correctedText || rawText;
          correctionChanges = correctData.changes || [];
          needsConfirmation = correctData.needsConfirmation !== false;
          
          if (correctionChanges.length > 0) {
            const totalConfidence = correctionChanges.reduce((sum: number, c: any) => sum + (c.confidence || 0.5), 0);
            confidence = Math.min(totalConfidence / correctionChanges.length, 1.0);
          }
          
          console.log('✅ متن اصلاح‌شده نهایی:', correctedText);
          console.log(`📊 تعداد اصلاحات: ${correctionChanges.length}`);
          console.log(`📊 اطمینان متوسط: ${confidence.toFixed(2)}`);
        }
      } catch (error: any) {
        console.warn('⚠️ خطا در فراخوانی correction API:', error.message);
      }

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

      console.log('📤 مرحله 4: ذخیره آیتم در دیتابیس...');
      await addItem({
        rawText: rawText,
        correctedText: correctedText,
        rawTranscript: rawText,
        correctedTranscript: correctedText,
        correctionStatus: correctionChanges.length > 0 ? 'ai_corrected' : 'none',
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
      console.error('❌ خطای کلی در handleSend:', error.message);
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
      <RecordingGuide />
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
        <div className="text-center w-full max-w-xs">
          <p className="text-sm text-red-500 font-medium">⚫ Recording... (tap to stop)</p>
          <p className="text-xs text-gray-400 mt-1">
            ⏱️ {formatTime(recordingTime)} / max 1:00
          </p>
          <div className="mt-2 w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-100 ${getLevelColor(audioLevel)}`}
              style={{ width: `${audioLevel * 100}%` }}
            />
          </div>
          <p className="text-[10px] text-gray-400 mt-0.5">
            {audioLevel < 0.3 && '🔇 Speak louder or move closer'}
            {audioLevel >= 0.3 && audioLevel < 0.6 && '🔊 Good volume'}
            {audioLevel >= 0.6 && audioLevel < 0.8 && '🎤 Great quality'}
            {audioLevel >= 0.8 && '📢 Too loud! Move away slightly'}
          </p>
        </div>
      )}
    </div>
  );
};