import { NextRequest, NextResponse } from 'next/server';
import { AssemblyAI } from 'assemblyai';

// ایجاد کلاینت AssemblyAI با کلید API از متغیر محیطی
const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    // 1. دریافت فایل صوتی از درخواست
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;

    // 2. بررسی وجود فایل
    if (!audioFile) {
      console.error('❌ فایل صوتی در درخواست وجود ندارد.');
      return NextResponse.json({ error: 'فایل صوتی یافت نشد' }, { status: 400 });
    }

    console.log(`📥 دریافت فایل صوتی: size=${audioFile.size} بایت, type=${audioFile.type}`);

    // 3. تبدیل فایل به Buffer برای آپلود
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 4. آپلود فایل به AssemblyAI
    const uploadResponse = await client.files.upload(buffer, {
      fileName: audioFile.name || 'audio.webm',
    });

    console.log(`📤 فایل آپلود شد. URL: ${uploadResponse.upload_url}`);

    // 5. درخواست ترنسکریپشن (تبدیل گفتار به متن)
    const transcript = await client.transcripts.create({
      audio_url: uploadResponse.upload_url,
      language_code: 'fa', // زبان فارسی
      speech_model: 'best', // بهترین مدل (دقت بالا)
    });

    console.log(`📝 درخواست ترنسکریپشن ثبت شد. ID: ${transcript.id}`);

    // 6. منتظر ماندن برای تکمیل پردازش
    const result = await client.transcripts.waitUntilReady(transcript.id);

    // 7. بررسی خطا در نتیجه
    if (result.status === 'error') {
      console.error('❌ خطا در ترنسکریپشن:', result.error);
      throw new Error(result.error || 'خطا در ترنسکریپشن');
    }

    // 8. برگرداندن نتیجه
    console.log(`✅ ترنسکریپشن کامل شد. متن: ${result.text}`);
    
    return NextResponse.json({
      text: result.text,
      duration: result.audio_duration,
      language: result.language_code,
      confidence: result.confidence,
    });
  } catch (error: any) {
    console.error('❌ خطا در AssemblyAI API:', error);
    return NextResponse.json(
      { error: error.message || 'خطا در پردازش صدا' },
      { status: 500 }
    );
  }
}