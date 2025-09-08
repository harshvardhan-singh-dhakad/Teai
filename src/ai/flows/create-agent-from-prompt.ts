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
import { ConversationStepSchema } from '@/types';


const CreateAgentInputSchema = z.object({
  prompt: z.string().describe('A simple text prompt describing the desired AI agent.'),
});
export type CreateAgentInput = z.infer<typeof CreateAgentInputSchema>;

const CreateAgentOutputSchema = z.object({
  name: z.string().describe('The generated name for the AI agent.'),
  description: z.string().describe('The generated description for the AI agent.'),
  conversationFlow: z.array(ConversationStepSchema).describe('The generated conversation flow for the AI agent as a series of steps.'),
});
export type CreateAgentOutput = z.infer<typeof CreateAgentOutputSchema>;

export async function createAgentFromPrompt(input: CreateAgentInput): Promise<CreateAgentOutput> {
  return createAgentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'createAgentPrompt',
  input: {schema: CreateAgentInputSchema},
  output: {schema: CreateAgentOutputSchema},
  prompt: `You are an AI agent profile generator. Given a simple text prompt describing the desired AI agent, you will generate a complete agent profile including the name, description, and a structured conversation flow.

The conversation flow should be a series of steps. Each step must have a 'type', 'title', and 'content'.
Valid types are: 'aiMessage', 'userListen', and 'condition'.
- 'aiMessage': Represents a message from the AI. 'content' is the spoken text.
- 'userListen': Represents the AI listening for the user's response. 'content' should describe what the AI is listening for.
- 'condition': Represents a decision point. 'title' is the condition being checked. It must also have a 'branches' array. Each branch has a 'condition' (e.g., "If True"), an 'action' (the next step's title), and 'content' (the AI's response for that branch).

Here is the prompt: {{{prompt}}}

Generate the agent name, a short description (1-2 sentences), and a structured conversation flow based on the prompt.`,
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
