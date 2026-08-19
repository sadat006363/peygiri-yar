import { NextRequest, NextResponse } from 'next/server';
import openai from '@/lib/ai/client';
import { STRUCTURE_SYSTEM_PROMPT, STRUCTURE_USER_PROMPT } from '@/lib/ai/prompts';

export async function POST(req: NextRequest) {
  try {
    console.log("📥 درخواست جدید به /api/structure دریافت شد.");
    const { text } = await req.json();

    if (!text || text.trim().length === 0) {
      console.error("❌ متن ورودی خالی است.");
      return NextResponse.json({ error: 'متن ورودی خالی است' }, { status: 400 });
    }

    console.log(`📝 متن ورودی: "${text}"`);

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: STRUCTURE_SYSTEM_PROMPT },
        { role: 'user', content: STRUCTURE_USER_PROMPT(text) },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content || '{}';
    const structured = JSON.parse(content);
    console.log("✅ خروجی ساختاردهی:", structured);

    return NextResponse.json(structured);
  } catch (error: any) {
    console.error("❌ خطا در /api/structure:", error);
    return NextResponse.json(
      { error: error.message || 'خطا در ساختاردهی متن' },
      { status: 500 }
    );
  }
}