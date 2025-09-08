'use server';

import { enhanceUserPrompt, EnhanceUserPromptInput, EnhanceUserPromptOutput } from '@/ai/flows/enhance-user-prompt';
import { createAgentFromPrompt, CreateAgentInput, CreateAgentOutput } from '@/ai/flows/create-agent-from-prompt';
import { assistantHelper, AssistantHelperInput, AssistantHelperOutput } from '@/ai/flows/assistant-helper';

export async function enhancePromptAction(input: EnhanceUserPromptInput): Promise<EnhanceUserPromptOutput> {
  try {
    return await enhanceUserPrompt(input);
  } catch (error) {
    console.error('Error enhancing prompt:', error);
    throw new Error('Failed to enhance prompt.');
  }
}

export async function createAgentAction(input: CreateAgentInput): Promise<CreateAgentOutput> {
  try {
    return await createAgentFromPrompt(input);
  } catch (error) {
    console.error('Error creating agent from prompt:', error);
    throw new Error('Failed to create agent.');
  }
}

export async function getAssistantResponse(input: AssistantHelperInput): Promise<AssistantHelperOutput> {
    try {
        return await assistantHelper(input);
    } catch (error) {
        console.error('Error getting assistant response:', error);
        throw new Error('Failed to get response from assistant.');
    }
}
