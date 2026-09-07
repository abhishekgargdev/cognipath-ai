import { z } from 'zod';
import { aiRouter } from '../router';
import { getCachedTaskResult, setCachedTaskResult } from '../cache';
import { buildRoadmapPrompt, RoadmapPromptInput } from '../prompts/roadmap';
import { roadmapMilestoneSchema, roadmapNodeSchema } from '../../schemas/roadmap';

export const roadmapOutputSchema = z.object({
  milestones: z.array(roadmapMilestoneSchema),
  nodes: z.array(roadmapNodeSchema),
});

export type RoadmapOutput = z.infer<typeof roadmapOutputSchema>;

export async function generateRoadmapTask(input: RoadmapPromptInput): Promise<RoadmapOutput> {
  const taskName = 'generate-roadmap';

  // 1. Check Redis Cache
  const cached = await getCachedTaskResult<RoadmapOutput>(taskName, input);
  if (cached) return cached;

  // 2. Build initial prompt
  const { systemPrompt, prompt } = buildRoadmapPrompt(input);

  // 3. Execute AI Router
  let response = await aiRouter.execute({
    prompt,
    systemPrompt,
    jsonMode: true,
  });

  // 4. Parse & Validate JSON
  try {
    const json = JSON.parse(response.text);
    const validated = roadmapOutputSchema.parse(json);
    await setCachedTaskResult(taskName, input, validated);
    return validated;
  } catch (firstErr: any) {
    console.warn(`[AI Task: ${taskName}] Initial Zod validation failed. Retrying with error diagnostics...`, firstErr);

    // Single retry with error appended
    const retryPrompt = `${prompt}\n\nCRITICAL FIX REQUIRED: Your previous response failed schema validation with error:\n${firstErr.message || firstErr}\n\nPlease generate strictly valid JSON matching the exact schema requirements.`;

    response = await aiRouter.execute({
      prompt: retryPrompt,
      systemPrompt,
      jsonMode: true,
    });

    try {
      const jsonRetry = JSON.parse(response.text);
      const validatedRetry = roadmapOutputSchema.parse(jsonRetry);
      await setCachedTaskResult(taskName, input, validatedRetry);
      return validatedRetry;
    } catch (secondErr: any) {
      console.error(`[AI Task: ${taskName}] Zod validation failed on second attempt!`, secondErr);
      throw new Error(`Roadmap generation failed schema validation: ${secondErr.message || secondErr}`);
    }
  }
}
