

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
  language: z.string().optional().describe('The language of the audio.'),
});
export type SpeechToTextInput = z.infer<typeof SpeechToTextInputSchema>;

export const SpeechToTextOutputSchema = z.object({
  text: z.string().describe('The transcribed text.'),
});
export type SpeechToTextOutput = z.infer<typeof SpeechToTextOutputSchema>;


export type ConversationStep = z.infer<typeof ConversationStepSchema>;

export type Document = {
  id: string;
  name: string;
  type: "file" | "website";
  source: string;
  size: string;
  status: "Active" | "Training";
  createdAt: string;
  content: string;
};

type IntegrationCredentials = {
    connected: boolean;
    [key: string]: any;
};

export type ExtractedVariable = {
  id: string;
  name: string;
  description: string;
};

export type PostCallConfig = {
  id: string;
  deliveryMethod: 'webhook' | 'email' | 'crm' | 'google-sheets';
  include: {
    callSummary: boolean;
    fullConversation: boolean;
    sentimentAnalysis: boolean;
    extractedInformation: boolean;
  };
  extractedVariables?: ExtractedVariable[];
};

export const AgentSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  callType: z.enum(['incoming', 'outgoing']).optional(),
  conversationFlow: z.array(ConversationStepSchema),
  status: z.enum(['draft', 'published']),
  avatar: z.string().optional(),
  // Omitted for simplicity in the Zod schema: knowledgeBase, integrations, configurations, postCallConfigs
  createdAt: z.string(),
  lastEdited: z.string(),
});
export type Agent = z.infer<typeof AgentSchema> & {
  knowledgeBase?: Document[];
  integrations?: {
    twilio?: IntegrationCredentials & { accountSid?: string; authToken?: string; };
    vonage?: IntegrationCredentials & { apiKey?: string; apiSecret?: string; };
    exotel?: IntegrationCredentials & { accountSid?: string; apiToken?: string; };
    googleCalendar?: IntegrationCredentials & { apiKey?: string; };
    gmail?: IntegrationCredentials & { apiKey?: string; };
    googleDocs?: IntegrationCredentials & { apiKey?: string; };
    googleSheets?: IntegrationCredentials & { apiKey?: string; };
    slack?: IntegrationCredentials & { webhookUrl?: string; };
    zapier?: IntegrationCredentials;
  };
  configurations?: {
    stt?: {
      provider?: string;
      language?: string;
      silenceTimeout?: number;
      interruptionSensitivity?: number;
      enableNoiseReducer?: boolean;
    };
    llm?: {
      provider?: string;
      temperature?: number;
      enableStreaming?: boolean;
    };
    voice?: {
      voiceId?: string;
    };
    behavior?: {
      enableFillerPhrases?: boolean;
      fillerPhrases?: string[];
      toneOfVoice?: string;
      assistantStyle?: string;
    },
    callTransfer?: {
      enabled?: boolean;
      phoneNumber?: string;
      condition?: string;
      transferMessage?: string;
    };
    callEnding?: {
      enableAutoEnding?: boolean;
      endCallCondition?: string;
      endCallMessage?: string;
    }
  };
  postCallConfigs?: PostCallConfig[];
};


export type AgentTemplate = {
  name: string;
  description: string;
  icon: React.ElementType;
  prompt: string;
};

export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const RunAgentInputSchema = z.object({
  agent: AgentSchema.extend({
    configurations: z.any().optional(),
    integrations: z.any().optional(),
    knowledgeBase: z.any().optional(),
    postCallConfigs: z.any().optional(),
  }).describe("The full agent object containing its definition and configuration."),
  messages: z.array(ChatMessageSchema).describe("The history of the conversation so far."),
});
export type RunAgentInput = z.infer<typeof RunAgentInputSchema>;

export const RunAgentOutputSchema = z.object({
  answer: z.string().describe('The generated response from the agent.'),
  audio: z.string().describe("The generated audio as a data URI."),
});
export type RunAgentOutput = z.infer<typeof RunAgentOutputSchema>;


export type Integration = {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  group: 'calling' | 'productivity' | 'other';
  credentials?: { id: string; label: string }[];
};

export type Voice = {
    id: string;
    name: string;
    gender: 'Male' | 'Female';
    accent: string;
    provider: 'Google' | 'Eleven Labs';
    quality: 'High' | 'Very High';
    engine: string;
}

export const TrainFromWebsiteInputSchema = z.object({
  url: z.string().describe('The URL of the website to scrape.'),
});
export type TrainFromWebsiteInput = z.infer<typeof TrainFromWebsiteInputSchema>;

export const TrainFromWebsiteOutputSchema = z.object({
  title: z.string().describe('The extracted title of the website.'),
  content: z.string().describe('The extracted main content of the website.'),
  charCount: z.number().describe('The character count of the content.'),
});
export type TrainFromWebsiteOutput = z.infer<typeof TrainFromWebsiteOutputSchema>;
