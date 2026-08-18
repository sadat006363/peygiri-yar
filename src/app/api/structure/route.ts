import { NextRequest, NextResponse } from 'next/server';
import openai from '@/lib/ai/client';
import { STRUCTURE_SYSTEM_PROMPT, STRUCTURE_USER_PROMPT } from '@/lib/ai/prompts';

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'متن ورودی خالی است' }, { status: 400 });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // یا gpt-3.5-turbo
      messages: [
        { role: 'system', content: STRUCTURE_SYSTEM_PROMPT },
        { role: 'user', content: STRUCTURE_USER_PROMPT(text) },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content || '{}';
    const structured = JSON.parse(content);

    return NextResponse.json(structured);
  } catch (error: any) {
    console.error('Error in structure API:', error);
    return NextResponse.json(
      { error: error.message || 'خطا در ساختاردهی متن' },
      { status: 500 }
    );
  }
}