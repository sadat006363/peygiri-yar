import { NextRequest, NextResponse } from 'next/server';
import openai from '@/lib/ai/client';

export async function POST(req: NextRequest) {
  try {
    console.log("📥 درخواست جدید به /api/transcribe دریافت شد.");
    
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      console.error("❌ فایل صوتی در درخواست وجود ندارد.");
      return NextResponse.json({ error: 'فایل صوتی یافت نشد' }, { status: 400 });
    }

    console.log(`📁 فایل صوتی دریافت شد: ${audioFile.name}, ${audioFile.size} بایت, نوع: ${audioFile.type}`);

    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log(`📦 بافر ساخته شد: ${buffer.length} بایت`);

    // ایجاد فایل برای OpenAI
    const file = new File([buffer], audioFile.name, { type: audioFile.type || 'audio/webm' });

    console.log("📤 ارسال به OpenAI Whisper API...");
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      language: 'fa',
      response_format: 'text',
    });

    console.log(`✅ متن تبدیل‌شده: "${transcription}"`);
    return NextResponse.json({ text: transcription });
  } catch (error: any) {
    console.error("❌ خطا در /api/transcribe:", error);
    return NextResponse.json(
      { error: error.message || 'خطا در پردازش صدا' },
      { status: 500 }
    );
  }
}