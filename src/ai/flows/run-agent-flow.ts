'use server';

import { ai } from '@/ai/genkit';
import {
  RunAgentInputSchema,
  RunAgentOutputSchema,
  type RunAgentInput,
  type RunAgentOutput,
} from '@/types';
import { z } from 'zod';
import { auth } from '@/lib/firebase';

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

const prompt = ai.definePrompt(
  {
    name: 'runAgentPrompt',
    input: { schema: RunAgentInputSchema },
    output: { schema: z.object({ answer: z.string() }) },
  },
  async input => {
    ai.handlebars.registerHelper('add', (a: number, b: number) => a + b);
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
    const { output } = await prompt(input);
    const answer = output!.answer;

    // Call our internal ElevenLabs TTS API
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002';
    const ttsResponse = await fetch(`${baseUrl}/api/generate-voice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: answer,
        voice: input.agent.configurations?.voice?.voiceId || 'Rachel',
        userId: auth.currentUser?.uid || 'anonymous'
      })
    });

    if (!ttsResponse.ok) {
        throw new Error('Failed to generate ElevenLabs voice');
    }

    const { audio } = await ttsResponse.json();

    return { answer, audio };
  }
);
