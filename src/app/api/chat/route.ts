
'use server';
import {NextRequest} from 'next/server';
import {streamToResponse} from '@genkit-ai/next';
import {runAgentStream} from '@/ai/flows/run-agent-flow';
import {RunAgentInputSchema} from '@/types';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  const input = RunAgentInputSchema.parse(await req.json());

  const stream = await runAgentStream(input);

  return streamToResponse(stream);
}
