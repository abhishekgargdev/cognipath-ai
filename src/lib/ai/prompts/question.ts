export interface QuestionPromptInput {
  topic: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  type?: 'coding' | 'mcq' | 'output_prediction' | 'debugging' | 'scenario';
  topicId?: string;
}

export function buildQuestionPrompt(input: QuestionPromptInput): { systemPrompt: string; prompt: string } {
  const systemPrompt = `You are a Principal Software Engineer & Technical Screener at CogniPath AI.
Generate a high-quality practice question formatted strictly as valid JSON matching this schema:

{
  "id": "q-${Date.now()}",
  "topicId": "${input.topicId || 'topic-1'}",
  "type": "${input.type || 'coding'}",
  "typeLabel": "Coding Challenge",
  "title": "string",
  "difficulty": "${input.difficulty || 'Intermediate'}",
  "estMinutes": 15,
  "whyThisMatters": "string",
  "prompt": "string",
  "starterCode": "function solution(input) {\\n  // Your code here\\n}",
  "language": "javascript",
  "sequenceOrder": 1,
  "testCases": [
    {
      "id": "tc-1",
      "input": "string or JSON serialized string",
      "expectedOutput": "string",
      "isHidden": false,
      "sequenceOrder": 1
    },
    {
      "id": "tc-2",
      "input": "string",
      "expectedOutput": "string",
      "isHidden": true,
      "sequenceOrder": 2
    }
  ],
  "solutionApproaches": [
    {
      "id": "sa-1",
      "rank": 1,
      "title": "Optimal Approach",
      "subtitle": "O(N) Hash Map Solution",
      "paradigm": "Hash Map",
      "timeComplexity": "O(N)",
      "spaceComplexity": "O(N)",
      "code": "string",
      "language": "javascript",
      "explanation": "string",
      "pros": ["O(N) time complexity"],
      "cons": ["Extra memory"],
      "whenToUse": "When time complexity is prioritized"
    }
  ],
  "conceptExplanation": {
    "topic": "${input.topic}",
    "theoreticalFoundation": "string",
    "underlyingMechanics": "string",
    "stepByStepTrace": ["Step 1...", "Step 2..."],
    "architecturalTakeaways": "string",
    "commonPitfalls": ["Pitfall 1..."]
  }
}

Rules:
- Include at least 2 visible test cases and 1 hidden test case.
- Include 1 or 2 solutionApproaches with full working code, complexity analysis, pros, and cons.
- Include conceptExplanation with step-by-step trace and common pitfalls.
- Return ONLY valid raw JSON without markdown fencing.`;

  const prompt = `Generate a ${input.type || 'coding'} question for topic: "${input.topic}". Difficulty: ${input.difficulty || 'Intermediate'}.`;

  return { systemPrompt, prompt };
}
