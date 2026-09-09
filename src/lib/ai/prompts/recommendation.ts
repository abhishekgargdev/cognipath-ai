export interface RecommendationPromptInput {
  userId: string;
  targetGoal?: string;
  experienceLevel?: string;
  learningReason?: string;
  enrolledSkills?: string[];
  completedTopics?: string[];
  weakConcepts?: string[];
}

export function buildRecommendationPrompt(input: RecommendationPromptInput): { systemPrompt: string; prompt: string } {
  const systemPrompt = `You are a Senior AI Career & Curriculum Architect at CogniPath AI.
Analyze the user's career interest, currently enrolled skills, experience level, and current market/industry trends to suggest 2 to 4 high-value complementary technical skills or advanced topics that the user should consider adding to upgrade their roadmap.

Return JSON formatted as an array of objects matching this exact schema:

[
  {
    "id": "rec-${Date.now()}-1",
    "userId": "${input.userId}",
    "title": "Skill Name or Advanced Topic Title",
    "category": "Market Trend / Core Skill / Weakness Patch / Advanced Optimization",
    "whyRecommendation": "Clear, compelling rationale linking their career goal, enrolled skills, and market demand.",
    "expectedImpact": "High",
    "estHours": 3,
    "actionTopicId": "skill-slug-id",
    "addedToRoadmap": false,
    "status": "pending",
    "prerequisites": [
      { "name": "Prerequisite Skill Name", "satisfied": true }
    ]
  }
]

Rules:
- Suggest skills that complement their existing enrolled skills and align with high market demand for their target goal.
- Do NOT suggest skills they have already enrolled in.
- expectedImpact must be one of: 'Critical', 'High', 'Medium', 'Elective'.
- status must be 'pending'.
- Output ONLY valid raw JSON with no markdown code blocks or additional text.`;

  const prompt = `User ID: ${input.userId}
Target Career Goal: ${input.targetGoal || 'Full Stack Engineer'}
Experience Level: ${input.experienceLevel || 'Intermediate'}
Learning Motivation: ${input.learningReason || 'Upskilling'}
Currently Enrolled Skills: ${input.enrolledSkills?.join(', ') || 'None'}
Completed Topics: ${input.completedTopics?.join(', ') || 'None'}
Weak Concepts Identified: ${input.weakConcepts?.join(', ') || 'None'}`;

  return { systemPrompt, prompt };
}
