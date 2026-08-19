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

    // ✅ تغییرات اصلی اینجا:
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      language: 'auto',               // ← تشخیص خودکار زبان
      response_format: 'verbose_json', // ← خروجی با جزئیات بیشتر (شامل زبان تشخیص داده شده)
      prompt: 'This is a business conversation.', // ← راهنمایی برای تشخیص بهتر
    });

    // خروجی می‌تونه JSON با فیلدهای text و language باشه
    // اما ما فقط text رو برمی‌گردونیم
    return NextResponse.json({ text: transcription.text });
  } catch (error: any) {
    console.error('Error in transcribe API:', error);
    return NextResponse.json({ error: error.message || 'خطا در پردازش صدا' }, { status: 500 });
  }
}