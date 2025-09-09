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
  id: z.string().describe('A unique identifier for the step.'),
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

export const SpeechToTextInputSchema = z.object({
  audio: z
    .string()
    .describe(
      "The audio to transcribe as a data URI. Expected format: 'data:audio/wav;base64,<encoded_data>'"
    ),
  model: z.string().optional().describe('The STT model to use.'),
});
export type SpeechToTextInput = z.infer<typeof SpeechToTextInputSchema>;

export const SpeechToTextOutputSchema = z.object({
  text: z.string().describe('The transcribed text.'),
});
export type SpeechToTextOutput = z.infer<typeof SpeechToTextOutputSchema>;


export type ConversationStep = z.infer<typeof ConversationStepSchema>;

export type Document = {
  name: string;
  size: string;
  date: string;
  status: "Active" | "Processing";
};

type IntegrationCredentials = {
    connected: boolean;
    [key: string]: any;
};

export type Agent = {
  id: string;
  name: string;
  description: string;
  conversationFlow: ConversationStep[];
  status: 'draft' | 'published';
  avatar?: string;
  knowledgeBase?: Document[];
  integrations?: {
    twilio?: IntegrationCredentials & { accountSid?: string; authToken?: string; };
    vonage?: IntegrationCredentials & { apiKey?: string; apiSecret?: string; };
    exotel?: IntegrationCredentials & { accountSid?: string; apiToken?: string; };
    googleCalendar?: IntegrationCredentials & { apiKey?: string; };
    slack?: IntegrationCredentials & { webhookUrl?: string; };
    zapier?: IntegrationCredentials;
  };
  configurations?: {
    stt?: {
      provider?: string;
      language?: string;
      silenceTimeout?: number;
    };
    llm?: {
      model?: string;
      temperature?: number;
    };
    voice?: {
      voiceId?: string;
      speed?: number;
    };
    behavior?: {
      useFillerWords?: boolean;
    },
    callTransfer?: {
      enabled?: boolean;
      phoneNumber?: string;
      condition?: string;
    };
    callEnding?: {
      enableVoicemail?: boolean;
      voicemailMessage?: string;
    }
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

export type Integration = {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  group: 'calling' | 'other';
  credentials?: { id: string; label: string }[];
};
