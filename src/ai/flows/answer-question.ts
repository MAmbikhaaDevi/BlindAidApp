'use server';

/**
 * @fileOverview Answers a general question from the user.
 *
 * - answerQuestion - A function that takes a user's query and returns a spoken response.
 * - AnswerQuestionInput - The input type for the answerQuestion function.
 * - AnswerQuestionOutput - The return type for the answerQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnswerQuestionInputSchema = z.object({
  query: z.string().describe('The question asked by the user.'),
});
export type AnswerQuestionInput = z.infer<typeof AnswerQuestionInputSchema>;

const AnswerQuestionOutputSchema = z.object({
  response: z.string().describe('A concise and helpful answer to the user\'s question.'),
});
export type AnswerQuestionOutput = z.infer<typeof AnswerQuestionOutputSchema>;

export async function answerQuestion(input: AnswerQuestionInput): Promise<AnswerQuestionOutput> {
  return answerQuestionFlow(input);
}

const answerQuestionPrompt = ai.definePrompt({
  name: 'answerQuestionPrompt',
  input: {schema: AnswerQuestionInputSchema},
  output: {schema: AnswerQuestionOutputSchema},
  prompt: `You are a friendly and helpful voice assistant for the BLIND AID app. A user has asked a question. Provide a clear and concise answer.

User's question: "{{query}}"`,
});

const answerQuestionFlow = ai.defineFlow(
  {
    name: 'answerQuestionFlow',
    inputSchema: AnswerQuestionInputSchema,
    outputSchema: AnswerQuestionOutputSchema,
  },
  async input => {
    const {output} = await answerQuestionPrompt(input);
    return output!;
  }
);
