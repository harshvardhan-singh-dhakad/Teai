'use server';

/**
 * @fileOverview AI flow to enhance a user-provided prompt for creating an AI agent.
 *
 * This file exports:
 * - `enhanceUserPrompt`: Enhances a user-provided prompt using AI.
 * - `EnhanceUserPromptInput`: Input type for the enhanceUserPrompt function.
 * - `EnhanceUserPromptOutput`: Output type for the enhanceUserPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EnhanceUserPromptInputSchema = z.object({
  userPrompt: z
    .string()
    .describe('The initial user-provided prompt to be enhanced.'),
});
export type EnhanceUserPromptInput = z.infer<typeof EnhanceUserPromptInputSchema>;

const EnhanceUserPromptOutputSchema = z.object({
  enhancedPrompt: z
    .string()
    .describe('The AI-enhanced and more detailed prompt.'),
});
export type EnhanceUserPromptOutput = z.infer<typeof EnhanceUserPromptOutputSchema>;

export async function enhanceUserPrompt(input: EnhanceUserPromptInput): Promise<EnhanceUserPromptOutput> {
  return enhanceUserPromptFlow(input);
}

const enhancePrompt = ai.definePrompt({
  name: 'enhancePrompt',
  input: {schema: EnhanceUserPromptInputSchema},
  output: {schema: EnhanceUserPromptOutputSchema},
  prompt: `You are an AI prompt enhancer. Your job is to take a user-provided prompt and expand upon it to create a more detailed and effective prompt for AI agent creation.

User Prompt: {{{userPrompt}}}

Enhanced Prompt:`, // The LLM will generate the enhanced prompt here.
});

const enhanceUserPromptFlow = ai.defineFlow(
  {
    name: 'enhanceUserPromptFlow',
    inputSchema: EnhanceUserPromptInputSchema,
    outputSchema: EnhanceUserPromptOutputSchema,
  },
  async input => {
    const {output} = await enhancePrompt(input);
    return output!;
  }
);
