
'use server';
/**
 * @fileOverview A flow to scrape a website and extract its content for training.
 *
 * - trainFromWebsite - A function that scrapes a website.
 * - TrainFromWebsiteInput - The input type for the trainFromWebsite function.
 * - TrainFromWebsiteOutput - The return type for the trainFromWebsite function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {
  TrainFromWebsiteInputSchema,
  TrainFromWebsiteOutputSchema,
  type TrainFromWebsiteInput,
  type TrainFromWebsiteOutput,
} from '@/types';
import * as cheerio from 'cheerio';

export async function trainFromWebsite(
  input: TrainFromWebsiteInput
): Promise<TrainFromWebsiteOutput> {
  return trainFromWebsiteFlow(input);
}

const trainFromWebsiteFlow = ai.defineFlow(
  {
    name: 'trainFromWebsiteFlow',
    inputSchema: TrainFromWebsiteInputSchema,
    outputSchema: TrainFromWebsiteOutputSchema,
  },
  async ({url}) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch website: ${response.statusText}`);
      }
      const html = await response.text();
      const $ = cheerio.load(html);

      // Remove script and style elements
      $('script, style').remove();

      const title = $('title').first().text() || $('h1').first().text() || new URL(url).hostname;
      
      // Extract text from the body, trying to be smart about it
      let content = $('body').text();
      
      // Clean up the text: remove extra whitespace and newlines
      content = content.replace(/\s\s+/g, ' ').replace(/\n+/g, '\n').trim();

      const charCount = content.length;
      
      if (charCount < 100) {
          console.warn(`Scraped content from ${url} is very short (${charCount} chars). It might not be effective for training.`);
      }

      return {
        title: title,
        content: content,
        charCount: charCount,
      };
    } catch (error: any) {
      console.error(`Error scraping website: ${url}`, error);
      throw new Error(`Failed to scrape website. Please check the URL and try again. Error: ${error.message}`);
    }
  }
);
