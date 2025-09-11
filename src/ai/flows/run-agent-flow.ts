'use server';
/**
 * @fileOverview A flow to run a single conversation turn for a specific AI agent.
 *
 * - runAgent - A function that executes the agent's logic for one turn.
 * - RunAgentInput - The input type for the runAgent function.
 * - RunAgentOutput - The return type for the runAgent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { AgentSchema, ChatMessageSchema } from '@/types';

export const RunAgentInputSchema = z.object({
  agent: AgentSchema.describe("The full agent object containing its definition and configuration."),
  messages: z.array(ChatMessageSchema).describe("The history of the conversation so far."),
});
export type RunAgentInput = z.infer<typeof RunAgentInputSchema>;

export const RunAgentOutputSchema = z.object({
  answer: z.string().describe('The generated response from the agent.'),
});
export type RunAgentOutput = z.infer<typeof RunAgentOutputSchema>;

export async function runAgent(input: RunAgentInput): Promise<RunAgentOutput> {
  return runAgentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'runAgentPrompt',
  input: {schema: RunAgentInputSchema},
  output: {schema: RunAgentOutputSchema},
  prompt: `You are a voice AI assistant.

Your identity and instructions are defined below.
- Name: {{{agent.name}}}
- Description: {{{agent.description}}}

Your conversation flow is structured as a series of steps. Follow these steps to guide the conversation.
{{#each agent.conversationFlow}}
- Step {{add @index 1}}: {{this.title}} (Type: {{this.type}})
  - Content: {{this.content}}
  {{#if this.branches}}
  - Branches:
    {{#each this.branches}}
    - {{this.condition}}: {{this.content}} (Next step: {{this.action}})
    {{/each}}
  {{/if}}
{{/each}}

You must also adhere to any additional configurations for your behavior:
- Tone of Voice: {{#if agent.configurations.behavior.toneOfVoice}}{{agent.configurations.behavior.toneOfVoice}}{{else}}professional{{/if}}
- Assistant Style: {{#if agent.configurations.behavior.assistantStyle}}{{agent.configurations.behavior.assistantStyle}}{{else}}A helpful assistant.{{/if}}

Here is the conversation history so far:
{{#each messages}}
- {{this.role}}: {{this.content}}
{{/each}}

Based on all the information above, generate the next appropriate response as the assistant. Your response should be just the text content, without any "assistant:" prefix.`,
});

const runAgentFlow = ai.defineFlow(
  {
    name: 'runAgentFlow',
    inputSchema: RunAgentInputSchema,
    outputSchema: RunAgentOutputSchema,
  },
  async input => {
    // A simple helper to add numbers in Handlebars
    ai.handlebars.registerHelper('add', (a, b) => a + b);

    const {output} = await prompt(input);
    return output!;
  }
);
