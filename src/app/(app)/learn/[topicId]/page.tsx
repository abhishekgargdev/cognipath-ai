import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/mongoose';
import { Lesson } from '@/lib/db/models/Lesson';
import { LearnClient, ClientLesson } from '@/components/learn/LearnClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ topicId: string }>;
}): Promise<Metadata> {
  const { topicId } = await params;
  const name = topicId ? topicId.replace(/[-_]/g, ' ') : 'Lesson';
  const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
  return {
    title: `Monograph: ${formattedName}`,
    description: `Comprehensive AI-synthesized architectural monograph for ${formattedName}.`,
  };
}

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

  // 1. Fetch Lesson document from MongoDB (Read-Only)
  const lessonDoc = await Lesson.findOne({
    $or: [{ topicId }, { id: topicId }],
  });

  const lessonStatus = lessonDoc ? lessonDoc.status || 'ready' : 'pending';

  // 2. Format Client Object
  const lesson: ClientLesson = {
    id: lessonDoc?.id || `lesson-${topicId}`,
    topicId: lessonDoc?.topicId || topicId,
    title: lessonDoc?.title || topicId.replace(/[-_]/g, ' ').toUpperCase(),
    subtitle: lessonDoc?.subtitle || 'Pedagogical synthesis in progress...',
    estimatedMinutes: lessonDoc?.estimatedMinutes || 25,
    difficulty: lessonDoc?.difficulty || 'Intermediate',
    masteryLevel: lessonDoc?.masteryLevel || 0,
    status: lessonStatus,
    whyYouAreLearningThis: lessonDoc?.whyYouAreLearningThis || 'Understanding core mechanics.',
    keyTakeaways: lessonDoc?.keyTakeaways || [],
    sections: (lessonDoc?.sections || []).map((s) => ({
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
    antiPatterns: (lessonDoc?.antiPatterns || []).map((ap) => ({
      id: ap.id,
      title: ap.title,
      mistakeCode: ap.mistakeCode,
      correctionCode: ap.correctionCode,
      explanation: ap.explanation,
      sequenceOrder: ap.sequenceOrder,
    })),
    knowledgeCheck: (lessonDoc?.knowledgeCheck || []).map((kc) => ({
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
