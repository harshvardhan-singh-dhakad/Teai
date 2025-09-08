import {z} from 'zod';

export const ConversationStepBranchSchema = z.object({
  condition: z
    .string()
    .describe("The condition for this branch, e.g., 'If True' or 'If False'"),
  action: z.string().describe("The title of the next action or step."),
  content: z
    .string()
    .describe("The AI's response or action content for this branch."),
});

export const ConversationStepSchema = z.object({
  type: z
    .enum(['aiMessage', 'userListen', 'condition'])
    .describe('The type of conversation step.'),
  title: z.string().describe('The title or name of the step.'),
  content: z
    .string()
    .optional()
    .describe('The content of the step, like a message or description.'),
  branches: z
    .array(ConversationStepBranchSchema)
    .optional()
    .describe('Branches for a condition step.'),
});

export const TextToSpeechInputSchema = z.object({
  text: z.string().describe('The text to convert to speech.'),
  voice: z.string().optional().describe('The voice to use for the speech.'),
});
export type TextToSpeechInput = z.infer<typeof TextToSpeechInputSchema>;

export const TextToSpeechOutputSchema = z.object({
  audio: z
    .string()
    .describe(
      "The generated audio as a data URI. Expected format: 'data:audio/wav;base64,<encoded_data>'"
    ),
});
export type TextToSpeechOutput = z.infer<typeof TextToSpeechOutputSchema>;

export type ConversationStep = z.infer<typeof ConversationStepSchema>;

export type Agent = {
  id: string;
  name: string;
  description: string;
  conversationFlow: ConversationStep[] | string; // Can be a structured flow or a simple string for backward compatibility
  status: 'draft' | 'published';
  avatar?: string;
  integrations?: {
    twilio?: {accountSid: string; authToken: string; phoneNumber: string};
    googleCalendar?: {apiKey: string};
  };
  configurations?: {
    language?: string;
    llmModel?: string;
    sttModel?: string;
    ttsModel?: string;
  };
  postCall?: {
    webhookUrl: string;
  };
  createdAt: string;
};

export type AgentTemplate = {
  name: string;
  description: string;
  icon: React.ElementType;
  prompt: string;
};

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

    