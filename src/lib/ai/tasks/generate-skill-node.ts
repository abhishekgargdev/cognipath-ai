import { z } from 'zod';
import { aiRouter } from '../router';
import { getCachedTaskResult, setCachedTaskResult } from '../cache';

export const generatedSkillNodeSchema = z.object({
  skillId: z.string(),
  milestoneTitle: z.string(),
  milestoneDescription: z.string(),
  title: z.string(),
  category: z.string(),
  categoryLabel: z.string(),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  estMinutes: z.number().min(15).max(180).default(30),
  prerequisites: z.array(z.string()).default([]),
  whyItMatters: z.string(),
  description: z.string(),
  subtopics: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      sequenceOrder: z.number(),
    })
  ).min(2),
  careerRelevance: z.string().default('Essential industry competency for modern software development.'),
});

export type GeneratedSkillNode = z.infer<typeof generatedSkillNodeSchema>;

export interface GenerateSkillNodeInput {
  skillName: string;
  targetGoal?: string;
  experienceLevel?: string;
}

export async function generateSkillNodeTask(input: GenerateSkillNodeInput): Promise<GeneratedSkillNode> {
  const taskName = 'generate-skill-node';

  const cached = await getCachedTaskResult<GeneratedSkillNode>(taskName, input);
  if (cached) return cached;

  const skillSlug = input.skillName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  const skillId = `skill-${skillSlug}`;

  const systemPrompt = `You are a Principal Curriculum Architect at CogniPath AI.
Generate a structured learning node and milestone specification for the skill: "${input.skillName}".
Target Career Goal: ${input.targetGoal || 'Software Engineer'}
Target Level: ${input.experienceLevel || 'Intermediate'}

Return ONLY raw JSON with no markdown formatting matching this exact structure:
{
  "skillId": "${skillId}",
  "milestoneTitle": "Title of the milestone grouping this skill",
  "milestoneDescription": "High-level goal description of this milestone",
  "title": "${input.skillName}",
  "category": "core-engineering",
  "categoryLabel": "Core Engineering Discipline",
  "difficulty": "Intermediate",
  "estMinutes": 45,
  "prerequisites": [],
  "whyItMatters": "Why mastering this skill is critical in industry practice.",
  "description": "Comprehensive overview of core concepts, paradigms, and runtime mechanics covered in this node.",
  "subtopics": [
    { "id": "sub-${skillSlug}-1", "title": "First Subtopic Concept", "sequenceOrder": 1 },
    { "id": "sub-${skillSlug}-2", "title": "Second Subtopic Concept", "sequenceOrder": 2 },
    { "id": "sub-${skillSlug}-3", "title": "Third Subtopic Concept", "sequenceOrder": 3 }
  ],
  "careerRelevance": "Industrial applications and practical impact."
}

Rules:
- difficulty must be one of: 'Beginner', 'Intermediate', 'Advanced'.
- subtopics must have at least 2 distinct, highly specific practical technical subtopics.
- Output ONLY valid JSON with no markdown code fences or commentary.`;

  const prompt = `Generate standard curriculum specification for skill: ${input.skillName}`;

  let response;
  try {
    response = await aiRouter.execute({
      prompt,
      systemPrompt,
      jsonMode: true,
    });
  } catch (aiErr: any) {
    console.warn(`[AI Task: ${taskName}] AI Router unavailable, returning deterministic curriculum node for ${input.skillName}:`, aiErr?.message || aiErr);
    return {
      skillId,
      milestoneTitle: `${input.skillName} Core Competencies`,
      milestoneDescription: `Master foundational principles and practical usage of ${input.skillName}.`,
      title: input.skillName,
      category: 'core-engineering',
      categoryLabel: 'Core Engineering Discipline',
      difficulty: (['Beginner', 'Intermediate', 'Advanced'].includes(input.experienceLevel || '') ? input.experienceLevel as any : 'Intermediate'),
      estMinutes: 40,
      prerequisites: [],
      whyItMatters: `Essential for technical proficiency in ${input.skillName}.`,
      description: `Comprehensive guide and hands-on exercises covering ${input.skillName} core mechanics.`,
      subtopics: [
        { id: `sub-${skillSlug}-1`, title: `${input.skillName} Fundamentals & Setup`, sequenceOrder: 1 },
        { id: `sub-${skillSlug}-2`, title: `Core Implementation & Best Practices`, sequenceOrder: 2 },
        { id: `sub-${skillSlug}-3`, title: `Advanced Usage & Optimization`, sequenceOrder: 3 },
      ],
      careerRelevance: `High-demand skill widely applied in industry production environments.`,
    };
  }

  try {
    const json = JSON.parse(response.text);
    const validated = generatedSkillNodeSchema.parse(json);
    await setCachedTaskResult(taskName, input, validated, 30 * 24 * 3600); // 30 days cache
    return validated;
  } catch (firstErr: any) {
    console.warn(`[AI Task: ${taskName}] Initial Zod parse failed, retrying...`, firstErr);

    try {
      const retryPrompt = `${prompt}\n\nCRITICAL FIX REQUIRED: Previous output failed validation with error:\n${firstErr.message || firstErr}\nEnsure strictly valid JSON output.`;

      response = await aiRouter.execute({
        prompt: retryPrompt,
        systemPrompt,
        jsonMode: true,
      });

      const jsonRetry = JSON.parse(response.text);
      const validatedRetry = generatedSkillNodeSchema.parse(jsonRetry);
      await setCachedTaskResult(taskName, input, validatedRetry, 30 * 24 * 3600);
      return validatedRetry;
    } catch (secondErr: any) {
      console.error(`[AI Task: ${taskName}] Fallback triggered on Zod retry error:`, secondErr);
      return {
        skillId,
        milestoneTitle: `${input.skillName} Core Competencies`,
        milestoneDescription: `Master foundational principles and practical usage of ${input.skillName}.`,
        title: input.skillName,
        category: 'core-engineering',
        categoryLabel: 'Core Engineering Discipline',
        difficulty: (['Beginner', 'Intermediate', 'Advanced'].includes(input.experienceLevel || '') ? input.experienceLevel as any : 'Intermediate'),
        estMinutes: 40,
        prerequisites: [],
        whyItMatters: `Essential for technical proficiency in ${input.skillName}.`,
        description: `Comprehensive guide and hands-on exercises covering ${input.skillName} core mechanics.`,
        subtopics: [
          { id: `sub-${skillSlug}-1`, title: `${input.skillName} Fundamentals & Setup`, sequenceOrder: 1 },
          { id: `sub-${skillSlug}-2`, title: `Core Implementation & Best Practices`, sequenceOrder: 2 },
          { id: `sub-${skillSlug}-3`, title: `Advanced Usage & Optimization`, sequenceOrder: 3 },
        ],
        careerRelevance: `High-demand skill widely applied in industry production environments.`,
      };
    }
  }
}
