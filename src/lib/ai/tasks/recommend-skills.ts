import { z } from 'zod';
import { aiRouter } from '../router';
import { getCachedTaskResult, setCachedTaskResult } from '../cache';
import { buildRecommendationPrompt, RecommendationPromptInput } from '../prompts/recommendation';
import { aiRecommendationSchema, AiRecommendationInput } from '../../schemas/ai-recommendation';

export const recommendationOutputSchema = z.array(aiRecommendationSchema);

export async function recommendSkillsTask(input: RecommendationPromptInput): Promise<AiRecommendationInput[]> {
  const taskName = 'recommend-skills';

  // 1. Check Redis Cache
  const cached = await getCachedTaskResult<AiRecommendationInput[]>(taskName, input);
  if (cached) return cached;

  // 2. Build Prompt
  const { systemPrompt, prompt } = buildRecommendationPrompt(input);

  // 3. Call AI Router
  let response = await aiRouter.execute({
    prompt,
    systemPrompt,
    jsonMode: true,
  });

  // 4. Parse & Validate
  try {
    const json = JSON.parse(response.text);
    const validated = recommendationOutputSchema.parse(json);
    await setCachedTaskResult(taskName, input, validated, 86400); // 24hr TTL for recommendations
    return validated;
  } catch (firstErr: any) {
    console.warn(`[AI Task: ${taskName}] Initial Zod validation failed. Retrying with error diagnostics...`, firstErr);

    const retryPrompt = `${prompt}\n\nCRITICAL FIX REQUIRED: Your previous response failed schema validation with error:\n${firstErr.message || firstErr}\n\nPlease generate strictly valid JSON matching the array of recommendation objects.`;

    response = await aiRouter.execute({
      prompt: retryPrompt,
      systemPrompt,
      jsonMode: true,
    });

    try {
      const jsonRetry = JSON.parse(response.text);
      const validatedRetry = recommendationOutputSchema.parse(jsonRetry);
      await setCachedTaskResult(taskName, input, validatedRetry, 86400);
      return validatedRetry;
    } catch (secondErr: any) {
      console.error(`[AI Task: ${taskName}] Zod validation failed on second attempt!`, secondErr);
      throw new Error(`Skills recommendation failed schema validation: ${secondErr.message || secondErr}`);
    }
  }
}
