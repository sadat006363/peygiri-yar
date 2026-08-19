import { NextRequest, NextResponse } from 'next/server';
import { correctionMemoryRepository } from '@/lib/storage/repository';

export async function GET(req: NextRequest) {
  console.log('📊 دریافت پرکاربردترین اصلاحات...');

  try {
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '20');
    const results = await correctionMemoryRepository.getMostUsed(limit);
    
    console.log(`✅ ${results.length} اصلاحات پرکاربرد دریافت شد.`);
    
    return NextResponse.json({
      success: true,
      data: results,
      count: results.length,
    });
  } catch (error: any) {
    console.error('❌ خطا در دریافت اصلاحات پرکاربرد:', error);
    return NextResponse.json(
      { error: error.message || 'خطای داخلی سرور' },
      { status: 500 }
    );
  }
}