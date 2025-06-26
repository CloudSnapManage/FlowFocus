
'use server';
/**
 * @fileOverview An AI flow to generate structured study notes from a video transcript.
 *
 * - summarizeTranscript - A function that creates study notes from a transcript.
 * - SummarizeTranscriptInput - The input type for the summarizer.
 * - SummarizeTranscriptOutput - The output type representing the structured notes.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const SummarizeTranscriptInputSchema = z.object({
  transcript: z.string().describe('The full transcript of a video.'),
  videoTitle: z.string().optional().describe('The original title of the video, if available.'),
  summaryStyle: z.string().optional().describe('The desired persona and style for the summary. e.g., "Academic", "Simple".'),
});
export type SummarizeTranscriptInput = z.infer<typeof SummarizeTranscriptInputSchema>;

const SummarizeTranscriptOutputSchema = z.object({
  title: z.string().describe('A concise, descriptive title for the generated study notes.'),
  summary: z.string().describe('The structured study notes in Markdown format, with headings, lists, and key takeaways.'),
});
export type SummarizeTranscriptOutput = z.infer<typeof SummarizeTranscriptOutputSchema>;

export async function summarizeTranscript(input: SummarizeTranscriptInput): Promise<SummarizeTranscriptOutput> {
  return summarizeTranscriptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeTranscriptPrompt',
  input: { schema: SummarizeTranscriptInputSchema },
  output: { schema: SummarizeTranscriptOutputSchema },
  prompt: `You are an expert academic assistant that excels at creating structured study materials from raw text.
  
Your task is to summarize the following video transcript into detailed study notes.

{{#if summaryStyle}}
**You MUST adopt the following persona and writing style for your summary: {{{summaryStyle}}}**
{{/if}}

- Create a concise, engaging title for the study notes. If a video title is provided, use it as inspiration.
- The summary should be well-structured. Use Markdown for formatting.
- Use clear headings and subheadings to organize the content.
- Use bullet points for key concepts, steps, or lists.
- Bold key terms.
- Include important definitions, examples, or explanations where useful.
- The tone should be educational and clear, unless the specified style dictates otherwise.

{{#if videoTitle}}
Original Video Title: {{{videoTitle}}}
{{/if}}

Transcript:
"""
{{{transcript}}}
"""

Generate the structured study notes and return them in the specified JSON format.`,
});

const summarizeTranscriptFlow = ai.defineFlow(
  {
    name: 'summarizeTranscriptFlow',
    inputSchema: SummarizeTranscriptInputSchema,
    outputSchema: SummarizeTranscriptOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
