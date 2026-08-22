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
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: STRUCTURE_SYSTEM_PROMPT },
        { role: 'user', content: STRUCTURE_USER_PROMPT(text) },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);

    let items: any[] = [];
    if (parsed.items && Array.isArray(parsed.items) && parsed.items.length > 0) {
      items = parsed.items;
    } else {
      items = [{
        category: parsed.category || 'idea',
        title: parsed.title || 'Untitled',
        description: parsed.description || text,
        priority: parsed.priority || 'medium',
        dueDate: parsed.dueDate || null,
        nextAction: parsed.nextAction || null,
        waitingFor: parsed.waitingFor || null,
        confidence: parsed.confidence || 0.9,
        // موجودیت‌ها
        person: parsed.person || null,
        company: parsed.company || null,
        project: parsed.project || null,
        owner: parsed.owner || null,
      }];
    }

    const sanitizedItems = items.map((item: any) => ({
      category: item.category || 'idea',
      title: item.title || 'Untitled',
      description: item.description || text,
      priority: item.priority || 'medium',
      dueDate: item.dueDate || null,
      nextAction: item.nextAction || null,
      waitingFor: item.waitingFor || null,
      confidence: item.confidence !== undefined ? item.confidence : 0.9,
      person: item.person || null,
      company: item.company || null,
      project: item.project || null,
      owner: item.owner || null,
    }));

    return NextResponse.json({ items: sanitizedItems });
  } catch (error: any) {
    console.error('Error in structure API:', error);
    return NextResponse.json(
      { error: error.message || 'خطا در ساختاردهی متن' },
      { status: 500 }
    );
  }
}