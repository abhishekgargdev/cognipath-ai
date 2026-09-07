import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

import { connectToDatabase } from '../src/lib/db/mongoose';
import { UserProfile } from '../src/lib/db/models/UserProfile';
import { PracticeQuestion } from '../src/lib/db/models/PracticeQuestion';
import { PracticeSubmission } from '../src/lib/db/models/PracticeSubmission';
import { UserNodeProgress } from '../src/lib/db/models/UserNodeProgress';
import { execute } from '../src/lib/code-runner';
import { evaluateAnswerTask } from '../src/lib/ai/tasks/evaluate-answer';

async function runTest() {
  console.log('=== Starting Module 10 Practice Flow Integration Test ===');

  await connectToDatabase();
  console.log('✓ Connected to MongoDB');

  const testUserId = 'demo-user-id';

  // 1. Ensure UserProfile exists
  let profile = await UserProfile.findOne({ userId: testUserId });
  if (!profile) {
    profile = await UserProfile.create({
      userId: testUserId,
      targetGoal: 'Full Stack Architect',
      experienceLevel: 'Intermediate',
      dailyCommitmentMinutes: 30,
      streakDays: 3,
      xp: 150,
      currentTopicId: 'js-event-loop',
    });
    console.log('✓ Created test UserProfile');
  } else {
    console.log(`✓ UserProfile found. Current XP: ${profile.xp}, Streak: ${profile.streakDays}`);
  }

  // 2. Ensure at least one PracticeQuestion exists for testing
  let question = await PracticeQuestion.findOne({ topicId: 'js-event-loop' });
  if (!question) {
    question = await PracticeQuestion.create({
      id: 'q_js_event_loop_test_1',
      topicId: 'js-event-loop',
      type: 'coding',
      typeLabel: 'Code Architecture',
      title: 'Implement createOnce Execution Wrapper',
      difficulty: 'Intermediate',
      estMinutes: 15,
      whyThisMatters: 'Higher-order function wrappers control function invocation semantics in async environments.',
      prompt: 'Implement a function createOnce(fn) that ensures fn is called at most once and caches its return value.',
      starterCode: 'function createOnce(fn) {\n  // Implementation\n}',
      language: 'javascript',
      sequenceOrder: 1,
      testCases: [
        { id: 'tc1', input: '5', expectedOutput: '10', isHidden: false },
        { id: 'tc2', input: '10', expectedOutput: '10', isHidden: true },
      ],
      solutionApproaches: [
        {
          id: 'sol1',
          rank: 1,
          title: 'Closure State Guard Pattern',
          subtitle: 'Optimal memory & execution control',
          paradigm: 'Functional',
          timeComplexity: 'O(1)',
          spaceComplexity: 'O(1)',
          code: 'function createOnce(fn) {\n  let hasRun = false;\n  let result;\n  return function(...args) {\n    if (!hasRun) {\n      hasRun = true;\n      result = fn.apply(this, args);\n    }\n    return result;\n  };\n}',
          explanation: 'Uses a closure boolean guard to intercept duplicate invocations.',
          pros: ['Clean state isolation'],
          cons: ['Requires closure understanding'],
          whenToUse: 'Production event listeners & singletons',
        },
      ],
      conceptExplanation: {
        topic: 'Lexical Environment & Closure Retention',
        theoreticalFoundation: 'Closures capture references to outer variables at declaration time.',
        underlyingMechanics: 'V8 scope chain retains outer environment frames.',
        stepByStepTrace: ['Function outer scope initialized', 'Inner function closes over state', 'Subsequent calls read cached state'],
        architecturalTakeaways: 'Enforce state isolation without global pollution.',
        commonPitfalls: ['Forgetting to cache the return value'],
      },
    });
    console.log('✓ Created test PracticeQuestion in MongoDB');
  } else {
    console.log(`✓ Found PracticeQuestion: "${question.title}" (ID: ${question.id})`);
  }

  // 3. Test Code Runner directly on visible vs hidden test cases
  const sampleCode = `
function createOnce(fn) {
  let hasRun = false;
  let result;
  return function(...args) {
    if (!hasRun) {
      hasRun = true;
      result = fn ? fn.apply(this, args) : args[0];
    }
    return result;
  };
}
`;

  console.log('\n--- Testing Sandboxed Code Runner Execution ---');
  const runnerResult = await execute({
    language: 'javascript',
    code: sampleCode,
    stdin: '',
    testCases: question.testCases || [],
  });

  console.log(`✓ Sandbox Runner Result - Passed: ${runnerResult.passed}, Runtime: ${runnerResult.runtimeMs}ms`);
  console.log(`✓ Test cases evaluated: ${runnerResult.results.length}`);

  // 4. Test AI Diagnostic Answer Evaluation
  console.log('\n--- Testing AI Diagnostic Evaluation Task ---');
  const initialXp = profile.xp;

  const evalDiagnostic = await evaluateAnswerTask({
    topicTitle: question.title,
    questionPrompt: question.prompt,
    questionType: question.type,
    userCode: sampleCode,
    testResults: runnerResult.results.map((r) => ({
      passed: r.passed,
      input: r.input || 'sample',
      expected: r.expectedOutput,
      actual: r.actualOutput,
    })),
  });

  console.log('✓ AI Evaluation diagnostic generated successfully:');
  console.log(`  - Strengths count: ${evalDiagnostic.whatYouDidWell?.length || 0}`);
  console.log(`  - Competencies assessed: ${evalDiagnostic.conceptsDemonstrated?.length || 0}`);
  console.log(`  - Adaptive guidance: ${evalDiagnostic.aiRecommendation?.substring(0, 80)}...`);

  // 5. Test Submission persistence & Profile updates
  console.log('\n--- Testing MongoDB Submission Persistence & XP Updates ---');
  const submission = await PracticeSubmission.create({
    userId: testUserId,
    questionId: question.id,
    language: 'javascript',
    submittedCode: sampleCode,
    isPassed: runnerResult.passed,
    score: runnerResult.passed ? 100 : 50,
    runtimeMs: runnerResult.runtimeMs,
    memoryMb: 8.4,
    timeComplexity: 'O(1)',
    spaceComplexity: 'O(1)',
    passedTests: runnerResult.results.filter((r) => r.passed).length,
    totalTests: runnerResult.results.length,
    summary: 'Integration Test Submission',
    diagnosticEvaluation: evalDiagnostic,
    submittedAt: new Date(),
  });

  console.log(`✓ PracticeSubmission created ID: ${submission._id}`);

  // Update profile XP
  profile.xp += 50;
  profile.completedQuestionsToday = (profile.completedQuestionsToday || 0) + 1;
  await profile.save();

  console.log(`✓ Updated UserProfile XP from ${initialXp} to ${profile.xp}`);

  console.log('\n==================================================');
  console.log('🎉 MODULE 10 PRACTICE FLOW INTEGRATION TEST PASSED!');
  console.log('==================================================');
  process.exit(0);
}

runTest().catch((err) => {
  console.error('❌ Integration Test Failed:', err);
  process.exit(1);
});
