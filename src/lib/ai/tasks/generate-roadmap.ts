import { z } from 'zod';
import { aiRouter } from '../router';
import { getCachedTaskResult, setCachedTaskResult } from '../cache';
import { buildRoadmapPrompt, RoadmapPromptInput } from '../prompts/roadmap';
import { roadmapMilestoneSchema, roadmapNodeSchema } from '../../schemas/roadmap';

export const roadmapOutputSchema = z.object({
  milestones: z.array(roadmapMilestoneSchema),
  nodes: z.array(roadmapNodeSchema),
});

export type RoadmapOutput = z.infer<typeof roadmapOutputSchema>;

export function getDefaultFallbackRoadmap(targetGoal: string): RoadmapOutput {
  const goalClean = targetGoal || 'Full Stack Engineer';
  return {
    milestones: [
      {
        id: 'milestone-1',
        title: 'Core Fundamentals & Architecture',
        description: `Master foundational concepts for ${goalClean}`,
        sequenceOrder: 1,
        targetGoal: goalClean,
        nodeIds: ['node-js-event-loop', 'node-async-concurrency', 'node-data-structures'],
      },
      {
        id: 'milestone-2',
        title: 'Advanced Implementation & API Patterns',
        description: 'System design, APIs, and scalable backend design',
        sequenceOrder: 2,
        targetGoal: goalClean,
        nodeIds: ['node-api-design', 'node-database-indexing', 'node-distributed-caching'],
      },
    ],
    nodes: [
      {
        id: 'node-js-event-loop',
        milestoneId: 'milestone-1',
        title: 'JS Event Loop & Execution Context',
        category: 'core',
        categoryLabel: 'Core Fundamentals',
        status: 'available',
        difficulty: 'Beginner',
        estMinutes: 45,
        masteryPercent: 0,
        prerequisites: [],
        whyItMatters: 'Essential for understanding non-blocking I/O and asynchronous JavaScript execution.',
        description: 'Deep dive into call stacks, task queues, microtasks, and event loop mechanics.',
        sequenceOrder: 1,
        subtopics: [
          { id: 'sub-1-1', title: 'Call Stack and Memory Heap', sequenceOrder: 1, completed: false },
          { id: 'sub-1-2', title: 'Task Queue vs Microtask Queue', sequenceOrder: 2, completed: false },
          { id: 'sub-1-3', title: 'Event Loop Event Processing', sequenceOrder: 3, completed: false },
        ],
      },
      {
        id: 'node-async-concurrency',
        milestoneId: 'milestone-1',
        title: 'Asynchronous Programming & Promises',
        category: 'core',
        categoryLabel: 'Core Fundamentals',
        status: 'available',
        difficulty: 'Intermediate',
        estMinutes: 50,
        masteryPercent: 0,
        prerequisites: ['node-js-event-loop'],
        whyItMatters: 'Critical for handling async APIs, concurrency, and preventing race conditions.',
        description: 'Promises, async/await patterns, error handling, and parallel execution.',
        sequenceOrder: 2,
        subtopics: [
          { id: 'sub-2-1', title: 'Promise Lifecycle and Chaining', sequenceOrder: 1, completed: false },
          { id: 'sub-2-2', title: 'Promise.all vs Promise.allSettled', sequenceOrder: 2, completed: false },
          { id: 'sub-2-3', title: 'Async/Await Error Diagnostics', sequenceOrder: 3, completed: false },
        ],
      },
      {
        id: 'node-data-structures',
        milestoneId: 'milestone-1',
        title: 'Algorithmic Complexity & Core Data Structures',
        category: 'algorithms',
        categoryLabel: 'Algorithms',
        status: 'locked',
        difficulty: 'Intermediate',
        estMinutes: 60,
        masteryPercent: 0,
        prerequisites: ['node-async-concurrency'],
        whyItMatters: 'Fundamental for writing performant, scalable code with low time and space complexity.',
        description: 'Big-O notation, hash tables, arrays, trees, and dynamic arrays.',
        sequenceOrder: 3,
        subtopics: [
          { id: 'sub-3-1', title: 'Big-O Asymptotic Analysis', sequenceOrder: 1, completed: false },
          { id: 'sub-3-2', title: 'Hash Table Operations & Collision Resolution', sequenceOrder: 2, completed: false },
          { id: 'sub-3-3', title: 'Tree & Graph Traversal Paradigms', sequenceOrder: 3, completed: false },
        ],
      },
      {
        id: 'node-api-design',
        milestoneId: 'milestone-2',
        title: 'RESTful API & GraphQL Architecture',
        category: 'system-design',
        categoryLabel: 'System Design',
        status: 'locked',
        difficulty: 'Intermediate',
        estMinutes: 55,
        masteryPercent: 0,
        prerequisites: ['node-data-structures'],
        whyItMatters: 'Building robust, versioned, and secure backend endpoints for client applications.',
        description: 'HTTP semantics, payload validation, status codes, and GraphQL schema design.',
        sequenceOrder: 4,
        subtopics: [
          { id: 'sub-4-1', title: 'HTTP Methods and Status Code Semantics', sequenceOrder: 1, completed: false },
          { id: 'sub-4-2', title: 'Zod Input Validation and Middleware Guards', sequenceOrder: 2, completed: false },
          { id: 'sub-4-3', title: 'GraphQL Resolvers vs REST Controllers', sequenceOrder: 3, completed: false },
        ],
      },
      {
        id: 'node-database-indexing',
        milestoneId: 'milestone-2',
        title: 'Database Schema Design & Query Indexing',
        category: 'databases',
        categoryLabel: 'Databases',
        status: 'locked',
        difficulty: 'Advanced',
        estMinutes: 60,
        masteryPercent: 0,
        prerequisites: ['node-api-design'],
        whyItMatters: 'Optimizing database queries to maintain sub-10ms response times at scale.',
        description: 'B-Tree indexes, compound indexes, aggregation pipelines, and query explain plans.',
        sequenceOrder: 5,
        subtopics: [
          { id: 'sub-5-1', title: 'B-Tree & Compound Index Optimization', sequenceOrder: 1, completed: false },
          { id: 'sub-5-2', title: 'MongoDB Aggregation Framework', sequenceOrder: 2, completed: false },
          { id: 'sub-5-3', title: 'Transactions and ACID Isolation Levels', sequenceOrder: 3, completed: false },
        ],
      },
      {
        id: 'node-distributed-caching',
        milestoneId: 'milestone-2',
        title: 'Distributed Caching & Rate Limiting',
        category: 'system-design',
        categoryLabel: 'System Design',
        status: 'locked',
        difficulty: 'Advanced',
        estMinutes: 60,
        masteryPercent: 0,
        prerequisites: ['node-database-indexing'],
        whyItMatters: 'Protecting databases and external services under high traffic load.',
        description: 'Redis caching strategies, sliding window rate limiters, and lock primitives.',
        sequenceOrder: 6,
        subtopics: [
          { id: 'sub-6-1', title: 'Cache Aside vs Read-Through Strategies', sequenceOrder: 1, completed: false },
          { id: 'sub-6-2', title: 'Sliding Window Counter Rate Limiting', sequenceOrder: 2, completed: false },
          { id: 'sub-6-3', title: 'Distributed Locks via Redis (Redlock)', sequenceOrder: 3, completed: false },
        ],
      },
    ],
  };
}

export async function generateRoadmapTask(input: RoadmapPromptInput): Promise<RoadmapOutput> {
  const taskName = 'generate-roadmap';

  // 1. Check Redis Cache
  const cached = await getCachedTaskResult<RoadmapOutput>(taskName, input);
  if (cached) return cached;

  // 2. Build initial prompt
  const { systemPrompt, prompt } = buildRoadmapPrompt(input);

  // 3. Execute AI Router
  try {
    let response = await aiRouter.execute({
      prompt,
      systemPrompt,
      jsonMode: true,
    });

    // 4. Parse & Validate JSON
    try {
      const json = JSON.parse(response.text);
      const validated = roadmapOutputSchema.parse(json);
      await setCachedTaskResult(taskName, input, validated);
      return validated;
    } catch (firstErr: any) {
      console.warn(`[AI Task: ${taskName}] Initial Zod validation failed. Retrying with error diagnostics...`, firstErr);

      // Single retry with error appended
      const retryPrompt = `${prompt}\n\nCRITICAL FIX REQUIRED: Your previous response failed schema validation with error:\n${firstErr.message || firstErr}\n\nPlease generate strictly valid JSON matching the exact schema requirements.`;

      response = await aiRouter.execute({
        prompt: retryPrompt,
        systemPrompt,
        jsonMode: true,
      });

      try {
        const jsonRetry = JSON.parse(response.text);
        const validatedRetry = roadmapOutputSchema.parse(jsonRetry);
        await setCachedTaskResult(taskName, input, validatedRetry);
        return validatedRetry;
      } catch (secondErr: any) {
        console.error(`[AI Task: ${taskName}] Zod validation failed on second attempt!`, secondErr);
        return getDefaultFallbackRoadmap(input.targetGoal);
      }
    }
  } catch (routerErr: any) {
    console.warn(`[AI Task: ${taskName}] AI Router unavailable or exhausted. Utilizing structured fallback roadmap.`, routerErr?.message || routerErr);
    return getDefaultFallbackRoadmap(input.targetGoal);
  }
}
