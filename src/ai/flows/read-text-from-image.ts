'use server';

/**
 * @fileOverview Reads text from an image for visually impaired users.
 *
 * - readTextFromImage - A function that takes an image data URI and returns the text found.
 * - ReadTextFromImageInput - The input type for the readTextFromImage function.
 * - ReadTextFromImageOutput - The return type for the readTextFromImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ReadTextFromImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ReadTextFromImageInput = z.infer<typeof ReadTextFromImageInputSchema>;

const ReadTextFromImageOutputSchema = z.object({
  text: z.string().describe('The text found in the image. If no text is found, this should be an empty string or a statement indicating no text was found.'),
});
export type ReadTextFromImageOutput = z.infer<typeof ReadTextFromImageOutputSchema>;

export async function readTextFromImage(input: ReadTextFromImageInput): Promise<ReadTextFromImageOutput> {
  return readTextFromImageFlow(input);
}

const readTextPrompt = ai.definePrompt({
  name: 'readTextPrompt',
  input: {schema: ReadTextFromImageInputSchema},
  output: {schema: ReadTextFromImageOutputSchema},
  prompt: `You are an AI assistant helping a visually impaired user. Read the text from the image provided.

If there is text, read it out exactly as you see it. If there is no text in the image, just respond with "No text found."

Image: {{media url=photoDataUri}}`,
});

const readTextFromImageFlow = ai.defineFlow(
  {
    name: 'readTextFromImageFlow',
    inputSchema: ReadTextFromImageInputSchema,
    outputSchema: ReadTextFromImageOutputSchema,
  },
  async input => {
    const {output} = await readTextPrompt(input);
    return output!;
  }
);
