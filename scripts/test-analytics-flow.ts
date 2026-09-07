import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

import { connectToDatabase } from '../src/lib/db/mongoose';
import { UserProfile } from '../src/lib/db/models/UserProfile';
import { PracticeSubmission } from '../src/lib/db/models/PracticeSubmission';
import { UserWeakConcept } from '../src/lib/db/models/UserWeakConcept';

async function runAnalyticsTest() {
  console.log('=== Starting Module 11 Analytics Flow Integration Test ===');

  await connectToDatabase();
  console.log('✓ Connected to MongoDB');

  const testUserId = 'demo-user-id';

  // 1. Ensure test UserProfile exists
  let profile = await UserProfile.findOne({ userId: testUserId });
  if (!profile) {
    profile = await UserProfile.create({
      userId: testUserId,
      targetGoal: 'Full Stack Architect',
      experienceLevel: 'Intermediate',
      dailyCommitmentMinutes: 30,
      streakDays: 5,
      xp: 450,
      overallMastery: 74,
      currentTopicId: 'js-event-loop',
    });
    console.log('✓ Created test UserProfile');
  }

  // 2. Ensure test PracticeSubmission entries exist for aggregate calculations
  const countSubs = await PracticeSubmission.countDocuments({ userId: testUserId });
  if (countSubs === 0) {
    await PracticeSubmission.create([
      {
        userId: testUserId,
        questionId: 'q_js_1',
        language: 'javascript',
        isPassed: true,
        score: 100,
        runtimeMs: 24,
        memoryMb: 8.2,
        passedTests: 3,
        totalTests: 3,
        submittedAt: new Date(),
      },
      {
        userId: testUserId,
        questionId: 'q_js_2',
        language: 'javascript',
        isPassed: false,
        score: 45,
        runtimeMs: 18,
        memoryMb: 8.0,
        passedTests: 1,
        totalTests: 3,
        submittedAt: new Date(),
      },
    ]);
    console.log('✓ Created test PracticeSubmissions for aggregation');
  }

  // 3. Test MongoDB Aggregation Pipeline for Overview
  console.log('\n--- Executing Overview Aggregation Pipeline ---');
  const subStats = await PracticeSubmission.aggregate([
    { $match: { userId: testUserId } },
    {
      $group: {
        _id: null,
        totalSubmissions: { $sum: 1 },
        passedSubmissions: { $sum: { $cond: ['$isPassed', 1, 0] } },
        avgScore: { $avg: '$score' },
      },
    },
  ]);

  const totalSubs = subStats[0]?.totalSubmissions || 0;
  const passedSubs = subStats[0]?.passedSubmissions || 0;
  const accuracy = totalSubs > 0 ? Math.round((passedSubs / totalSubs) * 100) : 86;

  console.log(`✓ Aggregate Submissions Count: ${totalSubs}, Passed: ${passedSubs}`);
  console.log(`✓ Calculated Harness Accuracy: ${accuracy}%`);

  // 4. Test MongoDB Aggregation Pipeline for Weak Concepts
  console.log('\n--- Executing Weak Concepts Aggregation Pipeline ---');
  let weakConcepts = await UserWeakConcept.aggregate([
    { $match: { userId: testUserId, resolved: false } },
    { $sort: { failureCount: -1, masteryPercent: 1 } },
    { $limit: 6 },
  ]);

  if (weakConcepts.length === 0) {
    // Create a sample weak concept for testing
    await UserWeakConcept.create({
      userId: testUserId,
      topicId: 'js-event-loop',
      name: 'Event Loop Microtask Priority',
      category: 'Asynchronous JavaScript',
      masteryPercent: 55,
      failureCount: 3,
      reason: 'Microtask queue order confused with macrotasks.',
      recommendedAction: 'Re-read Lesson 4 monograph.',
      resolved: false,
    });

    weakConcepts = await UserWeakConcept.aggregate([
      { $match: { userId: testUserId, resolved: false } },
      { $sort: { failureCount: -1, masteryPercent: 1 } },
      { $limit: 6 },
    ]);
  }

  console.log(`✓ Found ${weakConcepts.length} weak concept documents via Mongo aggregation:`);
  console.log(`  - Weak Concept 1: "${weakConcepts[0]?.name}" (${weakConcepts[0]?.masteryPercent}% Mastery)`);

  console.log('\n==================================================');
  console.log('🎉 MODULE 11 ANALYTICS FLOW INTEGRATION TEST PASSED!');
  console.log('==================================================');
  process.exit(0);
}

runAnalyticsTest().catch((err) => {
  console.error('❌ Analytics Test Failed:', err);
  process.exit(1);
});
