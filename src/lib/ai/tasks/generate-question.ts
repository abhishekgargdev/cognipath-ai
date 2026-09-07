import { aiRouter } from '../router';
import { getCachedTaskResult, setCachedTaskResult } from '../cache';
import { buildQuestionPrompt, QuestionPromptInput } from '../prompts/question';
import { practiceQuestionSchema, PracticeQuestionInput } from '../../schemas/practice-question';

export async function generateQuestionTask(input: QuestionPromptInput): Promise<PracticeQuestionInput> {
  const taskName = 'generate-question';

  // 1. Check Redis Cache
  const cached = await getCachedTaskResult<PracticeQuestionInput>(taskName, input);
  if (cached) return cached;

  // 2. Build Prompt
  const { systemPrompt, prompt } = buildQuestionPrompt(input);

  // 3. Call AI Router
  let response = await aiRouter.execute({
    prompt,
    systemPrompt,
    jsonMode: true,
  });

  // 4. Parse & Validate
  try {
    const json = JSON.parse(response.text);
    const validated = practiceQuestionSchema.parse(json);
    await setCachedTaskResult(taskName, input, validated);
    return validated;
  } catch (firstErr: any) {
    console.warn(`[AI Task: ${taskName}] Initial Zod validation failed. Retrying with error diagnostics...`, firstErr);

    const retryPrompt = `${prompt}\n\nCRITICAL FIX REQUIRED: Your previous response failed schema validation with error:\n${firstErr.message || firstErr}\n\nPlease generate strictly valid JSON matching the exact question schema.`;

    response = await aiRouter.execute({
      prompt: retryPrompt,
      systemPrompt,
      jsonMode: true,
    });

    try {
      const jsonRetry = JSON.parse(response.text);
      const validatedRetry = practiceQuestionSchema.parse(jsonRetry);
      await setCachedTaskResult(taskName, input, validatedRetry);
      return validatedRetry;
    } catch (secondErr: any) {
      console.error(`[AI Task: ${taskName}] Zod validation failed on second attempt!`, secondErr);
      throw new Error(`Question generation failed schema validation: ${secondErr.message || secondErr}`);
    }
  }
}
