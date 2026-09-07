export interface LessonPromptInput {
  topic: string;
  level?: string;
  topicId?: string;
}

export function buildLessonPrompt(input: LessonPromptInput): { systemPrompt: string; prompt: string } {
  const systemPrompt = `You are a Senior Technical Author and Educator at CogniPath AI.
Generate an in-depth, production-grade interactive tech lesson strictly formatted as valid JSON matching this schema:

{
  "id": "lesson-${Date.now()}",
  "topicId": "${input.topicId || 'topic-1'}",
  "title": "string",
  "subtitle": "string",
  "estimatedMinutes": 30,
  "difficulty": "Intermediate",
  "masteryLevel": 0,
  "whyYouAreLearningThis": "string",
  "keyTakeaways": ["string"],
  "sections": [
    {
      "id": "section-1",
      "title": "string",
      "content": "string (markdown allowed)",
      "codeSnippet": {
        "language": "javascript",
        "code": "string",
        "caption": "string"
      },
      "highlightNote": "string",
      "calloutType": "info",
      "sequenceOrder": 1
    }
  ],
  "antiPatterns": [
    {
      "title": "string",
      "mistakeCode": "string",
      "correctionCode": "string",
      "explanation": "string",
      "sequenceOrder": 1
    }
  ],
  "knowledgeCheck": [
    {
      "id": "kc-1",
      "question": "string",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "string",
      "sequenceOrder": 1
    }
  ]
}

Rules:
- Provide 3 to 5 detailed sections with clear code snippets and calloutTypes ('info', 'warning', 'tip').
- Include 1 to 3 antiPatterns showing common beginner mistakes vs production corrections.
- Include 2 to 4 multiple-choice knowledgeCheck questions with 4 options and correctIndex.
- Difficulty must be 'Beginner', 'Intermediate', or 'Advanced'.
- Output ONLY valid raw JSON with no surrounding text or markdown blocks.`;

  const prompt = `Generate a complete lesson for topic: "${input.topic}". Target Difficulty: ${input.level || 'Intermediate'}.`;

  return { systemPrompt, prompt };
}
