export interface RecommendationPromptInput {
  userId: string;
  targetGoal?: string;
  completedTopics?: string[];
  weakConcepts?: string[];
}

export function buildRecommendationPrompt(input: RecommendationPromptInput): { systemPrompt: string; prompt: string } {
  const systemPrompt = `You are an Adaptive Learning AI Coach at CogniPath AI.
Generate targeted skill recommendations based on the user's progress and weak concepts.
Return JSON formatted as an array of objects matching this schema:

[
  {
    "id": "rec-${Date.now()}-1",
    "userId": "${input.userId}",
    "title": "string",
    "category": "Core Skill / Weakness Patch / Advanced Optimization",
    "whyRecommendation": "string",
    "expectedImpact": "High",
    "estHours": 2,
    "actionTopicId": "topic-id-1",
    "addedToRoadmap": false,
    "status": "pending",
    "prerequisites": [
      { "name": "Prerequisite Topic Name", "satisfied": true }
    ]
  }
]

Rules:
- Generate 1 to 3 personalized recommendations.
- expectedImpact must be one of: 'Critical', 'High', 'Medium', 'Elective'.
- status must be 'pending'.
- Output ONLY valid raw JSON with no markdown code blocks or additional text.`;

  const prompt = `User ID: ${input.userId}
Target Goal: ${input.targetGoal || 'Full Stack Engineer'}
Completed Topics: ${input.completedTopics?.join(', ') || 'None'}
Weak Concepts Identified: ${input.weakConcepts?.join(', ') || 'None'}`;

  return { systemPrompt, prompt };
}
