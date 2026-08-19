import { NextRequest, NextResponse } from 'next/server';
import { correctionMemoryRepository } from '@/lib/storage/repository';

export async function POST(req: NextRequest) {
  console.log('🔍 جستجو در حافظه‌ی اصلاحات...');

  try {
    const { text } = await req.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json({
        found: false,
        corrections: [],
        suggestion: null,
      });
    }

    // جستجوی اصلاحات مرتبط با متن
    const results = await correctionMemoryRepository.searchByText(text);
    console.log(`✅ ${results.length} مورد در حافظه پیدا شد.`);

    if (results.length === 0) {
      return NextResponse.json({
        found: false,
        corrections: [],
        suggestion: null,
      });
    }

    // مرتب‌سازی بر اساس تعداد استفاده (پرکاربردترین‌ها اول)
    const sorted = results
      .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
      .slice(0, 5);

    // پیشنهاد اصلاح: ترکیب اصلاحات
    let suggestion = text;
    let applied = 0;
    for (const mem of sorted) {
      if (suggestion.includes(mem.originalText)) {
        suggestion = suggestion.replaceAll(mem.originalText, mem.correctedText);
        applied++;
      }
    }

    return NextResponse.json({
      found: true,
      corrections: sorted,
      suggestion: applied > 0 ? suggestion : null,
    });

  } catch (error: any) {
    console.error('❌ خطا در جستجوی حافظه:', error);
    return NextResponse.json(
      { error: error.message || 'خطای داخلی سرور' },
      { status: 500 }
    );
  }
}