'use server';
/**
 * @fileOverview Summarizes nearby objects for visually impaired users.
 *
 * - summarizeNearbyObjects - A function that summarizes the nearby objects.
 * - SummarizeNearbyObjectsInput - The input type for the summarizeNearbyObjects function.
 * - SummarizeNearbyObjectsOutput - The return type for the summarizeNearbyObjects function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeNearbyObjectsInputSchema = z.object({
  objects: z.array(z.string()).describe('A list of objects detected nearby.'),
});
export type SummarizeNearbyObjectsInput = z.infer<typeof SummarizeNearbyObjectsInputSchema>;

const SummarizeNearbyObjectsOutputSchema = z.object({
  summary: z.string().describe('A short summary of the key objects detected nearby.'),
});
export type SummarizeNearbyObjectsOutput = z.infer<typeof SummarizeNearbyObjectsOutputSchema>;

export async function summarizeNearbyObjects(input: SummarizeNearbyObjectsInput): Promise<SummarizeNearbyObjectsOutput> {
  return summarizeNearbyObjectsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeNearbyObjectsPrompt',
  input: {schema: SummarizeNearbyObjectsInputSchema},
  output: {schema: SummarizeNearbyObjectsOutputSchema},
  prompt: `You are an AI assistant helping visually impaired users understand their surroundings.

  Summarize the following list of objects detected nearby into a concise and informative summary.
  Focus on the key objects and provide context about the environment.

  Objects: {{objects}}
  `,
});

const summarizeNearbyObjectsFlow = ai.defineFlow(
  {
    name: 'summarizeNearbyObjectsFlow',
    inputSchema: SummarizeNearbyObjectsInputSchema,
    outputSchema: SummarizeNearbyObjectsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
