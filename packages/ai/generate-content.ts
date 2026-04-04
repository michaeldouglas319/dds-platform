import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function generateContent(
  prompt: string,
  options?: { model?: string; system?: string },
): Promise<string> {
  const { text } = await generateText({
    model: openai(options?.model ?? 'gpt-4o-mini'),
    system: options?.system,
    prompt,
  });

  return text;
}
