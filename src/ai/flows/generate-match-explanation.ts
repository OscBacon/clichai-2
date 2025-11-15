"use server";

/**
 * @fileOverview AI flow for generating explanations for recommended matches between participants.
 *
 * - generateMatchExplanation - A function that generates a match explanation.
 * - GenerateMatchExplanationInput - The input type for the generateMatchExplanation function.
 * - GenerateMatchExplanationOutput - The return type for the generateMatchExplanation function.
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";

const GenerateMatchExplanationInputSchema = z.object({
  participant1Data: z.string().describe("Data for the first participant."),
  participant2Data: z.string().describe("Data for the second participant."),
});
export type GenerateMatchExplanationInput = z.infer<
  typeof GenerateMatchExplanationInputSchema
>;

const GenerateMatchExplanationOutputSchema = z.object({
  explanation: z
    .string()
    .describe("Explanation of why the two participants are a good match."),
});
export type GenerateMatchExplanationOutput = z.infer<
  typeof GenerateMatchExplanationOutputSchema
>;

export async function generateMatchExplanation(
  input: GenerateMatchExplanationInput
): Promise<GenerateMatchExplanationOutput> {
  return generateMatchExplanationFlow(input);
}

const prompt = ai.definePrompt({
  name: "generateMatchExplanationPrompt",
  input: { schema: GenerateMatchExplanationInputSchema },
  output: { schema: GenerateMatchExplanationOutputSchema },
  prompt: `You are an expert matchmaker. Your goal is to find the best possible match for everyone.
  Given the data for two participants, provide a concise, one-line explanation for why they are a good match.
  Make an effort to match everyone even if the data is limited.
  If the match is not very strong, please say so and explain why briefly.

  Participant 1 Data: {{{participant1Data}}}
  Participant 2 Data: {{{participant2Data}}}
  `,
});

const generateMatchExplanationFlow = ai.defineFlow(
  {
    name: "generateMatchExplanationFlow",
    inputSchema: GenerateMatchExplanationInputSchema,
    outputSchema: GenerateMatchExplanationOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
