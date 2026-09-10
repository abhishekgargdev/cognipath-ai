import { Worker, Job } from 'bullmq';
import { getRedisConnection } from './redis';
import { COGNIPATH_QUEUE_NAME, RoadmapWorkflowJobData, DailyQuestionsEmailJobData } from './bullmq';
import { sendEmail } from '../email/transporter';
import { processUserSkillsAndBuildRoadmap } from '../curriculum/roadmap-builder';
import { connectToDatabase } from '../db/mongoose';
import { UserProfile } from '../db/models/UserProfile';
import { Lesson } from '../db/models/Lesson';
import { PracticeQuestion } from '../db/models/PracticeQuestion';
import { generateLessonTask } from '../ai/tasks/generate-lesson';
import { generateQuestionTask } from '../ai/tasks/generate-question';
import { clearOnboardingJob, updateOnboardingJobProgress } from '../curriculum/onboarding-queue';

/**
 * Execute the full sequential workflow:
 * 1. Send Roadmap Creation Started Email
 * 2. Generate Roadmap Nodes & Milestones
 * 3. Send Roadmap Creation Completed Email
 * 4. Generate Content (Lessons & Practice Questions)
 * 5. Send Content Generation Completed Email
 * 6. Clean up temporary job state from Redis
 */
export async function executeRoadmapWorkflowDirectly(data: RoadmapWorkflowJobData): Promise<void> {
  const { userId, email, userName, targetGoal, customGoal, experienceLevel, skills, dailyCommitmentMinutes } = data;
  const finalGoal = customGoal || targetGoal;

  try {
    await connectToDatabase();

    // STEP 1: Send "Roadmap Creation Started" Email to User
    if (email) {
      await sendEmail({
        to: email,
        subject: `🚀 Skill Roadmap Building Started: ${finalGoal}`,
        templateName: 'roadmap-start',
        data: {
          userName: userName || 'Learner',
          targetGoal: finalGoal,
          skills,
        },
      });
    }

    // STEP 2: Process skills and build dynamic roadmap in database
    await updateOnboardingJobProgress(userId, 1, 'Synthesizing Roadmap Nodes');
    
    const buildResult = await processUserSkillsAndBuildRoadmap({
      userId,
      skills,
      targetGoal: finalGoal,
      experienceLevel,
      dailyCommitmentMinutes,
    });

    const enrolledCount = buildResult.enrolledCount || skills.length;
    const nodeCount = buildResult.nodeIds?.length || 0;

    // STEP 3: Send "Roadmap Creation Completed" Email to User
    if (email) {
      await sendEmail({
        to: email,
        subject: `✅ Your Skill Roadmap is Completed: ${finalGoal}`,
        templateName: 'roadmap-complete',
        data: {
          userName: userName || 'Learner',
          targetGoal: finalGoal,
          enrolledCount,
          nodeCount,
        },
      });
    }

    // STEP 4: Proceed with Content Generation for user's active nodes
    await updateOnboardingJobProgress(userId, 2, 'Generating Lessons & Practice Material');
    
    const nodeIds = buildResult.nodeIds || [];
    for (const topicId of nodeIds) {
      // 4a. Generate Lesson if missing or pending
      const existingLesson = await Lesson.findOne({ topicId });
      if (!existingLesson || existingLesson.status !== 'ready') {
        try {
          const generatedLesson = await generateLessonTask({
            topic: topicId.replace(/[-_]/g, ' '),
            topicId,
          });

          await Lesson.updateOne(
            { topicId },
            {
              id: `lesson-${topicId}`,
              topicId,
              title: generatedLesson.title,
              subtitle: generatedLesson.subtitle,
              estimatedMinutes: generatedLesson.estimatedMinutes,
              difficulty: generatedLesson.difficulty,
              masteryLevel: generatedLesson.masteryLevel || 0,
              whyYouAreLearningThis: generatedLesson.whyYouAreLearningThis,
              keyTakeaways: generatedLesson.keyTakeaways || [],
              sections: generatedLesson.sections || [],
              antiPatterns: generatedLesson.antiPatterns || [],
              knowledgeCheck: generatedLesson.knowledgeCheck || [],
              status: 'ready',
            },
            { upsert: true }
          );
        } catch (lessonErr) {
          console.warn(`[Roadmap Worker] Lesson synthesis warning for ${topicId}:`, lessonErr);
        }
      }

      // 4b. Ensure at least 3 practice questions exist for topicId
      const readyQCount = await PracticeQuestion.countDocuments({ topicId, status: 'ready' });
      if (readyQCount < 3) {
        const types: Array<'coding' | 'mcq' | 'debugging' | 'concept'> = ['coding', 'mcq', 'debugging'];
        for (let i = readyQCount; i < 3; i++) {
          const qType = types[i % types.length];
          const qId = `q_${topicId}_${i + 1}_${Date.now()}`;
          try {
            const aiQ = await generateQuestionTask({
              topic: topicId.replace(/[-_]/g, ' '),
              topicId,
              difficulty: (experienceLevel || 'Intermediate') as any,
              type: qType,
            });

            await PracticeQuestion.create({
              ...aiQ,
              id: aiQ.id || qId,
              topicId,
              sequenceOrder: i + 1,
              status: 'ready',
            });
          } catch (qErr) {
            console.warn(`[Roadmap Worker] Practice question synthesis warning for ${topicId}:`, qErr);
          }
        }
      }
    }

    // STEP 5: Send "Content Generation Completed" Email to User
    if (email) {
      await sendEmail({
        to: email,
        subject: `📚 Learning Content Prepared for ${finalGoal}`,
        templateName: 'content-generation-complete',
        data: {
          userName: userName || 'Learner',
          targetGoal: finalGoal,
        },
      });
    }

    // STEP 6: Update UserProfile status to completed
    await UserProfile.updateOne(
      { userId },
      {
        onboardingStatus: 'completed',
        onboardingCompletedAt: new Date(),
      }
    );

    // STEP 7: Remove temporary onboarding job data from Redis to keep Redis memory lightweight
    await clearOnboardingJob(userId);
    console.log(`[BullMQ Worker] Workflow successfully finished & Redis job state cleaned for user ${userId}`);

  } catch (err: any) {
    console.error(`[BullMQ Worker Error] Failed processing roadmap workflow for ${userId}:`, err);
    // Mark profile completed on error so user isn't stuck forever
    await UserProfile.updateOne(
      { userId },
      {
        onboardingStatus: 'completed',
        onboardingCompletedAt: new Date(),
      }
    ).catch(() => {});
    await clearOnboardingJob(userId).catch(() => {});
  }
}

// BullMQ Worker setup
let cognipathWorker: Worker | null = null;

export function initCognipathWorker(): Worker | null {
  if (cognipathWorker) return cognipathWorker;

  const connection = getRedisConnection();
  if (!connection) return null;

  try {
    cognipathWorker = new Worker(
      COGNIPATH_QUEUE_NAME,
      async (job: Job) => {
        console.log(`[BullMQ Worker] Processing job '${job.name}' (ID: ${job.id})`);

        if (job.name === 'process-roadmap-workflow') {
          await executeRoadmapWorkflowDirectly(job.data as RoadmapWorkflowJobData);
        } else if (job.name === 'send-daily-questions-email') {
          const data = job.data as DailyQuestionsEmailJobData;
          await sendEmail({
            to: data.email,
            subject: `🎯 Your Daily Practice Questions: ${data.topicTitle}`,
            templateName: 'daily-questions',
            data: {
              userName: data.userName,
              topicTitle: data.topicTitle,
              questions: data.questions,
            },
          });
        }
      },
      {
        connection,
        concurrency: 3,
      }
    );

    cognipathWorker.on('completed', (job: Job) => {
      console.log(`[BullMQ Worker] Job '${job.name}' (ID: ${job.id}) completed successfully.`);
      // BullMQ auto-removes job data because removeOnComplete: true is set
    });

    cognipathWorker.on('failed', (job: Job | undefined, err: Error) => {
      console.error(`[BullMQ Worker] Job '${job?.name}' (ID: ${job?.id}) failed:`, err);
    });

    return cognipathWorker;
  } catch (err) {
    console.warn('[BullMQ Worker] Worker initialization warning:', err);
    return null;
  }
}

// Auto-initialize worker when imported in Node process
if (typeof window === 'undefined') {
  initCognipathWorker();
}
