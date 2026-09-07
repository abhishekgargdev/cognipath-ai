import { aiRouter } from '../router';
import { getCachedTaskResult, setCachedTaskResult } from '../cache';
import { buildLessonPrompt, LessonPromptInput } from '../prompts/lesson';
import { lessonSchema, LessonInput } from '../../schemas/lesson';

export async function generateLessonTask(input: LessonPromptInput): Promise<LessonInput> {
  const taskName = 'generate-lesson';

  // 1. Check Redis Cache
  const cached = await getCachedTaskResult<LessonInput>(taskName, input);
  if (cached) return cached;

  // 2. Build Prompt
  const { systemPrompt, prompt } = buildLessonPrompt(input);

  // 3. Call AI Router
  let response = await aiRouter.execute({
    prompt,
    systemPrompt,
    jsonMode: true,
  });

  // 4. Parse & Validate JSON
  try {
    const json = JSON.parse(response.text);
    const validated = lessonSchema.parse(json);
    await setCachedTaskResult(taskName, input, validated);
    return validated;
  } catch (firstErr: any) {
    console.warn(`[AI Task: ${taskName}] Initial Zod validation failed. Retrying with error diagnostics...`, firstErr);

    const retryPrompt = `${prompt}\n\nCRITICAL FIX REQUIRED: Your previous response failed schema validation with error:\n${firstErr.message || firstErr}\n\nPlease generate strictly valid JSON matching the exact lesson schema.`;

    response = await aiRouter.execute({
      prompt: retryPrompt,
      systemPrompt,
      jsonMode: true,
    });

    try {
      const jsonRetry = JSON.parse(response.text);
      const validatedRetry = lessonSchema.parse(jsonRetry);
      await setCachedTaskResult(taskName, input, validatedRetry);
      return validatedRetry;
    } catch (secondErr: any) {
      console.error(`[AI Task: ${taskName}] Zod validation failed on second attempt!`, secondErr);
      throw new Error(`Lesson generation failed schema validation: ${secondErr.message || secondErr}`);
    }
  }
}
