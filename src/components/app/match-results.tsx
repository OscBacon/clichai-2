
"use client";

import { useState } from "react";
import { Save, Users, Zap, Check, UserX, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
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

  const uniqueMatches = matches.filter(
    (match, index) =>
      !match.match ||
      matches.findIndex(
        (m) =>
          m.participant === match.match && m.match === match.participant
      ) > index
  );

  return (
    <div className="bg-card rounded-xl border shadow-sm p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-semibold">Your Matches</h2>
        <Button onClick={handleSave} disabled={isSaving} size="sm">
          {isSaving ? (
            <Check className="mr-2" />
          ) : (
            <Save className="mr-2" />
          )}
          Save to Firestore
        </Button>
      </div>

      <div className="space-y-2">
        {uniqueMatches.map((match, index) => (
          <Accordion type="single" collapsible className="w-full" key={index}>
            <AccordionItem value={`item-${index}`} className="border-b-0">
                <div className="flex items-center gap-4 text-sm font-medium p-4 rounded-lg bg-secondary/50">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 text-white font-bold text-xs">
                    {index + 1}
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    <span>
                      {match.participant[mainParticipantKey] || "Participant"}
                    </span>
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
                  <AccordionTrigger className="p-2 hover:no-underline [&[data-state=open]>svg]:text-primary" />
                </div>
              <AccordionContent>
                <div className="p-4 bg-background rounded-b-lg">
                  <div className="pl-12 text-muted-foreground space-y-2 text-sm">
                    {match.explanation ? (
                      <>
                        <p className="font-semibold text-foreground">AI Explanation:</p>
                        <p>{match.explanation}</p>
                      </>
                    ) : (
                      <p>No available match for this participant.</p>
                    )}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ))}
      </div>
    </div>
  );
}
