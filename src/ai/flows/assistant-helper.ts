// src/ai/flows/assistant-helper.ts
'use server';
/**
 * @fileOverview An AI assistant chatbot for the agent editor.
 *
 * - assistantHelper - A function that answers user questions about agent creation.
 * - AssistantHelperInput - The input type for the assistantHelper function.
 * - AssistantHelperOutput - The return type for the assistantHelper function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AssistantHelperInputSchema = z.object({
  question: z.string().describe('The user question about agent creation.'),
});
export type AssistantHelperInput = z.infer<typeof AssistantHelperInputSchema>;

const AssistantHelperOutputSchema = z.object({
  answer: z.string().describe('The answer to the user question.'),
});
export type AssistantHelperOutput = z.infer<typeof AssistantHelperOutputSchema>;

export async function assistantHelper(input: AssistantHelperInput): Promise<AssistantHelperOutput> {
  return assistantHelperFlow(input);
}

const prompt = ai.definePrompt({
  name: 'assistantHelperPrompt',
  input: {schema: AssistantHelperInputSchema},
  output: {schema: AssistantHelperOutputSchema},
  prompt: `You are an expert AI App Prototyper. Your goal is to assist users with making changes to their AI agents in a conversational and intuitive manner.

You are friendly, collaborative, and highly skilled.

When a user asks for help, your primary job is to help them with their AI agent's code. Engage in a natural dialogue. Ask clarifying questions when requests are ambiguous. Explain your reasoning and thought process clearly but concisely.

You can provide code snippets in markdown format when it's helpful.

Answer the following user question:

Question: {{{question}}}

Answer:`,
});

const assistantHelperFlow = ai.defineFlow(
  {
    name: 'assistantHelperFlow',
    inputSchema: AssistantHelperInputSchema,
    outputSchema: AssistantHelperOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
