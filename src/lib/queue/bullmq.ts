import { Queue } from 'bullmq';
import { getRedisConnection } from './redis';

export interface RoadmapWorkflowJobData {
  userId: string;
  email: string;
  userName?: string;
  targetGoal: string;
  customGoal?: string | null;
  experienceLevel: string;
  skills: Array<{ skillId?: string; name: string; level?: string }>;
  dailyCommitmentMinutes: number;
}

export interface DailyQuestionsEmailJobData {
  userId: string;
  email: string;
  userName?: string;
  topicTitle: string;
  questions: Array<{
    title: string;
    type: string;
    difficulty: string;
    estMinutes: number;
  }>;
}

export const COGNIPATH_QUEUE_NAME = 'cognipath-background-queue';

let cognipathQueue: Queue | null = null;

export function getCognipathQueue(): Queue | null {
  if (cognipathQueue) return cognipathQueue;

  const connection = getRedisConnection();
  if (!connection) return null;

  try {
    cognipathQueue = new Queue(COGNIPATH_QUEUE_NAME, {
      connection,
      defaultJobOptions: {
        // Automatically remove completed jobs from Redis immediately to prevent memory overburdening
        removeOnComplete: true,
        removeOnFail: { age: 86400, count: 50 },
        attempts: 2,
        backoff: {
          type: 'exponential',
          delay: 3000,
        },
      },
    });
    return cognipathQueue;
  } catch (err) {
    console.warn('[BullMQ] Failed to create queue instance:', err);
    return null;
  }
}

/**
 * Enqueue roadmap workflow (Start Email -> Build Roadmap -> Complete Email -> Content Gen -> Content Email)
 */
export async function enqueueRoadmapWorkflow(data: RoadmapWorkflowJobData): Promise<void> {
  const queue = getCognipathQueue();
  if (queue) {
    try {
      await queue.add('process-roadmap-workflow', data, {
        jobId: `roadmap_${data.userId}_${Date.now()}`,
      });
      console.log(`[BullMQ] Enqueued roadmap workflow job for user ${data.userId}`);
      return;
    } catch (err) {
      console.warn('[BullMQ] Failed to enqueue roadmap job, falling back to direct execution:', err);
    }
  }

  // Fallback: Execute directly in background task
  import('./workers').then(({ executeRoadmapWorkflowDirectly }) => {
    executeRoadmapWorkflowDirectly(data).catch((err) =>
      console.error('[Direct Execution Fallback Error]:', err)
    );
  });
}

/**
 * Enqueue Daily Questions notification email job
 */
export async function enqueueDailyQuestionsEmail(data: DailyQuestionsEmailJobData): Promise<void> {
  const queue = getCognipathQueue();
  if (queue) {
    try {
      await queue.add('send-daily-questions-email', data, {
        jobId: `daily_questions_${data.userId}_${Date.now()}`,
      });
      console.log(`[BullMQ] Enqueued daily questions email job for user ${data.userId}`);
      return;
    } catch (err) {
      console.warn('[BullMQ] Failed to enqueue daily questions email job:', err);
    }
  }

  // Fallback: Send email directly
  import('../email/transporter').then(({ sendEmail }) => {
    sendEmail({
      to: data.email,
      subject: `🎯 Your Daily Practice Questions: ${data.topicTitle}`,
      templateName: 'daily-questions',
      data: {
        userName: data.userName,
        topicTitle: data.topicTitle,
        questions: data.questions,
      },
    }).catch((err) => console.error('[Direct Email Fallback Error]:', err));
  });
}
