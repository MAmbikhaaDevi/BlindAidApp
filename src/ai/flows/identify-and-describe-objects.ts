'use server';

/**
 * @fileOverview Identifies objects in an image and provides a brief description for each.
 *
 * - identifyAndDescribeObjects - A function that takes an image and returns identified objects with descriptions.
 * - IdentifyAndDescribeObjectsInput - The input type for the function.
 * - IdentifyAndDescribeObjectsOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IdentifyAndDescribeObjectsInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type IdentifyAndDescribeObjectsInput = z.infer<typeof IdentifyAndDescribeObjectsInputSchema>;

const IdentifiedObjectSchema = z.object({
    name: z.string().describe('The name of the object.'),
    description: z.string().describe('A brief, one-sentence description of the object.'),
});

const IdentifyAndDescribeObjectsOutputSchema = z.object({
  objects: z.array(IdentifiedObjectSchema).describe('A list of objects identified in the image, each with a name and a brief description.'),
});
export type IdentifyAndDescribeObjectsOutput = z.infer<typeof IdentifyAndDescribeObjectsOutputSchema>;

export async function identifyAndDescribeObjects(input: IdentifyAndDescribeObjectsInput): Promise<IdentifyAndDescribeObjectsOutput> {
  return identifyAndDescribeObjectsFlow(input);
}

const identifyObjectsPrompt = ai.definePrompt({
  name: 'identifyAndDescribeObjectsPrompt',
  input: {schema: IdentifyAndDescribeObjectsInputSchema},
  output: {schema: IdentifyAndDescribeObjectsOutputSchema},
  prompt: `You are an AI assistant that identifies objects within an image for visually impaired users. Analyze the provided image and list the primary objects you can identify. For each object, provide its name and a brief, one-sentence description.

Image: {{media url=photoDataUri}}`,
});

const identifyAndDescribeObjectsFlow = ai.defineFlow(
  {
    name: 'identifyAndDescribeObjectsFlow',
    inputSchema: IdentifyAndDescribeObjectsInputSchema,
    outputSchema: IdentifyAndDescribeObjectsOutputSchema,
  },
  async input => {
    const {output} = await identifyObjectsPrompt(input);
    return output!;
  }
);
