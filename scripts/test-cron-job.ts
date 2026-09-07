import dotenv from 'dotenv';
dotenv.config();

import { connectToDatabase } from '../src/lib/db/mongoose';
import { UserProfile } from '../src/lib/db/models/UserProfile';
import { AiRecommendation } from '../src/lib/db/models/AiRecommendation';
import { GET as cronGET } from '../src/app/api/cron/daily/route';

async function testCronJob() {
  console.log('=== Starting Module 14 Daily Cron Integration Test ===');

  await connectToDatabase();
  console.log('✓ Connected to MongoDB');

  const cronSecret = process.env.CRON_SECRET || '6FveKpB8yZZKL+xdq1ONVlMiRkj22yfH8m8viK21Ksxf';

  // 1. Test unauthorized request
  console.log('\n--- Test 1: Unauthorized Call (Invalid Token) ---');
  const reqUnauthorized = new Request('http://localhost:3000/api/cron/daily', {
    headers: { Authorization: 'Bearer invalid_secret_token' },
  });
  const resUnauthorized = await cronGET(reqUnauthorized);
  console.log('Unauthorized status code:', resUnauthorized.status);
  if (resUnauthorized.status !== 401) {
    throw new Error(`Expected status 401 for unauthorized call, got ${resUnauthorized.status}`);
  }
  console.log('✓ Unauthorized check passed with 401 status');

  // 2. Setup mock active user profile and old pending recommendation for testing
  const mockUserId = 'cron-test-user-123';
  await UserProfile.findOneAndUpdate(
    { userId: mockUserId },
    {
      userId: mockUserId,
      targetGoal: 'Cloud Architect',
      experienceLevel: 'Intermediate',
      currentTopicId: 'ts-generics',
      updatedAt: new Date(),
    },
    { upsert: true, new: true }
  );

  // Old stale recommendation (4 days old)
  const fourDaysAgo = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000);
  await AiRecommendation.findOneAndUpdate(
    { id: 'stale_rec_test_1' },
    {
      id: 'stale_rec_test_1',
      userId: mockUserId,
      title: 'Stale Recommendation',
      category: 'Architecture',
      whyRecommendation: 'Test stale cleanup',
      expectedImpact: 'Medium',
      actionTopicId: 'ts-generics',
      status: 'pending',
      createdAt: fourDaysAgo,
    },
    { upsert: true, new: true }
  );

  // 3. Test authorized request
  console.log('\n--- Test 2: Authorized Call (Valid Bearer CRON_SECRET) ---');
  const reqAuthorized = new Request('http://localhost:3000/api/cron/daily', {
    headers: { Authorization: `Bearer ${cronSecret}` },
  });

  const resAuthorized = await cronGET(reqAuthorized);
  const dataAuthorized = await resAuthorized.json();

  console.log('Authorized status code:', resAuthorized.status);
  console.log('Cron Execution Metrics:', JSON.stringify(dataAuthorized, null, 2));

  if (resAuthorized.status !== 200 || !dataAuthorized.success) {
    throw new Error('Authorized cron call failed!');
  }

  // Cleanup test mock profile
  await UserProfile.deleteOne({ userId: mockUserId });
  await AiRecommendation.deleteOne({ id: 'stale_rec_test_1' });

  console.log('\n==================================================');
  console.log('🎉 MODULE 14 DAILY CRON INTEGRATION TEST PASSED!');
  console.log('==================================================');
  process.exit(0);
}

testCronJob().catch((err) => {
  console.error('❌ Daily Cron Integration Test Failed:', err);
  process.exit(1);
});
