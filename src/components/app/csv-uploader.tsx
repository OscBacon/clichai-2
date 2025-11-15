"use client";

import { useState, useRef, ChangeEvent, DragEvent } from "react";
import { Upload, Loader2 } from "lucide-react";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import type { Participant } from "@/types";
import { cn } from "@/lib/utils";

interface CsvUploaderProps {
    onUpload: (data: Participant[], headers: string[], rawCsv: string) => void;
    disabled: boolean;
    rawCsv: string;
    onGenerateMatches: () => void;
}

export function CsvUploader({
    onUpload,
    disabled,
    rawCsv,
    onGenerateMatches,
}: CsvUploaderProps) {
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [hasFile, setHasFile] = useState(false);

    const parseFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const csvText = e.target?.result as string;
            if (!csvText) {
                setError("Could not read file.");
                setHasFile(false);
                return;
            }

            Papa.parse<Participant>(csvText, {
                header: true,
                skipEmptyLines: true,
                dynamicTyping: true,
                complete: (results) => {
                    if (results.errors.length) {
                        setError(
                            `Error parsing CSV: ${results.errors[0].message}`
                        );
                        setHasFile(false);
                    } else if (results.data.length === 0) {
                        setError("CSV file is empty or headers are missing.");
                        setHasFile(false);
                    } else {
                        onUpload(
                            results.data,
                            results.meta.fields || [],
                            csvText
                        );
                        setError(null);
                        setHasFile(true);
                    }
                },
            });
        };
        reader.readAsText(file);
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            parseFile(file);
        }
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
        if (file && (file.type === "text/csv" || file.name.endsWith(".csv"))) {
            parseFile(file);
        } else {
            setError("Please drop a valid .csv file.");
        }
    };

    return (
        <div className="space-y-6">
            <Card
                className={cn(
                    "border-dashed border-2 rounded-xl transition-colors",
                    isDragging
                        ? "border-primary bg-primary/5"
                        : "border-border/50",
                    disabled && "pointer-events-none opacity-50"
                )}
                onClick={() => fileInputRef.current?.click()}
                onDragEnter={handleDragEnter}
                onDragOver={(e) => e.preventDefault()}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <CardContent className="p-8 text-center cursor-pointer">
                    <div className="mx-auto h-12 w-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white">
                        <Upload className="h-6 w-6" />
                    </div>
                    <p className="mt-4 font-semibold text-foreground">
                        Drag and drop your file here
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                        or click to browse
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                        CSV, Excel, PDF
                    </p>
                    <Input
                        id="csv-file"
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                        disabled={disabled}
                        className="hidden"
                    />
                </CardContent>
            </Card>

            {error && (
                <p className="text-sm text-destructive text-center">{error}</p>
            )}

            <div className="flex justify-center">
                <Button
                    onClick={onGenerateMatches}
                    disabled={!hasFile || disabled}
                    size="lg"
                    className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold"
                >
                    {disabled && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Generate Matches
                </Button>
            </div>
        </div>
    );
}
