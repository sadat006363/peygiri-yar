import { NextRequest, NextResponse } from 'next/server';
import { correctionMemoryRepository } from '@/lib/storage/repository';

export async function POST(req: NextRequest) {
  console.log('💾 ذخیره اصلاحات در حافظه...');

  try {
    const { original, corrected, userId } = await req.json();

    if (!original || !corrected || original.trim().length === 0 || corrected.trim().length === 0) {
      return NextResponse.json(
        { error: 'متن اصلی و اصلاح‌شده الزامی هستند.' },
        { status: 400 }
      );
    }

    // اگر اصلاحات یکسان باشد، ذخیره نمی‌کنیم
    if (original.trim() === corrected.trim()) {
      console.log('ℹ️ اصلاحات یکسان هستند، ذخیره نمی‌شود.');
      return NextResponse.json({
        success: true,
        message: 'No changes to save.',
        id: null,
      });
    }

    // بررسی آیا قبلاً این اصلاح وجود دارد
    const existing = await correctionMemoryRepository.findByOriginalText(original.trim());
    
    if (existing) {
      console.log('🔄 اصلاح قبلاً وجود دارد، افزایش استفاده...');
      await correctionMemoryRepository.incrementUsage(existing.id!);
      return NextResponse.json({
        success: true,
        message: 'Correction usage incremented.',
        id: existing.id,
        existing: true,
      });
    }

    // ذخیره اصلاح جدید
    const id = await correctionMemoryRepository.add({
      originalText: original.trim(),
      correctedText: corrected.trim(),
      userId: userId || 'anonymous',
      usageCount: 1,
      lastUsed: new Date(),
      createdAt: new Date(),
    });

    console.log(`✅ اصلاح جدید ذخیره شد: "${original}" → "${corrected}" (id: ${id})`);

    return NextResponse.json({
      success: true,
      message: 'Correction saved successfully.',
      id,
      existing: false,
    });

  } catch (error: any) {
    console.error('❌ خطا در ذخیره اصلاحات:', error);
    return NextResponse.json(
      { error: error.message || 'خطای داخلی سرور' },
      { status: 500 }
    );
  }
}