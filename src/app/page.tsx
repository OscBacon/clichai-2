
"use client";

import { useState } from "react";
import { Header } from "@/components/app/header";
import { CsvUploader } from "@/components/app/csv-uploader";
import { ParticipantTable } from "@/components/app/participant-table";
import { MatchResults } from "@/components/app/match-results";
import { generateMatchesAction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import type { Participant, Match } from "@/types";

export default function Home() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawCsv, setRawCsv] = useState<string>("");
  const [matches, setMatches] = useState<Match[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleUpload = (
    data: Participant[],
    headers: string[],
    csvContent: string
  ) => {
    setParticipants(data);
    setHeaders(headers);
    setRawCsv(csvContent);
    setMatches([]); // Reset matches on new upload
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
    }
  };

  const isLoading = isGenerating;
  const hasParticipants = participants.length > 0;
  const hasMatches = matches.length > 0;

  return (
    <div className="flex flex-col items-center min-h-screen bg-background p-4 md:p-8">
      <Header />
      <main className="w-full max-w-4xl space-y-6 mt-8 bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            AI-Powered Matchmaking
          </h1>
          <p className="mt-3 text-lg leading-8 text-gray-600">
            Upload a CSV of participants and let our AI find the perfect
            matches.
          </p>
        </div>
        {!hasParticipants && !isLoading && (
          <CsvUploader
            onUpload={handleUpload}
            disabled={isLoading}
            rawCsv={rawCsv}
            onGenerateMatches={handleGenerateMatches}
          />
        )}

        {hasParticipants && !hasMatches && !isLoading && (
          <ParticipantTable
            participants={participants}
            headers={headers}
            onGenerateMatches={handleGenerateMatches}
            isGenerating={isGenerating}
          />
        )}

        {isLoading && (
          <div className="p-8 space-y-6 bg-card rounded-xl border shadow-sm">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div>
                <Skeleton className="h-6 w-64" />
                <Skeleton className="h-4 w-80 mt-1" />
              </div>
            </div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          </div>
        )}

        {hasMatches && <MatchResults matches={matches} />}
      </main>
    </div>
  );
}
