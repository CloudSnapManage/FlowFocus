
'use server';
/**
 * @fileOverview An AI flow to generate flashcards from text content.
 *
 * - generateFlashcards - A function that creates flashcards from a given text.
 * - GenerateFlashcardsInput - The input type for the flashcard generator.
 * - GenerateFlashcardsOutput - The output type representing the generated cards.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateFlashcardsInputSchema = z.object({
  content: z.string().describe('The text content to be converted into flashcards.'),
});
export type GenerateFlashcardsInput = z.infer<typeof GenerateFlashcardsInputSchema>;

const FlashcardSchema = z.object({
  question: z.string().describe('The question for the flashcard.'),
  answer: z.string().describe('The answer to the flashcard question.'),
});

const GenerateFlashcardsOutputSchema = z.object({
  cards: z.array(FlashcardSchema).describe('An array of 5 to 10 generated flashcards.'),
});
export type GenerateFlashcardsOutput = z.infer<typeof GenerateFlashcardsOutputSchema>;

export async function generateFlashcards(input: GenerateFlashcardsInput): Promise<GenerateFlashcardsOutput> {
  return generateFlashcardsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFlashcardsPrompt',
  input: { schema: GenerateFlashcardsInputSchema },
  output: { schema: GenerateFlashcardsOutputSchema },
  prompt: `You are an AI assistant that excels at creating study materials.
  
Based on the following text, generate a set of 5 to 10 flashcards in a simple Question/Answer format.
Focus on the most important concepts, definitions, and key takeaways from the text.
Ensure questions are clear and answers are concise.

Text content:
"""
{{{content}}}
"""

Generate the flashcards and return them in the specified JSON format.`,
});

const generateFlashcardsFlow = ai.defineFlow(
  {
    name: 'generateFlashcardsFlow',
    inputSchema: GenerateFlashcardsInputSchema,
    outputSchema: GenerateFlashcardsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
