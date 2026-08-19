import { NextRequest, NextResponse } from 'next/server';
import openai from '@/lib/ai/client';

export async function POST(req: NextRequest) {
  try {
    const { text, knownPeople, knownProjects, knownTerms } = await req.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'متن ورودی خالی است' }, { status: 400 });
    }

    const systemPrompt = `
You are a careful Persian speech-transcript correction assistant.

Your task is to correct only likely speech-to-text errors.
Do not rewrite the user's style.
Do not add information that was not spoken.
Do not invent names, dates, amounts, or actions.

Preserve Persian colloquial meaning.
Keep English product names exactly when they match known terms.
Never change numbers, dates, times, or names silently.

Known people: ${knownPeople?.join(', ') || 'None'}
Known projects and terms: ${knownProjects?.join(', ') || 'None'}

Return JSON:
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

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text },
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content || '{}';
    const result = JSON.parse(content);

    return NextResponse.json({
      correctedText: result.correctedText || text,
      changes: result.changes || [],
      needsConfirmation: result.needsConfirmation !== false,
    });
  } catch (error: any) {
    console.error('Error in correct API:', error);
    return NextResponse.json(
      { error: error.message || 'خطا در اصلاح متن' },
      { status: 500 }
    );
  }
}