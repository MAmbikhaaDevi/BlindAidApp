'use server';

/**
 * @fileOverview Describes an image in detail for visually impaired users.
 *
 * - describeImage - A function that takes an image data URI and returns a detailed description.
 * - DescribeImageInput - The input type for the describeImage function.
 * - DescribeImageOutput - The return type for the describeImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DescribeImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type DescribeImageInput = z.infer<typeof DescribeImageInputSchema>;

const DescribeImageOutputSchema = z.object({
  description: z.string().describe('A detailed, conversational description of the image, as if you were talking to a visually impaired person. Mention objects, their colors, and their relative positions if possible (e.g., "on your right," "in front of you").'),
});
export type DescribeImageOutput = z.infer<typeof DescribeImageOutputSchema>;

export async function describeImage(input: DescribeImageInput): Promise<DescribeImageOutput> {
  return describeImageFlow(input);
}

const describeImagePrompt = ai.definePrompt({
  name: 'describeImagePrompt',
  input: {schema: DescribeImageInputSchema},
  output: {schema: DescribeImageOutputSchema},
  prompt: `You are an AI assistant designed to help a visually impaired user by describing their surroundings. Your tone should be friendly, clear, and conversational, as if you are talking directly to them.

Analyze the image and describe what you see in a natural, human-like way. For example, instead of just listing "a cup, a laptop", say something like "Right in front of you, there's a desk with a laptop on it, and to your right, there's a white coffee cup."

Mention the main objects, their colors if they are distinct, and their position relative to the user if you can infer it. Be descriptive and helpful.

Image: {{media url=photoDataUri}}`,
});

const describeImageFlow = ai.defineFlow(
  {
    name: 'describeImageFlow',
    inputSchema: DescribeImageInputSchema,
    outputSchema: DescribeImageOutputSchema,
  },
  async input => {
    const {output} = await describeImagePrompt(input);
    return output!;
  }
);
