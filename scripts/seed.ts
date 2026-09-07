import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env or .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { connectToDatabase } from '../src/lib/db/mongoose';
import {
  User,
  UserProfile,
  UserSkill,
  SkillTaxonomy,
  RoadmapMilestone,
  RoadmapNode,
  RoadmapPrerequisite,
  UserNodeProgress,
  Lesson,
  PracticeQuestion,
  UserWeakConcept,
  AiRecommendation,
  DailyStreakLog,
  Notification,
} from '../src/lib/db/models';
import { hashPassword } from '../src/lib/auth/password';

async function main() {
  console.log('[Seed] Starting database seed...');
  const conn = await connectToDatabase();

  if (!conn) {
    console.warn('[Seed] Warning: MONGODB_URI not provided or database connection skipped.');
    console.log('[Seed] Seed validation complete (dry run mode).');
    process.exit(0);
  }

  console.log('[Seed] Connected to MongoDB via Mongoose.');

  // 1. Hash default password for all seeded accounts
  const defaultPassword = 'Test@1234';
  const hashedPassword = await hashPassword(defaultPassword);

  // 2. Seed Users for every role type
  const usersToSeed = [
    {
      email: 'student@cognipath.ai',
      name: 'Alex Rivera (Student)',
      role: 'student' as const,
      status: 'active' as const,
      passwordHash: hashedPassword,
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    {
      email: 'mentor@cognipath.ai',
      name: 'Dr. Sarah Chen (Mentor)',
      role: 'mentor' as const,
      status: 'active' as const,
      passwordHash: hashedPassword,
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    },
    {
      email: 'admin@cognipath.ai',
      name: 'Marcus Vance (Admin)',
      role: 'admin' as const,
      status: 'active' as const,
      passwordHash: hashedPassword,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
  ];

  const seededUsers: Record<string, any> = {};

  for (const u of usersToSeed) {
    let userDoc = await User.findOne({ email: u.email });
    if (!userDoc) {
      userDoc = await User.create(u);
    } else {
      userDoc.name = u.name;
      userDoc.role = u.role;
      userDoc.passwordHash = u.passwordHash;
      await userDoc.save();
    }
    seededUsers[u.role] = userDoc;
    console.log(`[Seed] Seeded ${u.role.toUpperCase()} user: ${u.email} (ID: ${userDoc._id.toString()})`);
  }

  const studentId = seededUsers['student']._id.toString();
  const mentorId = seededUsers['mentor']._id.toString();
  const adminId = seededUsers['admin']._id.toString();

  // 3. Seed Skills Taxonomy
  const skillsData = [
    {
      id: 'js',
      name: 'JavaScript',
      category: 'Programming',
      difficulty: 'Beginner' as const,
      prerequisites: [],
      relatedSkills: ['TypeScript', 'React', 'Node.js'],
      estHours: 40,
      careerRelevance: 'Essential for all Web and Full Stack engineers across the industry.',
      description: 'The foundational language of the web: closures, prototypes, event loops, and ESNext modern syntax.',
      trending: true,
    },
    {
      id: 'ts',
      name: 'TypeScript',
      category: 'Programming',
      difficulty: 'Intermediate' as const,
      prerequisites: ['JavaScript'],
      relatedSkills: ['React', 'Next.js', 'Node.js'],
      estHours: 30,
      careerRelevance: 'Standard requirement in 85%+ of modern enterprise engineering teams.',
      description: 'Static type checking, generics, utility types, union types, and interface contracts.',
      trending: true,
    },
    {
      id: 'react',
      name: 'React',
      category: 'Frontend',
      difficulty: 'Intermediate' as const,
      prerequisites: ['JavaScript', 'HTML', 'CSS'],
      relatedSkills: ['Next.js', 'TypeScript', 'State Management'],
      estHours: 35,
      careerRelevance: 'The dominant UI library powering millions of modern web applications.',
      trending: true,
    },
  ];

  for (const skill of skillsData) {
    await SkillTaxonomy.updateOne({ id: skill.id }, { $set: skill }, { upsert: true });
  }
  console.log(`[Seed] Seeded ${skillsData.length} skills into skills_taxonomies.`);

  // Seed UserSkills for Student
  const userSkillsData = [
    { userId: studentId, skillId: 'js', level: 'Intermediate' as const },
    { userId: studentId, skillId: 'ts', level: 'Intermediate' as const },
    { userId: studentId, skillId: 'react', level: 'Intermediate' as const },
  ];
  for (const us of userSkillsData) {
    await UserSkill.updateOne({ userId: us.userId, skillId: us.skillId }, { $set: us }, { upsert: true });
  }

  // 4. Seed 1 Milestone with Nodes & Prerequisites
  const milestoneData = {
    id: 'ms-foundations',
    title: 'FOUNDATIONS',
    description: 'Core runtime principles, functional paradigms, and language mechanics',
    sequenceOrder: 1,
    targetGoal: 'Full Stack Architect',
    nodeIds: ['js-fundamentals', 'functions-scope', 'js-closures'],
  };

  await RoadmapMilestone.updateOne({ id: milestoneData.id }, { $set: milestoneData }, { upsert: true });

  const nodesData = [
    {
      id: 'js-fundamentals',
      milestoneId: 'ms-foundations',
      title: 'JavaScript Fundamentals',
      category: 'foundations',
      categoryLabel: 'Foundations',
      status: 'completed' as const,
      difficulty: 'Beginner' as const,
      estMinutes: 45,
      masteryPercent: 96,
      prerequisites: [],
      whyItMatters: 'Rock-solid execution context, primitive types, and memory allocation are the bedrock for debugging.',
      description: 'Variables, coercion, scopes, reference types, and standard ES2022 features.',
      sequenceOrder: 1,
      subtopics: [
        { id: 'st-1', title: 'Primitive vs Reference types', sequenceOrder: 1, completed: true },
        { id: 'st-2', title: 'Type coercion & strict equality', sequenceOrder: 2, completed: true },
      ],
    },
    {
      id: 'functions-scope',
      milestoneId: 'ms-foundations',
      title: 'Functions & Scope Chain',
      category: 'foundations',
      categoryLabel: 'Foundations',
      status: 'completed' as const,
      difficulty: 'Beginner' as const,
      estMinutes: 50,
      masteryPercent: 91,
      prerequisites: ['JavaScript Fundamentals'],
      whyItMatters: 'Functions are first-class citizens in JS.',
      description: 'First-class citizens, higher-order functions, arrow functions, and scope lookup chain.',
      sequenceOrder: 2,
      subtopics: [
        { id: 'st-4', title: 'Lexical Environment and scope resolution', sequenceOrder: 1, completed: true },
      ],
    },
    {
      id: 'js-closures',
      milestoneId: 'ms-foundations',
      title: 'Closures & Scope Retention',
      category: 'foundations',
      categoryLabel: 'Foundations',
      status: 'in_progress' as const,
      difficulty: 'Intermediate' as const,
      estMinutes: 40,
      masteryPercent: 78,
      prerequisites: ['Functions & Scope Chain'],
      whyItMatters: 'Closures power React hooks (useState, useEffect), module encapsulation, factory functions, and currying.',
      description: 'How functions retain access to outer lexical environments even after parent executions return.',
      sequenceOrder: 3,
      subtopics: [
        { id: 'st-7', title: 'Scope chain retention in the heap', sequenceOrder: 1, completed: true },
        { id: 'st-8', title: 'Data privacy & factory patterns', sequenceOrder: 2, completed: true },
      ],
    },
  ];

  for (const node of nodesData) {
    await RoadmapNode.updateOne({ id: node.id }, { $set: node }, { upsert: true });
    await UserNodeProgress.updateOne(
      { userId: studentId, nodeId: node.id },
      {
        $set: {
          userId: studentId,
          nodeId: node.id,
          status: node.status,
          masteryPercent: node.masteryPercent,
        },
      },
      { upsert: true }
    );
  }

  // Prerequisites
  const prereqs = [
    { nodeId: 'functions-scope', prerequisiteNodeId: 'js-fundamentals' },
    { nodeId: 'js-closures', prerequisiteNodeId: 'functions-scope' },
  ];
  for (const p of prereqs) {
    await RoadmapPrerequisite.updateOne(
      { nodeId: p.nodeId, prerequisiteNodeId: p.prerequisiteNodeId },
      { $set: p },
      { upsert: true }
    );
  }

  // 5. Seed Lesson & Practice Question
  const sampleLesson = {
    id: 'les-js-closures',
    topicId: 'js-closures',
    title: 'Closures & Lexical Scope Retention',
    subtitle: 'Deep architectural mechanics of inner function state preservation.',
    estimatedMinutes: 30,
    difficulty: 'Intermediate' as const,
    masteryLevel: 78,
    whyYouAreLearningThis: 'Closures form the underlying foundation of React state hooks, module privacy, and currying.',
    keyTakeaways: [
      'Closures capture variables by reference, not by value.',
      'Memory references remain active as long as the inner function is reachable.',
    ],
    sections: [
      {
        id: 'sec-1',
        title: 'Lexical Environment Preservation',
        content: 'When an outer function completes execution, its variables live on if referenced by an inner returned function.',
        codeSnippet: {
          language: 'javascript',
          code: 'function createCounter() {\n  let count = 0;\n  return () => ++count;\n}',
          caption: 'Basic Closure Counter Pattern',
        },
        sequenceOrder: 1,
      },
    ],
    antiPatterns: [
      {
        title: 'Loop Variable Capture with var',
        mistakeCode: 'for (var i = 0; i < 3; i++) { setTimeout(() => console.log(i), 10); }',
        correctionCode: 'for (let i = 0; i < 3; i++) { setTimeout(() => console.log(i), 10); }',
        explanation: 'var is function-scoped while let creates a new binding per loop iteration.',
        sequenceOrder: 1,
      },
    ],
  };
  await Lesson.updateOne({ id: sampleLesson.id }, { $set: sampleLesson }, { upsert: true });

  const sampleQuestion = {
    id: 'pq-closure-counter',
    topicId: 'js-closures',
    type: 'coding' as const,
    typeLabel: 'Coding Exercise',
    title: 'Implement Encapsulated Counter Factory',
    difficulty: 'Intermediate' as const,
    estMinutes: 15,
    whyThisMatters: 'Demonstrates private state encapsulation without ES6 class fields.',
    prompt: 'Write a function `createPrivateCounter()` returning an object with `increment()` and `getValue()` methods.',
    starterCode: 'function createPrivateCounter() {\n  // Write implementation\n}',
    language: 'javascript',
    sequenceOrder: 1,
    testCases: [
      { id: 'tc-1', input: 'const c = createPrivateCounter(); c.increment(); c.getValue()', expectedOutput: '1', isHidden: false },
    ],
    solutionApproaches: [
      {
        id: 'sol-1',
        rank: 1,
        title: 'Closure Lexical Binding',
        subtitle: 'Standard factory closure',
        paradigm: 'Functional',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        code: 'function createPrivateCounter() {\n  let count = 0;\n  return {\n    increment: () => ++count,\n    getValue: () => count\n  };\n}',
        explanation: 'Encloses the `count` primitive in closure memory.',
        pros: ['Encapsulated state', 'Simple'],
        cons: ['Slightly higher memory per instance'],
        whenToUse: 'When private state without class syntax is required.',
      },
    ],
  };
  await PracticeQuestion.updateOne({ id: sampleQuestion.id }, { $set: sampleQuestion }, { upsert: true });

  // 6. Seed User Profiles using REAL Mongo User IDs
  await UserProfile.updateOne(
    { userId: studentId },
    {
      $set: {
        userId: studentId,
        targetGoal: 'Full Stack Architect',
        experienceLevel: 'Intermediate',
        dailyCommitmentMinutes: 30,
        learningPreferences: ['code-first', 'theoretical-monographs'],
        streakDays: 18,
        xp: 2450,
        overallMastery: 72,
        completedQuestionsToday: 2,
        totalQuestionsTargetToday: 5,
        currentTopicId: 'js-closures',
        theme: 'light',
      },
    },
    { upsert: true }
  );

  await UserProfile.updateOne(
    { userId: mentorId },
    {
      $set: {
        userId: mentorId,
        targetGoal: 'Pedagogical Mentor',
        experienceLevel: 'Advanced',
        dailyCommitmentMinutes: 60,
        learningPreferences: ['code-first', 'system-design'],
        streakDays: 45,
        xp: 9800,
        overallMastery: 95,
        completedQuestionsToday: 5,
        totalQuestionsTargetToday: 5,
        currentTopicId: 'sys-design-basics',
        theme: 'dark',
      },
    },
    { upsert: true }
  );

  await UserProfile.updateOne(
    { userId: adminId },
    {
      $set: {
        userId: adminId,
        targetGoal: 'Platform Administrator',
        experienceLevel: 'Advanced',
        dailyCommitmentMinutes: 45,
        learningPreferences: ['code-first'],
        streakDays: 30,
        xp: 12000,
        overallMastery: 99,
        completedQuestionsToday: 5,
        totalQuestionsTargetToday: 5,
        currentTopicId: 'nextjs-app-router',
        theme: 'dark',
      },
    },
    { upsert: true }
  );

  // 7. Seed Weak Concepts, AI Recommendations, Streak Logs, and Notifications linked to Student Mongo ID
  await UserWeakConcept.updateOne(
    { userId: studentId, topicId: 'js-closures' },
    {
      $set: {
        userId: studentId,
        topicId: 'js-closures',
        name: 'Closure Lexical Retention',
        category: 'Foundations',
        masteryPercent: 58,
        failureCount: 2,
        reason: 'Struggles with variable reference lifetimes inside nested async callbacks.',
        recommendedAction: 'Review microtask queue priorities and run targeted async execution quizzes.',
        resolved: false,
      },
    },
    { upsert: true }
  );

  await AiRecommendation.updateOne(
    { id: 'rec-event-loop' },
    {
      $set: {
        id: 'rec-event-loop',
        userId: studentId,
        title: 'Reinforce: Event Loop & Microtask Priority',
        category: 'Targeted Remediation',
        whyRecommendation: 'Recent practice evaluation showed a 58% success rate on Promise vs setTimeout order execution.',
        expectedImpact: 'High',
        estHours: 1.5,
        actionTopicId: 'js-closures',
        addedToRoadmap: true,
        status: 'pending',
      },
    },
    { upsert: true }
  );

  await DailyStreakLog.updateOne(
    { userId: studentId, activityDate: new Date().setHours(0, 0, 0, 0) },
    {
      $set: {
        userId: studentId,
        activityDate: new Date().setHours(0, 0, 0, 0),
        questionsCompleted: 2,
        minutesSpent: 30,
        xpEarned: 100,
      },
    },
    { upsert: true }
  );

  await Notification.updateOne(
    { userId: studentId, title: "Today's 5 Practice Questions Ready" },
    {
      $set: {
        userId: studentId,
        type: 'practice',
        title: "Today's 5 Practice Questions Ready",
        message: 'Focus: Closures & Async Patterns. Estimated time: ~20 mins.',
        read: false,
        actionView: 'practice',
      },
    },
    { upsert: true }
  );

  console.log('[Seed] All multi-role users and linked data seeded successfully!');
  console.log(`[Seed] Log in with any account using password: "${defaultPassword}"`);
  console.log('  - Student: student@cognipath.ai');
  console.log('  - Mentor:  mentor@cognipath.ai');
  console.log('  - Admin:   admin@cognipath.ai');
  process.exit(0);
}

main().catch((err) => {
  console.error('[Seed] Error running seed script:', err);
  process.exit(1);
});
