'use server';

/**
 * @fileOverview Creates a new AI agent profile (name, description, conversation flow) from a simple text prompt.
 *
 * - createAgentFromPrompt - A function that generates an agent profile from a prompt.
 * - CreateAgentInput - The input type for the createAgentFromPrompt function.
 * - CreateAgentOutput - The return type for the createAgentFromPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CreateAgentInputSchema = z.object({
  prompt: z.string().describe('A simple text prompt describing the desired AI agent.'),
});
export type CreateAgentInput = z.infer<typeof CreateAgentInputSchema>;

const CreateAgentOutputSchema = z.object({
  name: z.string().describe('The generated name for the AI agent.'),
  description: z.string().describe('The generated description for the AI agent.'),
  conversationFlow: z.string().describe('The generated conversation flow for the AI agent.'),
});
export type CreateAgentOutput = z.infer<typeof CreateAgentOutputSchema>;

export async function createAgentFromPrompt(input: CreateAgentInput): Promise<CreateAgentOutput> {
  return createAgentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'createAgentPrompt',
  input: {schema: CreateAgentInputSchema},
  output: {schema: CreateAgentOutputSchema},
  prompt: `You are an AI agent profile generator. Given a simple text prompt describing the desired AI agent, you will generate a complete agent profile including the name, description, and conversation flow.

Here is the prompt: {{{prompt}}}

Output the agent name, a short description (1-2 sentences), and a sample conversation flow.`,
});

const createAgentFlow = ai.defineFlow(
  {
    name: 'createAgentFlow',
    inputSchema: CreateAgentInputSchema,
    outputSchema: CreateAgentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
