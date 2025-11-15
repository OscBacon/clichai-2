"use server";

import { generateMatchExplanation } from "@/ai/flows/generate-match-explanation";
import { suggestImprovements } from "@/ai/flows/suggest-improvements-to-uploaded-csv";
import type { Participant, Match } from "@/types";

// Action to get CSV improvement suggestions
export async function getSuggestionsAction(csvContent: string) {
  try {
    const result = await suggestImprovements({ csvContent });
    return { suggestions: result.suggestions };
  } catch (error) {
    console.error("Error getting suggestions:", error);
    return { error: "Failed to get AI suggestions. Please try again." };
  }
}

// Action to generate matches
export async function generateMatchesAction(participants: Participant[]): Promise<{ matches?: Match[], error?: string }> {
  if (participants.length < 2) {
    return { error: "At least two participants are required to generate matches." };
  }

  const matches: Match[] = [];
  const matchedIndices = new Set<number>();

  for (let i = 0; i < participants.length; i++) {
    if (matchedIndices.has(i)) continue;

    let bestMatchIndex = -1;
    // Find the next available participant to match with
    for (let j = i + 1; j < participants.length; j++) {
      if (!matchedIndices.has(j)) {
        bestMatchIndex = j;
        break;
      }
    }

    const participant1 = participants[i];
    
    if (bestMatchIndex !== -1) {
      const participant2 = participants[bestMatchIndex];
      matchedIndices.add(i);
      matchedIndices.add(bestMatchIndex);

      try {
        const explanationResult = await generateMatchExplanation({
          participant1Data: JSON.stringify(participant1),
          participant2Data: JSON.stringify(participant2),
        });

        matches.push({
          participant: participant1,
          match: participant2,
          explanation: explanationResult.explanation,
        });

        // Add the other side of the match
        matches.push({
          participant: participant2,
          match: participant1,
          explanation: explanationResult.explanation,
        });

      } catch (error) {
        console.error("Error generating match explanation:", error);
        // If explanation fails, still create the match but with an error message
        const explanation = "Could not generate AI explanation for this match.";
        matches.push({ participant: participant1, match: participant2, explanation });
        matches.push({ participant: participant2, match: participant1, explanation });
      }
    } else {
      // Participant couldn't be matched (e.g., odd one out)
      matches.push({
        participant: participant1,
        match: null,
        explanation: null,
      });
      matchedIndices.add(i);
    }
  }

  // Sort matches based on original participant order
  const sortedMatches = participants.map(p => {
    return matches.find(m => m.participant === p)!;
  })

  return { matches: sortedMatches };
}
