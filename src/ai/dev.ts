
import { config } from 'dotenv';
config();

import '@/ai/flows/enhance-user-prompt.ts';
import '@/ai/flows/create-agent-from-prompt.ts';
import '@/ai/flows/assistant-helper.ts';
import '@/ai/flows/tts-flow.ts';
import '@/ai/flows/stt-flow.ts';
import '@/ai/flows/train-from-website.ts';
