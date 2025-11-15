
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

  try {
    const matches: Match[] = [];
    const matchedIndices = new Set<number>();

    // Create a mutable copy of participants to track who is available
    const availableParticipants = [...participants];

    for (let i = 0; i < participants.length; i++) {
      if (matchedIndices.has(i)) continue;

      const participant1 = participants[i];
      let bestMatchIndex = -1;
      
      // Find the best match from the remaining available participants
      let potentialMatchIndex = -1;
      for (let j = i + 1; j < participants.length; j++) {
        if (!matchedIndices.has(j)) {
          potentialMatchIndex = j;
          break;
        }
      }

      bestMatchIndex = potentialMatchIndex;
      
      if (bestMatchIndex !== -1) {
        const participant2 = participants[bestMatchIndex];
        
        const explanationResult = await generateMatchExplanation({
          participant1Data: JSON.stringify(participant1),
          participant2Data: JSON.stringify(participant2),
        });

        matches.push({
          participant: participant1,
          match: participant2,
          explanation: explanationResult.explanation,
        });

        // Add the other side of the match for completeness in the data structure
        matches.push({
          participant: participant2,
          match: participant1,
          explanation: explanationResult.explanation,
        });

        matchedIndices.add(i);
        matchedIndices.add(bestMatchIndex);

      } else {
        // This participant is the last one left, so they are unmatched
        matches.push({
          participant: participant1,
          match: null,
          explanation: "No available partner for this participant.",
        });
        matchedIndices.add(i);
      }
    }

    // Sort matches based on original participant order to maintain consistency
    const participantOrder = new Map(participants.map((p, i) => [p, i]));
    const sortedMatches = matches.sort((a, b) => {
      return (participantOrder.get(a.participant) ?? 0) - (participantOrder.get(b.participant) ?? 0);
    });

    return { matches: sortedMatches };

  } catch (e: any) {
    console.error("Error in AI match generation:", e);
    return { error: "The AI failed to generate matches. Please check your data or try again." };
  }
}
