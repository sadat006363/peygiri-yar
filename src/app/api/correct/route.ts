import { NextRequest, NextResponse } from 'next/server';
import openai from '@/lib/ai/client';

/**
 * API endpoint for correcting speech-to-text transcripts using GPT
 * Input: { text: string, knownPeople?: string[], knownProjects?: string[], knownTerms?: string[] }
 * Output: { correctedText: string, changes: { original, corrected, reason, confidence }[], needsConfirmation: boolean }
 */
export async function POST(req: NextRequest) {
  console.log('📥 درخواست جدید به /api/correct دریافت شد.');

  try {
    const body = await req.json();
    console.log('📦 داده‌های دریافتی:', body);

    const { text, knownPeople = [], knownProjects = [], knownTerms = [] } = body;

    if (!text || text.trim().length === 0) {
      console.warn('⚠️ متن ورودی خالی است.');
      return NextResponse.json(
        { error: 'متن ورودی خالی است' },
        { status: 400 }
      );
    }

    // محدود کردن طول متن برای جلوگیری از مصرف زیاد توکن
    const truncatedText = text.length > 2000 ? text.slice(0, 2000) + '...' : text;
    console.log(`📄 طول متن: ${text.length} کاراکتر (بعد از truncate: ${truncatedText.length})`);

    const systemPrompt = `
You are a careful Persian speech-transcript correction assistant.

Your task is to correct only likely speech-to-text errors.
Do not rewrite the user's style.
Do not add information that was not spoken.
Do not invent names, dates, amounts, or actions.

Preserve Persian colloquial meaning.
Keep English product names exactly when they match known terms.
Never change numbers, dates, times, or names silently.

Known people: ${knownPeople.join(', ') || 'None'}
Known projects and terms: ${knownProjects.join(', ') || 'None'}

Return a valid JSON object with the following keys:
{
  "correctedText": "...",
  "changes": [
    {
      "original": "...",
      "corrected": "...",
      "reason": "...",
      "confidence": 0.0
    }
  ],
  "needsConfirmation": true
}
`;

    const userPrompt = truncatedText;

    console.log('🤖 ارسال به GPT برای اصلاح...');
    const startTime = Date.now();

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' },
    });

    const elapsedTime = Date.now() - startTime;
    console.log(`⏱️ زمان پاسخ GPT: ${elapsedTime}ms`);

    const content = response.choices[0]?.message?.content || '{}';
    console.log('📝 خروجی خام GPT:', content);

    let result;
    try {
      result = JSON.parse(content);
    } catch (parseError) {
      console.error('❌ خطا در parse کردن JSON:', parseError);
      // بازگشت به متن اصلی در صورت عدم موفقیت
      return NextResponse.json({
        correctedText: text,
        changes: [],
        needsConfirmation: false,
        warning: 'Correction parsing failed, using original text.',
      });
    }

    // اطمینان از وجود فیلدهای مورد نیاز
    const correctedText = result.correctedText || text;
    const changes = result.changes || [];
    const needsConfirmation = result.needsConfirmation !== false;

    console.log('✅ اصلاح نهایی:', correctedText);
    console.log(`📊 تعداد اصلاحات: ${changes.length}`);
    if (changes.length > 0) {
      console.log('📊 نمونه اصلاحات:', changes.slice(0, 3));
    }

    return NextResponse.json({
      correctedText,
      changes,
      needsConfirmation,
    });
  } catch (error: any) {
    console.error('❌ خطا در /api/correct:', error);
    return NextResponse.json(
      { error: error.message || 'خطای داخلی سرور' },
      { status: 500 }
    );
  }
}