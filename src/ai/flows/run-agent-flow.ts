
'use server';
/**
 * @fileOverview A flow to run a single conversation turn for a specific AI agent.
 *
 * - runAgent - A function that executes the agent's logic for one turn.
 * - runAgentStream - A function that executes the agent's logic for one turn and streams the response.
 * - RunAgentInput - The input type for the runAgent function.
 * - RunAgentOutput - The return type for the runAgent function.
 */

import {ai} from '@/ai/genkit';
import {
  RunAgentInputSchema,
  RunAgentOutputSchema,
  type RunAgentInput,
  type RunAgentOutput,
} from '@/types';
import {generate} from 'genkit';
import {z} from 'zod';
import {textToSpeech} from './tts-flow';

const staticPrompt = `You are a voice AI assistant. Your responses MUST strictly follow the conversational flow provided. Do not deviate.

Your identity and instructions are defined below.
- Name: {{{agent.name}}}
- Description: {{{agent.description}}}
{{#if agent.configurations.stt.language}}
- Language: {{agent.configurations.stt.language}}
{{else}}
- Language: en-US
{{/if}}

Your conversation flow is structured as a series of steps. You MUST follow these steps to guide the conversation.
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
{{#if agent.configurations.behavior}}
- Tone of Voice: {{#if agent.configurations.behavior.toneOfVoice}}{{agent.configurations.behavior.toneOfVoice}}{{else}}professional{{/if}}
- Assistant Style: {{#if agent.configurations.behavior.assistantStyle}}{{agent.configurations.behavior.assistantStyle}}{{else}}A helpful assistant.{{/if}}
{{/if}}

Here is the conversation history so far:
{{#each messages}}
- {{this.role}}: {{this.content}}
{{/each}}

IMPORTANT: You must respond in the same language as the last user message.

Based on all the information above, generate the next appropriate response as the assistant, strictly following the conversation flow. Your response should be just the text content, without any "assistant:" prefix.`;

const dynamicPrompt = `You are a voice AI assistant.

Your identity and instructions are defined below.
- Name: {{{agent.name}}}
- Description: {{{agent.description}}}
{{#if agent.configurations.stt.language}}
- Language: {{agent.configurations.stt.language}}
{{else}}
- Language: en-US
{{/if}}

You have a suggested conversation flow. Use it as a guideline, but you have the freedom to deviate if the user asks something unexpected. Be natural and conversational.
{{#each agent.conversationFlow}}
- Suggested Step {{add @index 1}}: {{this.title}} (Type: {{this.type}})
  - Guideline: {{this.content}}
  {{#if this.branches}}
  - Suggested Branches:
    {{#each this.branches}}
    - {{this.condition}}: {{this.content}} (Suggested next step: {{this.action}})
    {{/each}}
  {{/if}}
{{/each}}

You must also adhere to any additional configurations for your behavior:
{{#if agent.configurations.behavior}}
- Tone of Voice: {{#if agent.configurations.behavior.toneOfVoice}}{{agent.configurations.behavior.toneOfVoice}}{{else}}professional{{/if}}
- Assistant Style: {{#if agent.configurations.behavior.assistantStyle}}{{agent.configurations.behavior.assistantStyle}}{{else}}A helpful assistant.{{/if}}
{{/if}}

Here is the conversation history so far:
{{#each messages}}
- {{this.role}}: {{this.content}}
{{/each}}

IMPORTANT: You must respond in the same language as the last user message.

Based on all the information above, generate the next appropriate response as the assistant. Your response should be just the text content, without any "assistant:" prefix.`;

export async function runAgent(input: RunAgentInput): Promise<RunAgentOutput> {
  return runAgentFlow(input);
}

export async function runAgentStream(
  input: RunAgentInput
): Promise<ReadableStream<string>> {
  return runAgentStreamFlow(input);
}

const prompt = ai.definePrompt(
  {
    name: 'runAgentPrompt',
    input: {schema: RunAgentInputSchema},
    output: {schema: z.object({ answer: z.string() })},
  },
  async input => {
    // A simple helper to add numbers in Handlebars
    ai.handlebars.registerHelper('add', (a, b) => a + b);
    const chosenPrompt = input.agent.isDynamic ? dynamicPrompt : staticPrompt;
    return {
      prompt: chosenPrompt,
      context: [input],
    };
  }
);

const runAgentFlow = ai.defineFlow(
  {
    name: 'runAgentFlow',
    inputSchema: RunAgentInputSchema,
    outputSchema: RunAgentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    const answer = output!.answer;

    // Generate speech and include it in the final output
    const { audio } = await textToSpeech({ text: answer, voice: input.agent.configurations?.voice?.voiceId });

    return { answer, audio };
  }
);

const runAgentStreamFlow = ai.defineFlow(
  {
    name: 'runAgentStreamFlow',
    inputSchema: RunAgentInputSchema,
    outputSchema: z.string(),
  },
  async input => {
    ai.handlebars.registerHelper('add', (a, b) => a + b);
    const chosenPrompt = input.agent.isDynamic ? dynamicPrompt : staticPrompt;

    const {stream, response} = ai.generate({
      prompt: chosenPrompt,
      model: ai.getModel(),
      context: [input],
      stream: true,
    });
    
    const chunks: string[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk.text);
    }
    
    return new ReadableStream({
      start(controller) {
        for (const chunk of chunks) {
          controller.enqueue(chunk);
        }
        controller.close();
      }
    });
  }
);
