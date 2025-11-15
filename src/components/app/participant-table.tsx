
"use client";

import { Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Participant } from "@/types";

interface ParticipantTableProps {
  participants: Participant[];
  headers: string[];
  onGenerateMatches: () => void;
  isGenerating: boolean;
}

export function ParticipantTable({
  participants,
  headers,
  onGenerateMatches,
  isGenerating,
}: ParticipantTableProps) {
  return (
    <div className="p-6">
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <CardTitle className="text-2xl font-semibold">
          Review Participants ({participants.length})
        </CardTitle>
          <Button onClick={onGenerateMatches} disabled={isGenerating} size="sm">
            {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Generate Matches
          </Button>
        </div>
        <CardDescription>
          Review the uploaded participant data below. When ready, generate the AI-powered matches.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96 w-full rounded-md border">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow>
                {headers.map((header) => (
                  <TableHead key={header}>{header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {participants.map((participant, index) => (
                <TableRow key={index}>
                  {headers.map((header) => (
                    <TableCell key={header} className="whitespace-nowrap">{participant[header]}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </div>
  );
}
