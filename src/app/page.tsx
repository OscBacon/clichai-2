"use client";

import { useState } from "react";
import { Header } from "@/components/app/header";
import { CsvUploader } from "@/components/app/csv-uploader";
import { ParticipantTable } from "@/components/app/participant-table";
import { MatchResults } from "@/components/app/match-results";
import { generateMatchesAction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowDown } from "lucide-react";
import type { Participant, Match } from "@/types";

export default function Home() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleUpload = (data: Participant[], headers: string[]) => {
    setParticipants(data);
    setHeaders(headers);
    setMatches([]); // Reset matches on new upload
    toast({
      title: "CSV Uploaded!",
      description: `${data.length} participants loaded successfully.`,
    });
  };

  const handleGenerateMatches = async () => {
    setIsGenerating(true);
    const result = await generateMatchesAction(participants);
    setIsGenerating(false);

    if (result.error) {
      toast({
        variant: "destructive",
        title: "Error Generating Matches",
        description: result.error,
      });
    } else if (result.matches) {
      setMatches(result.matches);
      toast({
        title: "Matches Generated!",
        description: "AI-powered recommendations are ready.",
      });
    }
  };

  const isLoading = isGenerating;
  const hasParticipants = participants.length > 0;
  const hasMatches = matches.length > 0;

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto max-w-5xl px-4 pb-16 space-y-8">
        <CsvUploader onUpload={handleUpload} disabled={isLoading} />
        
        {hasParticipants && !hasMatches && (
          <div className="space-y-8 animate-in fade-in-50 duration-500">
            <div className="flex justify-center">
                <ArrowDown className="h-8 w-8 text-muted-foreground animate-bounce" />
            </div>
            <ParticipantTable
              participants={participants}
              headers={headers}
              onGenerateMatches={handleGenerateMatches}
              isGenerating={isGenerating}
            />
          </div>
        )}

        {isGenerating && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div>
                <Skeleton className="h-6 w-64" />
                <Skeleton className="h-4 w-80 mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-72 w-full" />
              ))}
            </div>
          </div>
        )}
        
        {hasMatches && <MatchResults matches={matches} />}
        
      </div>
    </main>
  );
}
