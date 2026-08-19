import { NextRequest, NextResponse } from 'next/server';
import openai from '@/lib/ai/client';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json({ error: 'فایل صوتی یافت نشد' }, { status: 400 });
    }

    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const file = new File([buffer], 'audio.webm', { type: 'audio/webm' });

    // ✅ حذف language و استفاده از auto-detection توسط Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      response_format: 'text',  // متن ساده برگردانده شود
      // prompt اختیاری برای راهنمایی
      prompt: 'This is a business conversation in Persian or English.',
    });

    return NextResponse.json({ text: transcription });
  } catch (error: any) {
    console.error('Error in transcribe API:', error);
    return NextResponse.json({ error: error.message || 'خطا در پردازش صدا' }, { status: 500 });
  }
}