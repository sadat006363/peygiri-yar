import { NextRequest, NextResponse } from 'next/server';
import { AssemblyAI } from 'assemblyai';

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      console.error('❌ فایل صوتی در درخواست وجود ندارد.');
      return NextResponse.json({ error: 'فایل صوتی یافت نشد' }, { status: 400 });
    }

    console.log(`📥 دریافت فایل صوتی: size=${audioFile.size} بایت, type=${audioFile.type}`);

    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // ✅ آپلود فایل (فقط یک آرگومان: بافر)
    const uploadUrl = await client.files.upload(buffer);
    console.log(`📤 فایل آپلود شد. URL: ${uploadUrl}`);

    // ✅ درخواست ترنسکریپشن
    const transcript = await client.transcripts.create({
      audio_url: uploadUrl,
      language_code: 'fa',
      speech_model: 'best',
    });

    console.log(`📝 درخواست ترنسکریپشن ثبت شد. ID: ${transcript.id}`);

    const result = await client.transcripts.waitUntilReady(transcript.id);

    if (result.status === 'error') {
      console.error('❌ خطا در ترنسکریپشن:', result.error);
      throw new Error(result.error || 'خطا در ترنسکریپشن');
    }

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