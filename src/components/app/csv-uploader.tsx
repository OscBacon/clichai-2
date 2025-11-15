"use client";

import { useState, useRef, ChangeEvent } from "react";
import { Upload, Lightbulb, Loader2 } from "lucide-react";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { getSuggestionsAction } from "@/lib/actions";
import type { Participant } from "@/types";

interface CsvUploaderProps {
  onUpload: (data: Participant[], headers: string[], rawCsv: string) => void;
  disabled: boolean;
}

export function CsvUploader({ onUpload, disabled }: CsvUploaderProps) {
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      Papa.parse<Participant>(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length) {
            setError(`Error parsing CSV: ${results.errors[0].message}`);
          } else if (results.data.length === 0) {
            setError("CSV file is empty or headers are missing.");
          } else {
            const fileReader = new FileReader();
            fileReader.onload = (e) => {
              const content = e.target?.result as string;
              onUpload(results.data, results.meta.fields || [], content);
              setError(null);
            };
            fileReader.readAsText(file);
          }
        },
      });
    }
  };

  const handleSuggestImprovements = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setError("Please select a file first to get suggestions.");
      return;
    }

    setIsSuggesting(true);
    setError(null);

    const fileReader = new FileReader();
    fileReader.onload = async (e) => {
      const content = e.target?.result as string;
      const result = await getSuggestionsAction(content);
      if (result.error) {
        setError(result.error);
      } else {
        setSuggestions(result.suggestions || "No specific suggestions found.");
      }
      setIsSuggesting(false);
    };
    fileReader.readAsText(file);
  };

  return (
    <>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-6 w-6" />
            Upload Participants
          </CardTitle>
          <CardDescription>
            Upload a CSV file with participant data to start matching.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="csv-file">CSV File</Label>
            <Input id="csv-file" type="file" accept=".csv" onChange={handleFileChange} ref={fileInputRef} disabled={disabled} className="hidden"/>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => fileInputRef.current?.click()} disabled={disabled}>
              <Upload className="mr-2 h-4 w-4" /> Choose File
            </Button>
            <Button
              variant="outline"
              onClick={handleSuggestImprovements}
              disabled={isSuggesting || disabled}
            >
              {isSuggesting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Lightbulb className="mr-2 h-4 w-4" />
              )}
              AI Suggestions
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!suggestions} onOpenChange={(open) => !open && setSuggestions(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>AI Improvement Suggestions</DialogTitle>
            <DialogDescription>
              Here are some suggestions to improve your CSV for better matching results.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto rounded-md border p-4 text-sm">
            <p style={{ whiteSpace: 'pre-wrap' }}>{suggestions}</p>
          </div>
          <DialogFooter>
            <Button onClick={() => setSuggestions(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
