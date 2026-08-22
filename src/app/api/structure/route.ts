import { NextRequest, NextResponse } from 'next/server';
import openai from '@/lib/ai/client';
import { STRUCTURE_SYSTEM_PROMPT, STRUCTURE_USER_PROMPT } from '@/lib/ai/prompts';

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'متن ورودی خالی است' }, { status: 400 });
    }

    // ✅ دریافت تاریخ فعلی به‌صورت YYYY-MM-DD
    const today = new Date();
    const currentDate = today.toISOString().split('T')[0];
    console.log('📅 تاریخ فعلی ارسال‌شده به GPT:', currentDate);

    // ✅ جایگزینی {{currentDate}} در پرامپت
    const systemPrompt = STRUCTURE_SYSTEM_PROMPT.replace(
      /{{currentDate}}/g,
      currentDate
    );

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: STRUCTURE_USER_PROMPT(text) },
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);

    console.log('📤 خروجی GPT:', parsed);

    // ✅ بازگرداندن فیلدهای مورد نیاز
    return NextResponse.json({
      title: parsed.title || 'Untitled',
      description: parsed.description || text,
      dueDate: parsed.dueDate || null,
    });
  } catch (error: any) {
    console.error('Error in structure API:', error);
    return NextResponse.json(
      { error: error.message || 'خطا در ساختاردهی متن' },
      { status: 500 }
    );
  }
}