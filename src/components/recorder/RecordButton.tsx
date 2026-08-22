'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MicrophoneIcon, StopIcon } from '@heroicons/react/24/solid';
import { useRecorder } from '@/hooks/useRecorder';
import { useAudioLevel } from '@/hooks/useAudioLevel';
import { useItemStore } from '@/stores/itemStore';
import { RecordingGuide } from './RecordingGuide';

export const RecordButton = () => {
  const { isRecording, audioBlob, stream, startRecording, stopRecording, resetAudio, isRecordingRef } = useRecorder();
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
    if (isRecording || !audioBlob || isProcessingRef.current) return;

    console.log('🔄 پردازش خودکار شروع شد...');
    isProcessingRef.current = true;
    handleSend();
  }, [isRecording, audioBlob]);

  const handleClick = async () => {
    console.log('🖱️ دکمه کلیک شد.');
    console.log(`📊 isRecording: ${isRecording}`);
    console.log(`📊 isRecordingRef: ${isRecordingRef.current}`);

    if (isRecording || isRecordingRef.current) {
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

  const isNoise = (text: string): boolean => {
    const trimmed = text.trim().toLowerCase();
    if (trimmed.length < 5) return true;
    const noisePhrases = [
      'thank you for watching',
      'thanks for watching',
      'hello',
      'hi',
      'test',
      'testing',
      'speak clearly',
      'please speak',
    ];
    for (const phrase of noisePhrases) {
      if (trimmed.includes(phrase)) return true;
    }
    return false;
  };

  // ✅ نسخه‌ی ساده‌شده‌ی ذخیره‌سازی برای MVP
  const saveItem = async (itemData: any) => {
    const status: 'pending' = 'pending';
    console.log('📤 ذخیره آیتم با وضعیت:', status);

    await addItem({
      rawText: itemData.description || '',
      correctedText: itemData.description || '',
      rawTranscript: itemData.description || '',
      correctedTranscript: itemData.description || '',
      correctionStatus: 'none',
      confidence: 0.9,
      category: 'idea', // همه با دسته‌ی 'idea' ذخیره می‌شوند
      title: itemData.title || 'Untitled',
      description: itemData.description || '',
      priority: 'medium', // مقدار پیش‌فرض
      dueDate: itemData.dueDate || undefined,
      status: status,
    });
  };

  const handleSend = async () => {
    console.log('📤 handleSend فراخوانی شد.');

    if (!audioBlob) {
      console.warn('⚠️ audioBlob خالی است.');
      isProcessingRef.current = false;
      return;
    }

    console.log(`📊 حجم فایل صوتی: ${audioBlob.size} بایت`);
    console.log(`📊 نوع فایل (MIME): ${audioBlob.type}`);

    if (audioBlob.size < 4000) {
      console.warn('⚠️ حجم فایل صوتی بسیار کم است (احتمالاً نویز).');
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
      console.log('📊 اطلاعات کامل Whisper:', {
        text: transcribeData.text,
        duration: transcribeData.duration,
        language: transcribeData.language,
        no_speech_prob: transcribeData.no_speech_prob,
        avg_logprob: transcribeData.avg_logprob,
        segments: transcribeData.segments?.length || 0,
      });

      const rawText = transcribeData.text || '';
      const noSpeechProb = transcribeData.no_speech_prob;

      if (noSpeechProb !== undefined && noSpeechProb > 0.8) {
        console.warn(`⚠️ تشخیص گفتار ضعیف: noSpeechProb=${noSpeechProb}`);
        alert('❌ We received audio but couldn\'t understand speech. Please try again speaking more clearly.');
        resetAudio();
        setIsProcessing(false);
        isProcessingRef.current = false;
        return;
      }

      if (rawText.trim().length === 0 || isNoise(rawText)) {
        console.warn('⚠️ متن خالی یا نویز است:', rawText);
        alert('❌ No clear speech detected. Please speak clearly and try again.');
        resetAudio();
        setIsProcessing(false);
        isProcessingRef.current = false;
        return;
      }

      console.log('✅ متن خام از Whisper:', rawText);

      console.log('📤 مرحله 2: ارسال متن به /api/structure...');
      const structureRes = await fetch('/api/structure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: rawText }),
      });

      console.log(`📥 پاسخ /api/structure: status ${structureRes.status}`);

      if (!structureRes.ok) {
        const errorText = await structureRes.text();
        console.error('❌ خطا در structure:', errorText);
        throw new Error(errorText || 'Structuring failed');
      }

      const structureData = await structureRes.json();
      console.log('✅ داده ساختاردهی‌شده:', structureData);

      // ✅ ذخیره‌ی آیتم (با ساختار ساده‌شده)
      await saveItem({
        title: structureData.title || 'Untitled',
        description: structureData.description || rawText,
        dueDate: structureData.dueDate || undefined,
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
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
        disabled={isProcessing}
        className={`relative w-24 h-24 rounded-full flex items-center justify-center text-white shadow-xl transition-colors ${
          isRecording
            ? 'bg-gradient-to-r from-red-500 to-pink-500 animate-pulse ring-4 ring-red-300'
            : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:shadow-2xl'
        }`}
      >
        {isRecording ? (
          <StopIcon className="w-10 h-10" />
        ) : (
          <MicrophoneIcon className="w-10 h-10" />
        )}
        {isRecording && (
          <motion.div
            className="absolute -inset-2 rounded-full border-4 border-red-300/50"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          />
        )}
      </motion.button>

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