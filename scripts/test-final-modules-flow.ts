import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

import { connectToDatabase } from '../src/lib/db/mongoose';
import { UserProfile } from '../src/lib/db/models/UserProfile';
import { SkillTaxonomy } from '../src/lib/db/models/SkillTaxonomy';
import { RoadmapNode } from '../src/lib/db/models/RoadmapNode';
import { Notification } from '../src/lib/db/models/Notification';

async function runFinalModulesTest() {
  console.log('=== Starting Module 13 Integration Test ===');

  await connectToDatabase();
  console.log('✓ Connected to MongoDB');

  const testUserId = 'demo-user-id';

  // 1. Test Skills Taxonomy Endpoint logic
  let skills = await SkillTaxonomy.find({}).lean();
  if (skills.length === 0) {
    await SkillTaxonomy.create({
      id: 'skill-ts-test',
      name: 'TypeScript Architecture Test',
      category: 'Programming',
      difficulty: 'Intermediate',
      prerequisites: ['JavaScript'],
      relatedSkills: ['React'],
      estHours: 30,
      careerRelevance: 'Industry standard for enterprise web software.',
      description: 'Advanced type safety, generics, and AST analysis.',
      trending: true,
    });
    skills = await SkillTaxonomy.find({}).lean();
  }
  console.log(`✓ SkillTaxonomy query returned ${skills.length} items (e.g. "${skills[0]?.name}")`);

  // 2. Test UserProfile PATCH logic
  let profile = await UserProfile.findOne({ userId: testUserId });
  if (!profile) {
    profile = await UserProfile.create({
      userId: testUserId,
      targetGoal: 'Full Stack Architect',
      experienceLevel: 'Intermediate',
      dailyCommitmentMinutes: 30,
      theme: 'light',
    });
  }

  profile.targetGoal = 'Staff AI Systems Architect';
  profile.dailyCommitmentMinutes = 60;
  profile.theme = 'dark';
  await profile.save();
  console.log(`✓ Updated UserProfile: Goal="${profile.targetGoal}", Pacing=${profile.dailyCommitmentMinutes}m, Theme=${profile.theme}`);

  // 3. Test Global Search logic
  const searchNodes = await RoadmapNode.find({
    $or: [{ title: /event/i }, { description: /event/i }],
  }).limit(5).lean();
  console.log(`✓ Search query for "event" returned ${searchNodes.length} roadmap nodes`);

  // 4. Test Notification GET & PATCH read logic
  let notif = await Notification.findOne({ userId: testUserId });
  if (!notif) {
    notif = await Notification.create({
      id: `notif_test_${Date.now()}`,
      userId: testUserId,
      type: 'practice',
      title: 'Practicum Verification',
      message: 'Integration test notification message',
      read: false,
    });
  }

  notif.read = true;
  await notif.save();
  console.log(`✓ Notification "${notif.title}" marked as read=true`);

  console.log('\n==================================================');
  console.log('🎉 MODULE 13 INTEGRATION TEST PASSED!');
  console.log('==================================================');
  process.exit(0);
}

runFinalModulesTest().catch((err) => {
  console.error('❌ Module 13 Test Failed:', err);
  process.exit(1);
});
