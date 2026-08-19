'use client';

import { useState } from 'react';
import { useRecorder } from '@/hooks/useRecorder';
import { useItemStore } from '@/stores/itemStore';
import { Button } from '../ui/Button';

export const RecordButton = () => {
  const { isRecording, audioBlob, startRecording, stopRecording, resetAudio } = useRecorder();
  const [isProcessing, setIsProcessing] = useState(false);
  const { addItem } = useItemStore();

  const handleSend = async () => {
    if (!audioBlob) {
      console.warn("⚠️ هیچ فایل صوتی برای ارسال وجود ندارد.");
      return;
    }

    console.log(`📤 ارسال فایل صوتی به سرور... (${audioBlob.size} بایت)`);
    setIsProcessing(true);

    try {
      // 1. ارسال به API تبدیل صدا
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.webm');

      console.log("📡 ارسال درخواست به /api/transcribe");
      const transcribeRes = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      const transcribeData = await transcribeRes.json();
      console.log("📥 پاسخ از /api/transcribe:", transcribeData);

      if (!transcribeRes.ok) {
        throw new Error(transcribeData.error || 'Transcription failed');
      }

      const rawText = transcribeData.text;
      console.log(`📝 متن تبدیل‌شده: "${rawText}"`);

      // 2. ارسال به API ساختاردهی
      console.log("📡 ارسال درخواست به /api/structure");
      const structureRes = await fetch('/api/structure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: rawText }),
      });

      const structuredData = await structureRes.json();
      console.log("📥 پاسخ از /api/structure:", structuredData);

      if (!structureRes.ok) {
        throw new Error(structuredData.error || 'Structuring failed');
      }

      // 3. ذخیره در دیتابیس
      console.log("💾 ذخیره آیتم در دیتابیس:", structuredData);
      await addItem({
        rawText,
        category: structuredData.category || 'idea',
        title: structuredData.title || 'Untitled',
        description: structuredData.description || rawText,
      });

      // 4. پاک کردن فایل صوتی
      resetAudio();
      console.log("✅ فرآیند با موفقیت کامل شد!");
      alert('✅ Item successfully saved. Please review it in the "Pending Approval" section.');
    } catch (error: any) {
      console.error("❌ خطا در فرآیند:", error);
      alert('❌ Error: ' + (error.message || 'Something went wrong'));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <button
          onClick={isRecording ? stopRecording : startRecording}
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