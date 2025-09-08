'use server';
/**
 * @fileOverview A flow to convert speech to text.
 *
 * - speechToText - A function that converts speech to text.
 * - SpeechToTextInput - The input type for the speechToText function.
 * - SpeechToTextOutput - The return type for the speechToText function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {
  SpeechToTextInputSchema,
  SpeechToTextOutputSchema,
  type SpeechToTextInput,
  type SpeechToTextOutput,
} from '@/types';

export async function speechToText(
  input: SpeechToTextInput
): Promise<SpeechToTextOutput> {
  return speechToTextFlow(input);
}

const speechToTextFlow = ai.defineFlow(
  {
    name: 'speechToTextFlow',
    inputSchema: SpeechToTextInputSchema,
    outputSchema: SpeechToTextOutputSchema,
  },
  async ({audio, model}) => {
    // Note: The 'model' parameter is not directly used in the current Gemini API for STT,
    // but it's good practice to have it for future model selection.
    
    const {text} = await ai.generate({
      model: googleAI.model('gemini-2.5-flash'), // Using a capable model for transcription
      prompt: [
        {
          text: 'Transcribe the following audio recording. The user is responding to a conversational AI agent. Only provide the transcribed text, with no extra commentary.',
        },
        {media: {url: audio, contentType: 'audio/wav'}},
      ],
      config: {
        temperature: 0.1, // Lower temperature for more deterministic transcription
      },
    });

    return {text};
  }
);
