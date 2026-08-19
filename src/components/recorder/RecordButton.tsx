'use client';

import { useState } from 'react';
import { useRecorder } from '@/hooks/useRecorder';
import { useItemStore } from '@/stores/itemStore';
import { Button } from '../ui/Button';

export const RecordButton = () => {
  const { isRecording, audioBlob, startRecording, stopRecording, resetAudio } = useRecorder();
  const [isProcessing, setIsProcessing] = useState(false);
  const { addItem } = useItemStore();

  console.log('🔄 RecordButton رندر شد.');
  console.log(`📊 وضعیت isRecording: ${isRecording}`);
  console.log(`📊 وضعیت audioBlob: ${audioBlob ? `${audioBlob.size} بایت` : 'خالی'}`);
  console.log(`📊 وضعیت isProcessing: ${isProcessing}`);

  const handleStart = () => {
    console.log('🎤 دکمه START کلیک شد.');
    startRecording();
    
    // تایمر خودکار برای توقف بعد از 15 ثانیه (برای تست)
    setTimeout(() => {
      if (isRecording) {
        console.log('⏰ تایمر خودکار: توقف ضبط...');
        stopRecording();
      }
    }, 15000);
  };

  const handleStop = () => {
    console.log('⏹ دکمه STOP کلیک شد.');
    stopRecording();
  };

  const handleSend = async () => {
    console.log('📤 دکمه "Save" کلیک شد.');
    console.log(`📊 audioBlob: ${audioBlob ? `${audioBlob.size} بایت` : 'خالی'}`);

    if (!audioBlob) {
      console.warn('⚠️ audioBlob خالی است، ادامه نمی‌دهیم.');
      return;
    }

    setIsProcessing(true);
    console.log('⏳ isProcessing = true');

    try {
      console.log('📤 ارسال فایل صوتی به /api/transcribe...');
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.webm');

      const transcribeRes = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      console.log(`📥 پاسخ از /api/transcribe: status ${transcribeRes.status}`);

      if (!transcribeRes.ok) {
        const errorText = await transcribeRes.text();
        console.error('❌ خطا در transcribe:', errorText);
        throw new Error(errorText || 'Transcription failed');
      }

      const transcribeData = await transcribeRes.json();
      console.log('✅ متن تبدیل‌شده:', transcribeData.text);

      const rawText = transcribeData.text;

      console.log('📤 ارسال متن به /api/structure...');
      const structureRes = await fetch('/api/structure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: rawText }),
      });

      console.log(`📥 پاسخ از /api/structure: status ${structureRes.status}`);

      if (!structureRes.ok) {
        const errorText = await structureRes.text();
        console.error('❌ خطا در structure:', errorText);
        throw new Error(errorText || 'Structuring failed');
      }

      const structuredData = await structureRes.json();
      console.log('✅ داده ساختاردهی‌شده:', structuredData);

      console.log('💾 ذخیره آیتم در دیتابیس...');
      await addItem({
        rawText,
        category: structuredData.category || 'idea',
        title: structuredData.title || 'Untitled',
        description: structuredData.description || rawText,
      });

      console.log('✅ آیتم با موفقیت ذخیره شد.');
      resetAudio();
      console.log('🔄 فایل صوتی پاک شد.');

      alert('✅ Item successfully saved. Please review it in the "Pending Approval" section.');

    } catch (error: any) {
      console.error('❌ خطا در فرآیند ذخیره‌سازی:', error);
      alert('❌ Error: ' + (error.message || 'Something went wrong'));
    } finally {
      setIsProcessing(false);
      console.log('⏳ isProcessing = false');
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Record / Stop Buttons */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleStart}
          disabled={isProcessing || isRecording}
          className="w-20 h-20 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-4xl shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          🎙
        </button>

        <button
          onClick={handleStop}
          disabled={isProcessing || !isRecording}
          className="w-20 h-20 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white text-4xl shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed animate-pulse ring-4 ring-red-300"
        >
          ⏹
        </button>
      </div>

      {isRecording && (
        <p className="text-sm text-red-500 font-medium">⚫ Recording... (use STOP button)</p>
      )}

      {/* Action Buttons after recording */}
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