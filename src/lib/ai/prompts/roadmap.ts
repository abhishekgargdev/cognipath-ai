export interface RoadmapPromptInput {
  targetGoal: string;
  skillLevel?: string;
  existingSkills?: string[];
}

export function buildRoadmapPrompt(input: RoadmapPromptInput): { systemPrompt: string; prompt: string } {
  const systemPrompt = `You are an expert AI Curriculum & Learning Architect for CogniPath AI.
Your task is to generate a comprehensive, structured adaptive learning roadmap formatted strictly as JSON.
The JSON output must conform to the following TypeScript structure:

{
  "milestones": [
    {
      "id": "milestone-1",
      "title": "string",
      "description": "string",
      "sequenceOrder": 1,
      "targetGoal": "string",
      "nodeIds": ["node-1", "node-2"]
    }
  ],
  "nodes": [
    {
      "id": "node-1",
      "milestoneId": "milestone-1",
      "title": "string",
      "category": "core",
      "categoryLabel": "Core Fundamentals",
      "status": "available",
      "difficulty": "Beginner",
      "estMinutes": 45,
      "masteryPercent": 0,
      "prerequisites": [],
      "whyItMatters": "string",
      "description": "string",
      "sequenceOrder": 1,
      "subtopics": [
        {
          "id": "subtopic-1",
          "title": "string",
          "sequenceOrder": 1,
          "completed": false
        }
      ]
    }
  ]
}

Rules:
- Generate 2 to 4 logical Milestones.
- Generate 3 to 6 Nodes per Milestone.
- Each Node must have 2 to 4 Subtopics.
- Ensure difficulty is one of: "Beginner", "Intermediate", "Advanced".
- Ensure status is "available" for initial nodes and "locked" for downstream prerequisite nodes.
- Do not include markdown formatting or commentary outside the JSON.`;

  const prompt = `Create a learning roadmap for target goal: "${input.targetGoal}".
User Current Skill Level: ${input.skillLevel || 'Beginner'}.
Existing User Skills: ${input.existingSkills?.join(', ') || 'None specified'}.`;

  return { systemPrompt, prompt };
}
