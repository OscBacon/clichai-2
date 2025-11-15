
"use client";

import { useState, useRef, ChangeEvent, DragEvent } from "react";
import { Upload, Lightbulb, Loader2 } from "lucide-react";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { cn } from "@/lib/utils";

interface CsvUploaderProps {
  onUpload: (data: Participant[], headers: string[], rawCsv: string) => void;
  disabled: boolean;
  rawCsv: string;
}

export function CsvUploader({ onUpload, disabled, rawCsv }: CsvUploaderProps) {
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseFile = (file: File) => {
    Papa.parse<Participant>(file, {
      header: true,
      skipEmptyLines: true,
      delimiter: (input, parser) => {
        // @ts-ignore
        return parser.options.DELIMITERS_TO_GUESS.includes('|') ? {
          delimiter: '|',
          preview: 0
        } : {
          delimiter: ',',
          preview: 0
        };
      },
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

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      parseFile(file);
    }
  };

  const handleSuggestImprovements = async () => {
    if (!rawCsv) {
      setError("Please upload a file first to get suggestions.");
      return;
    }

    setIsSuggesting(true);
    setError(null);

    const result = await getSuggestionsAction(rawCsv);
    if (result.error) {
      setError(result.error);
    } else {
      setSuggestions(result.suggestions || "No specific suggestions found.");
    }
    setIsSuggesting(false);
  };
  
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === "text/csv") {
      parseFile(file);
    } else {
      setError("Please drop a valid .csv file.");
    }
  };


  return (
    <>
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">Upload your CSV</CardTitle>
        <CardDescription>
          Get AI-powered suggestions to find the best match for your next event.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 p-6 pt-0">
        <div 
          className={cn(
            "border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors",
            isDragging ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
          )}
          onClick={() => fileInputRef.current?.click()}
          onDragEnter={handleDragEnter}
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">
            <span className="font-semibold text-primary">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-muted-foreground mt-1">CSV files only</p>
          <Input 
            id="csv-file" 
            type="file" 
            accept=".csv" 
            onChange={handleFileChange} 
            ref={fileInputRef} 
            disabled={disabled} 
            className="hidden"
          />
        </div>
        
        {error && <p className="text-sm text-destructive text-center">{error}</p>}

        <div className="flex justify-center">
            <Button
              variant="ghost"
              onClick={handleSuggestImprovements}
              disabled={isSuggesting || disabled}
              className="text-primary hover:text-primary"
            >
              {isSuggesting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Lightbulb className="mr-2 h-4 w-4" />
              )}
              Get AI Suggestions
            </Button>
        </div>
      </CardContent>

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
