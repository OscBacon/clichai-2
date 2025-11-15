"use client";

import { useState } from "react";
import { Save, Users, Zap, Check, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
      const promises = matches.map((matchData) => {
        const docData = {
          ...matchData.participant,
          match: matchData.match ? matchData.match : null,
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

  const mainParticipantKeys = Object.keys(matches[0]?.participant || {});

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Zap className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Match Recommendations</h2>
            <p className="text-muted-foreground">
              AI has generated the optimal pairings for your event.
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <Check className="mr-2 h-4 w-4 animate-pulse" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save to Firestore
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <TooltipProvider>
          {matches.map((match, index) => (
            <Card
              key={index}
              className="flex flex-col shadow-lg animate-in fade-in-50 duration-500"
            >
              <CardHeader>
                <CardTitle className="flex items-start justify-between">
                  <span className="font-semibold text-lg">
                    {match.participant[mainParticipantKeys[0]] || "Participant"}
                  </span>
                  {match.match ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge
                          variant="secondary"
                          className="flex items-center gap-1.5 cursor-default"
                        >
                          <Users className="h-3.5 w-3.5" />
                          <span>Matched</span>
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Matched with {match.match[mainParticipantKeys[0]]}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <Badge
                      variant="destructive"
                      className="flex items-center gap-1.5"
                    >
                      <UserX className="h-3.5 w-3.5" />
                      Unmatched
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  {mainParticipantKeys.length > 1
                    ? mainParticipantKeys
                        .slice(1, 3)
                        .map((key) => `${match.participant[key]}`)
                        .join(" / ")
                    : "..."}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                {match.match ? (
                  <div className="bg-muted/50 p-4 rounded-lg space-y-2 h-full">
                    <p className="text-sm font-medium text-muted-foreground">
                      Recommended Match:
                    </p>
                    <h4 className="font-semibold text-foreground">
                      {match.match[mainParticipantKeys[0]]}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {mainParticipantKeys.length > 1
                        ? mainParticipantKeys
                            .slice(1, 3)
                            .map((key) => `${match.match?.[key]}`)
                            .join(" / ")
                        : "..."}
                    </p>
                  </div>
                ) : (
                  <div className="bg-muted/50 p-4 rounded-lg text-center h-full flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">
                      No available match for this participant.
                    </p>
                  </div>
                )}
              </CardContent>
              {match.explanation && (
                <CardFooter>
                  <details className="w-full">
                    <summary className="cursor-pointer text-sm font-medium text-primary hover:underline">
                      Why this match?
                    </summary>
                    <p className="mt-2 text-sm text-foreground/80 border-l-2 border-primary pl-3">
                      {match.explanation}
                    </p>
                  </details>
                </CardFooter>
              )}
            </Card>
          ))}
        </TooltipProvider>
      </div>
    </div>
  );
}
