'use server';

/**
 * @fileOverview Identifies objects in an image.
 *
 * - identifyObjectsInImage - A function that takes an image data URI and returns a list of identified objects.
 * - IdentifyObjectsInput - The input type for the identifyObjectsInImage function.
 * - IdentifyObjectsOutput - The return type for the identifyObjectsInImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IdentifyObjectsInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type IdentifyObjectsInput = z.infer<typeof IdentifyObjectsInputSchema>;

const IdentifyObjectsOutputSchema = z.object({
  objects: z.array(z.string()).describe('A list of objects identified in the image.'),
});
export type IdentifyObjectsOutput = z.infer<typeof IdentifyObjectsOutputSchema>;

export async function identifyObjectsInImage(input: IdentifyObjectsInput): Promise<IdentifyObjectsOutput> {
  return identifyObjectsFlow(input);
}

const identifyObjectsPrompt = ai.definePrompt({
  name: 'identifyObjectsPrompt',
  input: {schema: IdentifyObjectsInputSchema},
  output: {schema: IdentifyObjectsOutputSchema},
  prompt: `You are an AI assistant that identifies objects within an image for visually impaired users. Analyze the provided image and list the primary objects you can identify. Be concise and accurate.

Image: {{media url=photoDataUri}}`,
});

const identifyObjectsFlow = ai.defineFlow(
  {
    name: 'identifyObjectsFlow',
    inputSchema: IdentifyObjectsInputSchema,
    outputSchema: IdentifyObjectsOutputSchema,
  },
  async input => {
    const {output} = await identifyObjectsPrompt(input);
    return output!;
  }
);
