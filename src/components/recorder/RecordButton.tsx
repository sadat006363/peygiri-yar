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

  // ✅ یک تابع واحد برای مدیریت کلیک
  const handleClick = () => {
    console.log('🖱️ دکمه کلیک شد.');
    console.log(`📊 isRecording فعلی: ${isRecording}`);

    if (isRecording) {
      console.log('⏹ درخواست توقف ضبط...');
      stopRecording();
    } else {
      console.log('🎤 درخواست شروع ضبط...');
      startRecording();
    }
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
      {/* Record Button */}
      <div className="relative">
        <button
          onClick={handleClick}  // ✅ فقط یک تابع
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

      {isRecording && (
        <p className="text-sm text-red-500 font-medium">⚫ Recording... (tap to stop)</p>
      )}
    </div>
  );
};