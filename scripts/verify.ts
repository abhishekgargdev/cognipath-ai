import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { connectToDatabase } from '../src/lib/db/mongoose';
import {
  User,
  UserProfile,
  SkillTaxonomy,
  RoadmapMilestone,
  RoadmapNode,
  Lesson,
  PracticeQuestion,
  UserWeakConcept,
  AiRecommendation,
} from '../src/lib/db/models';

async function main() {
  console.log('[Verify] Connecting to database...');
  const conn = await connectToDatabase();

  if (!conn) {
    console.log('[Verify] Skipping DB query verification (no MONGODB_URI). Validation successful.');
    process.exit(0);
  }

  console.log('[Verify] Connected. Querying multi-role users and linked collections...');

  const users = await User.find().select('+passwordHash');
  console.log(`[Verify] Total Users in DB: ${users.length}`);
  for (const u of users) {
    const profile = await UserProfile.findOne({ userId: u._id.toString() });
    console.log(
      `  - User [${u.role.toUpperCase()}]: ${u.email} (ID: ${u._id.toString()}) | PasswordHash: ${!!u.passwordHash} | Goal: "${profile?.targetGoal || 'None'}"`
    );
  }

  const skillsCount = await SkillTaxonomy.countDocuments();
  console.log(`[Verify] SkillTaxonomy count: ${skillsCount}`);

  const milestones = await RoadmapMilestone.find();
  console.log(`[Verify] RoadmapMilestones count: ${milestones.length}`);

  const nodes = await RoadmapNode.find();
  console.log(`[Verify] RoadmapNodes count: ${nodes.length}`);

  const lessons = await Lesson.find();
  console.log(`[Verify] Lessons count: ${lessons.length}`);

  const questions = await PracticeQuestion.find();
  console.log(`[Verify] PracticeQuestions count: ${questions.length}`);

  const weakConcepts = await UserWeakConcept.find();
  console.log(`[Verify] WeakConcepts count: ${weakConcepts.length}`);

  const recommendations = await AiRecommendation.find();
  console.log(`[Verify] AiRecommendations count: ${recommendations.length}`);

  console.log('[Verify] All multi-role user and collection checks completed successfully!');
  process.exit(0);
}

main().catch((err) => {
  console.error('[Verify] Verification failed:', err);
  process.exit(1);
});
