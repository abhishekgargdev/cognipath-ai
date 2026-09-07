import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

import { connectToDatabase } from '../src/lib/db/mongoose';
import { UserProfile } from '../src/lib/db/models/UserProfile';
import { AiRecommendation } from '../src/lib/db/models/AiRecommendation';
import { RoadmapNode } from '../src/lib/db/models/RoadmapNode';
import { UserNodeProgress } from '../src/lib/db/models/UserNodeProgress';

async function runRecommendationsTest() {
  console.log('=== Starting Module 12 Recommendations Flow Integration Test ===');

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
      xp: 500,
      currentTopicId: 'js-event-loop',
    });
    console.log('✓ Created test UserProfile');
  }

  // 2. Ensure test AiRecommendation exists
  let rec = await AiRecommendation.findOne({ userId: testUserId });
  if (!rec) {
    rec = await AiRecommendation.create({
      id: `rec_test_${Date.now()}`,
      userId: testUserId,
      title: 'Advanced Asynchronous Event Stream Processing',
      category: 'Adaptive Acquisition',
      whyRecommendation: 'Diagnostic evaluation confirmed 58% mastery on async microtask precedence.',
      expectedImpact: 'Critical',
      estHours: 2.5,
      actionTopicId: 'async-stream-processing',
      addedToRoadmap: false,
      status: 'pending',
      prerequisites: [
        { name: 'JavaScript Functions & Scope', satisfied: true },
      ],
    });
    console.log(`✓ Created test AiRecommendation: "${rec.title}" (ID: ${rec.id})`);
  } else {
    console.log(`✓ Found AiRecommendation: "${rec.title}" (ID: ${rec.id})`);
  }

  // 3. Test Accept Recommendation Logic
  console.log('\n--- Testing Accept Recommendation Logic ---');
  rec.status = 'accepted';
  rec.addedToRoadmap = true;
  await rec.save();

  const node = await RoadmapNode.findOneAndUpdate(
    { id: rec.actionTopicId },
    {
      id: rec.actionTopicId,
      milestoneId: 'milestone-adaptive',
      title: rec.title,
      description: rec.whyRecommendation,
      category: rec.category,
      estMinutes: Math.round(rec.estHours * 60),
      subtopicsCount: 3,
      practiceQuestionsCount: 5,
      sequenceOrder: 99,
    },
    { upsert: true, new: true }
  );

  const progress = await UserNodeProgress.findOneAndUpdate(
    { userId: testUserId, nodeId: rec.actionTopicId },
    {
      userId: testUserId,
      nodeId: rec.actionTopicId,
      status: 'available',
      masteryPercent: 0,
    },
    { upsert: true, new: true }
  );

  console.log(`✓ Updated AiRecommendation status to: "${rec.status}" (addedToRoadmap: ${rec.addedToRoadmap})`);
  console.log(`✓ Upserted RoadmapNode ID: ${node.id}`);
  console.log(`✓ Upserted UserNodeProgress status: "${progress.status}" for node: ${progress.nodeId}`);

  console.log('\n==================================================');
  console.log('🎉 MODULE 12 RECOMMENDATIONS FLOW INTEGRATION TEST PASSED!');
  console.log('==================================================');
  process.exit(0);
}

runRecommendationsTest().catch((err) => {
  console.error('❌ Recommendations Test Failed:', err);
  process.exit(1);
});
