
export type Agent = {
  id: string;
  name: string;
  description: string;
  conversationFlow: string;
  status: 'draft' | 'published';
  avatar?: string;
  integrations?: {
    twilio?: { accountSid: string; authToken: string; phoneNumber: string; };
    googleCalendar?: { apiKey: string };
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

    