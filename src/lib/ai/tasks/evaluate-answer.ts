import { aiRouter } from '../router';
import { buildEvaluationPrompt, EvaluationPromptInput } from '../prompts/evaluation';
import { diagnosticEvaluationSchema, DiagnosticEvaluationInput } from '../../schemas/practice-submission';

export async function evaluateAnswerTask(input: EvaluationPromptInput): Promise<DiagnosticEvaluationInput> {
  const taskName = 'evaluate-answer';

  // Note: Diagnostics for user submissions are computed per submission, so we don't cache them globally across users.
  // 1. Build Prompt
  const { systemPrompt, prompt } = buildEvaluationPrompt(input);

  // 2. Call AI Router
  let response = await aiRouter.execute({
    prompt,
    systemPrompt,
    jsonMode: true,
  });

  // 3. Parse & Validate
  try {
    const json = JSON.parse(response.text);
    return diagnosticEvaluationSchema.parse(json);
  } catch (firstErr: any) {
    console.warn(`[AI Task: ${taskName}] Initial Zod validation failed. Retrying with error diagnostics...`, firstErr);

    const retryPrompt = `${prompt}\n\nCRITICAL FIX REQUIRED: Your previous response failed schema validation with error:\n${firstErr.message || firstErr}\n\nPlease generate strictly valid JSON matching the exact diagnostic evaluation schema.`;

    response = await aiRouter.execute({
      prompt: retryPrompt,
      systemPrompt,
      jsonMode: true,
    });

    try {
      const jsonRetry = JSON.parse(response.text);
      return diagnosticEvaluationSchema.parse(jsonRetry);
    } catch (secondErr: any) {
      console.error(`[AI Task: ${taskName}] Zod validation failed on second attempt!`, secondErr);
      throw new Error(`Answer evaluation failed schema validation: ${secondErr.message || secondErr}`);
    }
  }
}
