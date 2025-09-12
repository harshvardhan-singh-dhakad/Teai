import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash',
  enableTracing: true,
  logLevel: 'debug',
  // Streaming is a good default for all LLM calls to reduce latency
  generatorOptions: {
    stream: true,
  },
});
