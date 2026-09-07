import { NextResponse } from 'next/server';
import { generateLessonTask } from '@/lib/ai/tasks/generate-lesson';

export async function GET() {
  const startTime = Date.now();

  try {
    const lesson = await generateLessonTask({
      topic: 'JavaScript Closures',
      level: 'beginner',
      topicId: 'js-closures-101',
    });

    const durationMs = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      durationMs,
      lesson,
    });
  } catch (error: any) {
    const durationMs = Date.now() - startTime;
    return NextResponse.json(
      {
        success: false,
        durationMs,
        error: error?.message || 'AI Generation Failed',
      },
      { status: 500 }
    );
  }
}
