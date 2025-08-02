// src/ai/flows/suggest-locator.ts
'use server';
/**
 * @fileOverview AI-powered locator suggestion flow.
 *
 * This file defines a Genkit flow that takes a URL and a CSS selector as input,
 * captures a screenshot of the page, and uses an LLM to suggest alternative
 * locators based on the screenshot and best practices.
 *
 * @exports suggestLocator - The main function to trigger the locator suggestion flow.
 * @exports SuggestLocatorInput - The input type for the suggestLocator function.
 * @exports SuggestLocatorOutput - The output type for the suggestLocator function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestLocatorInputSchema = z.object({
  url: z.string().url().describe('The URL of the page to analyze.'),
  currentLocator: z.string().describe('The CSS selector to evaluate.'),
  screenshotDataUri: z
    .string()
    .describe(
      "A screenshot of the page, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type SuggestLocatorInput = z.infer<typeof SuggestLocatorInputSchema>;

const SuggestLocatorOutputSchema = z.object({
  suggestedLocators: z
    .array(z.string())
    .describe('An array of suggested alternative CSS selectors.'),
  reasoning: z.string().describe('The AI reasoning behind the suggestions.'),
});
export type SuggestLocatorOutput = z.infer<typeof SuggestLocatorOutputSchema>;

export async function suggestLocator(input: SuggestLocatorInput): Promise<SuggestLocatorOutput> {
  return suggestLocatorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestLocatorPrompt',
  input: {schema: SuggestLocatorInputSchema},
  output: {schema: SuggestLocatorOutputSchema},
  prompt: `You are an expert in UI test automation. Given a screenshot of a web page and a CSS selector that a user wants to test, you will analyze the selector and the screenshot and suggest alternative, more robust CSS selectors.

  Here is the screenshot:
  {{media url=screenshotDataUri}}

  Here is the current CSS selector:
  {{currentLocator}}

  Consider the following best practices when suggesting alternative locators:
  *   Use specific and descriptive class names or IDs.
  *   Avoid fragile locators that rely on text content or positional information.
  *   Prioritize locators that are unlikely to change over time.

  Respond with an array of suggested CSS selectors, and a short explanation of why each suggestion is better than the original.
  Ensure that suggestedLocators is an array of strings.
  `,
});

const suggestLocatorFlow = ai.defineFlow(
  {
    name: 'suggestLocatorFlow',
    inputSchema: SuggestLocatorInputSchema,
    outputSchema: SuggestLocatorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
