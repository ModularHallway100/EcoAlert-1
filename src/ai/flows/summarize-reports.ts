
'use server';

/**
 * @fileOverview Summarizes a list of community environmental reports using AI.
 *
 * - summarizeReports - A function that generates a summary of environmental reports.
 * - Report - The type for a single report.
 * - SummarizeReportsInput - The input type for the summarizeReports function.
 * - SummarizeReportsOutput - The return type for the summarizeReports function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ReportSchema = z.object({
  type: z.string().describe('The category of the report (e.g., "Illegal Dumping", "Strange Odor").'),
  description: z.string().describe('A detailed description of the incident.'),
  location: z.string().describe('The location where the incident was observed.'),
});
export type Report = z.infer<typeof ReportSchema>;

const SummarizeReportsInputSchema = z.object({
  reports: z.array(ReportSchema),
});
export type SummarizeReportsInput = z.infer<typeof SummarizeReportsInputSchema>;

const SummarizeReportsOutputSchema = z.object({
    title: z.string().describe("A short, engaging title for the summary (e.g., 'Community Health Watch')."),
    summary: z.string().describe('A concise paragraph (2-3 sentences) summarizing the key trends and most urgent issues from the reports.'),
    priority: z.enum(['Low', 'Medium', 'High']).describe('The overall priority level based on the severity and frequency of the reports.'),
});
export type SummarizeReportsOutput = z.infer<typeof SummarizeReportsOutputSchema>;


export async function summarizeReports(input: SummarizeReportsInput): Promise<SummarizeReportsOutput> {
  return summarizeReportsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeReportsPrompt',
  input: {schema: SummarizeReportsInputSchema},
  output: {schema: SummarizeReportsOutputSchema},
  prompt: `You are an AI assistant for a community environmental monitoring app. Your task is to analyze a list of recent user-submitted reports and provide a high-level summary.

  Analyze the following reports:
  {{#each reports}}
  - **Type:** {{{type}}}
    **Location:** {{{location}}}
    **Description:** {{{description}}}
  {{/each}}

  Based on these reports, generate a summary that includes:
  1.  **Title**: A short, engaging title for the summary.
  2.  **Summary**: A concise paragraph (2-3 sentences) highlighting the most common or severe issues. Identify any patterns (e.g., multiple reports in the same area).
  3.  **Priority**: An overall priority level ('Low', 'Medium', 'High') based on the potential impact on community health and safety. For example, chemical smells or water issues are high priority.
  `,
});

const summarizeReportsFlow = ai.defineFlow(
  {
    name: 'summarizeReportsFlow',
    inputSchema: SummarizeReportsInputSchema,
    outputSchema: SummarizeReportsOutputSchema,
  },
  async input => {
    if (input.reports.length === 0) {
        return {
            title: "All Clear",
            summary: "No recent environmental incidents have been reported by the community. Keep up the great work!",
            priority: "Low",
        };
    }
    const {output} = await prompt(input);
    return output!;
  }
);
