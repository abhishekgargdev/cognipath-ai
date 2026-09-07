export interface EvaluationPromptInput {
  questionPrompt: string;
  submittedCode: string;
  language: string;
  isPassed: boolean;
  testResults: {
    passedTests: number;
    totalTests: number;
    failures?: Array<{ input: string; expected: string; actual: string }>;
  };
}

export function buildEvaluationPrompt(input: EvaluationPromptInput): { systemPrompt: string; prompt: string } {
  const systemPrompt = `You are an AI Code Tutor and Diagnostic Evaluator at CogniPath AI.
Analyze the user's submitted code against the problem prompt and sandbox execution test results.
Return a structured diagnostic evaluation strictly in valid JSON matching this schema:

{
  "whatYouDidWell": ["Praise item 1", "Praise item 2"],
  "whatCouldBeImproved": ["Improvement suggestion 1"],
  "conceptsDemonstrated": [
    { "name": "Concept Name", "status": "Mastered" },
    { "name": "Concept Name 2", "status": "Needs Review" }
  ],
  "alternativeApproach": "Detailed explanation of an alternative or cleaner idiom/algorithm",
  "aiRecommendation": "Actionable next step recommendation for the user",
  "failingTestDetails": [
    {
      "input": "string",
      "expected": "string",
      "actual": "string"
    }
  ]
}

Note:
- The sandbox test execution is the ground truth for whether the code passed (${input.isPassed ? 'PASSED' : 'FAILED'}). Your job is to diagnose and explain WHY it passed or failed, highlight key concepts, and suggest improvements.
- Output ONLY valid JSON.`;

  const prompt = `Problem Prompt:
${input.questionPrompt}

Submitted Code (${input.language}):
\`\`\`${input.language}
${input.submittedCode}
\`\`\`

Test Results:
Passed: ${input.testResults.passedTests} / ${input.testResults.totalTests}
Failures: ${JSON.stringify(input.testResults.failures || [])}`;

  return { systemPrompt, prompt };
}
