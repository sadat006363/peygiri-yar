import { NextRequest, NextResponse } from 'next/server';
import openai from '@/lib/ai/client';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json({ error: 'فایل صوتی یافت نشد' }, { status: 400 });
    }

    console.log(`📥 دریافت فایل صوتی: ${audioFile.size} بایت، نوع: ${audioFile.type}`);

    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const file = new File([buffer], audioFile.name || 'audio.webm', { type: audioFile.type || 'audio/webm' });

    // ✅ دریافت خروجی کامل با verbose_json
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      response_format: 'verbose_json',
      prompt: 'This is a Persian or English business conversation. The speaker may mention names like Ali, Reza, Sara, and project names like PromptYar, Zbloue, Direct2Chat.',
      temperature: 0.2,
    });

    console.log('📊 اطلاعات خروجی Whisper:', {
      text: transcription.text,
      duration: transcription.duration,
      language: transcription.language,
      noSpeechProb: (transcription as any).no_speech_prob,
      segments: (transcription as any).segments?.length || 0,
    });

    return NextResponse.json({
      text: transcription.text,
      duration: transcription.duration,
      language: transcription.language,
      no_speech_prob: (transcription as any).no_speech_prob,
      avg_logprob: (transcription as any).avg_logprob,
      segments: (transcription as any).segments || [],
    });
  } catch (error: any) {
    console.error('❌ خطا در transcribe API:', error);
    return NextResponse.json(
      { error: error.message || 'خطا در پردازش صدا' },
      { status: 500 }
    );
  }
}