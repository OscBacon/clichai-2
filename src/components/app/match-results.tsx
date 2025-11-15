
"use client";

import { useState } from "react";
import { Save, Users, Zap, Check, UserX, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { Match } from "@/types";

interface MatchResultsProps {
  matches: Match[];
}

export function MatchResults({ matches }: MatchResultsProps) {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const partyId = `party-${Date.now()}`;
      // We only want to save one side of the match to avoid duplicates
      const uniqueMatches = matches.filter(
        (match, index) =>
          !match.match ||
          matches.findIndex(
            (m) =>
              m.participant === match.match && m.match === match.participant
          ) > index
      );

      const promises = uniqueMatches.map((matchData) => {
        const docData = {
          participant1: matchData.participant,
          participant2: matchData.match,
          explanation: matchData.explanation,
          partyId: partyId,
        };
        return addDoc(collection(db, "parties"), docData);
      });

      await Promise.all(promises);

      toast({
        title: "Success!",
        description: "Meeting matches have been saved to Firestore.",
      });
    } catch (error) {
      console.error("Error saving to Firestore: ", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          "Could not save matches to Firestore. Check your Firebase setup and console for errors.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const mainParticipantKey = Object.keys(matches[0]?.participant || {})[0];

  // We only want to display one side of the match
  const uniqueMatches = matches.filter(
    (match, index) =>
      !match.match ||
      matches.findIndex(
        (m) =>
          m.participant === match.match && m.match === match.participant
      ) > index
  );

  return (
    <div className="p-6">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-2xl font-semibold">
            Your Matches
          </CardTitle>
          <Button onClick={handleSave} disabled={isSaving} size="sm">
            {isSaving ? (
              <Check className="mr-2" />
            ) : (
              <Save className="mr-2" />
            )}
            Save to Firestore
          </Button>
        </div>
        <CardDescription>
          AI has generated the optimal pairings for your event.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Accordion type="multiple" className="w-full">
          {uniqueMatches.map((match, index) => (
            <AccordionItem value={`item-${index}`} key={index}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-4 text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <span>
                      {match.participant[mainParticipantKey] || "Participant"}
                    </span>
                  </div>
                  {match.match ? (
                    <>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-muted-foreground">
                      <path d="M21 12H3M3 12L8 7M3 12L8 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M3 12H21M21 12L16 7M21 12L16 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>
                      {match.match[mainParticipantKey]}
                    </span>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 text-destructive">
                       <UserX className="h-4 w-4" />
                       <span>Unmatched</span>
                    </div>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pl-8 text-muted-foreground space-y-2">
                  {match.explanation ? (
                    <>
                      <p className="font-semibold text-foreground">AI Explanation:</p>
                      <p>{match.explanation}</p>
                    </>
                  ) : (
                     <p>No available match for this participant.</p>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </div>
  );
}
