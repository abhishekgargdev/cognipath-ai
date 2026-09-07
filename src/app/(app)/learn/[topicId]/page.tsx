import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/mongoose';
import { Lesson } from '@/lib/db/models/Lesson';
import { generateLessonTask } from '@/lib/ai/tasks/generate-lesson';
import { LearnClient, ClientLesson } from '@/components/learn/LearnClient';

export default async function LearnTopicPage({
  params,
}: {
  params: Promise<{ topicId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/');
  }

  const { topicId } = await params;
  if (!topicId) {
    redirect('/roadmap');
  }

  await connectToDatabase();

  // 1. Check if Lesson document exists in MongoDB
  let lessonDoc = await Lesson.findOne({
    $or: [{ topicId }, { id: topicId }],
  });

  // 2. One-time AI Generation if missing from Mongo
  if (!lessonDoc) {
    console.log(`[Learn Page] No lesson document found for topicId "${topicId}". Invoking AI generation...`);
    try {
      const generated = await generateLessonTask({
        topic: topicId.replace(/[-_]/g, ' '),
        topicId,
      });

      lessonDoc = await Lesson.create({
        id: generated.id || `lesson-${topicId}`,
        topicId,
        title: generated.title,
        subtitle: generated.subtitle,
        estimatedMinutes: generated.estimatedMinutes,
        difficulty: generated.difficulty,
        masteryLevel: generated.masteryLevel || 0,
        whyYouAreLearningThis: generated.whyYouAreLearningThis,
        keyTakeaways: generated.keyTakeaways || [],
        sections: generated.sections || [],
        antiPatterns: generated.antiPatterns || [],
        knowledgeCheck: generated.knowledgeCheck || [],
      });

      console.log(`[Learn Page] Successfully generated & persisted lesson for topicId "${topicId}"`);
    } catch (err: any) {
      console.error(`[Learn Page] Failed to generate AI lesson for "${topicId}":`, err);
      // Fallback object to prevent crashing
      lessonDoc = new Lesson({
        id: `lesson-${topicId}`,
        topicId,
        title: `${topicId.replace(/[-_]/g, ' ')} Foundations`,
        subtitle: `An architectural monograph covering core paradigms of ${topicId}.`,
        estimatedMinutes: 25,
        difficulty: 'Intermediate',
        masteryLevel: 0,
        whyYouAreLearningThis: 'Understanding these fundamental mechanics is essential for system reliability.',
        keyTakeaways: [
          'State persistence & lexical context scoping',
          'Asymptotic performance implications',
          'Production debugging paradigms',
        ],
        sections: [
          {
            id: 'sec-1',
            title: 'Core Fundamentals',
            content: 'This section details the primary execution semantics and architectural principles of the topic.',
            sequenceOrder: 1,
          },
        ],
        antiPatterns: [],
        knowledgeCheck: [],
      });
    }
  }

  // 3. Format Client Object
  const lesson: ClientLesson = {
    id: lessonDoc.id,
    topicId: lessonDoc.topicId,
    title: lessonDoc.title,
    subtitle: lessonDoc.subtitle,
    estimatedMinutes: lessonDoc.estimatedMinutes,
    difficulty: lessonDoc.difficulty,
    masteryLevel: lessonDoc.masteryLevel || 0,
    whyYouAreLearningThis: lessonDoc.whyYouAreLearningThis,
    keyTakeaways: lessonDoc.keyTakeaways || [],
    sections: (lessonDoc.sections || []).map((s) => ({
      id: s.id,
      title: s.title,
      content: s.content,
      codeSnippet: s.codeSnippet
        ? {
            language: s.codeSnippet.language,
            code: s.codeSnippet.code,
            caption: s.codeSnippet.caption,
          }
        : undefined,
      highlightNote: s.highlightNote,
      calloutType: s.calloutType,
      sequenceOrder: s.sequenceOrder,
    })),
    antiPatterns: (lessonDoc.antiPatterns || []).map((ap) => ({
      id: ap.id,
      title: ap.title,
      mistakeCode: ap.mistakeCode,
      correctionCode: ap.correctionCode,
      explanation: ap.explanation,
      sequenceOrder: ap.sequenceOrder,
    })),
    knowledgeCheck: (lessonDoc.knowledgeCheck || []).map((kc) => ({
      id: kc.id,
      question: kc.question,
      options: kc.options,
      correctIndex: kc.correctIndex,
      explanation: kc.explanation,
      sequenceOrder: kc.sequenceOrder,
    })),
  };

  return <LearnClient lesson={lesson} />;
}
