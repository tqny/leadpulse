"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ImportResult {
  created: number;
  errors: { row: number; message: string }[];
}

export function ExcelUploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setResult(null);
      setError(null);
    }
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const droppedFile = e.dataTransfer.files[0];
    if (
      droppedFile &&
      (droppedFile.name.endsWith(".xlsx") || droppedFile.name.endsWith(".xls"))
    ) {
      setFile(droppedFile);
      setResult(null);
      setError(null);
    } else {
      setError("Please drop an .xlsx or .xls file");
    }
  }, []);

  async function handleUpload() {
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/intake/excel", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Upload failed");
      return;
    }

    setResult(data);
  }

  function handleReset() {
    setFile(null);
    setResult(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleDownloadTemplate() {
    const { utils, writeFile } = await import("xlsx");
    const headers = [
      "Name",
      "Phone",
      "Email",
      "City",
      "State",
      "Job Type",
      "Service Type",
      "Message",
    ];
    const exampleRows = [
      [
        "John Smith",
        "(555) 123-4567",
        "john@example.com",
        "Austin",
        "TX",
        "Residential Garage",
        "Full Flake Epoxy",
        "Interested in 2-car garage floor",
      ],
      [
        "Jane Doe",
        "(555) 987-6543",
        "jane@example.com",
        "Dallas",
        "TX",
        "Commercial Warehouse",
        "Solid Color Epoxy",
        "5000 sqft warehouse floor",
      ],
    ];

    const ws = utils.aoa_to_sheet([headers, ...exampleRows]);
    ws["!cols"] = headers.map(() => ({ wch: 20 }));
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Leads");
    writeFile(wb, "leadpulse-import-template.xlsx");
  }

  return (
    <div className="max-w-lg space-y-6">
      {/* Drop zone */}
      <div
        className={cn(
          "rounded-lg border-2 border-dashed px-6 py-12 text-center cursor-pointer transition-colors",
          isDragOver
            ? "border-primary bg-primary/5 scale-[1.01]"
            : "border-border bg-muted hover:border-ring"
        )}
        onClick={() => inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragEnter={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload
          className={cn(
            "mx-auto h-8 w-8 transition-colors",
            isDragOver ? "text-primary" : "text-muted-foreground"
          )}
        />
        <p className="mt-2 text-sm font-medium text-foreground">
          {file
            ? file.name
            : isDragOver
              ? "Drop your file here"
              : "Drag & drop or click to select an Excel file"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          .xlsx or .xls files accepted
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Template download */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <FileSpreadsheet className="h-4 w-4 shrink-0" />
        <span>
          Need a template?{" "}
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="inline-flex items-center gap-1 text-primary underline underline-offset-2 hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Download className="h-3 w-3" />
            Download template
          </button>{" "}
          with correct headers and example rows.
        </span>
      </div>

      {/* Upload button */}
      {file && !result && (
        <Button onClick={handleUpload} disabled={loading}>
          {loading ? "Importing..." : "Import Leads"}
        </Button>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          <div className="rounded-lg border border-secondary/30 bg-secondary/10 p-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-secondary" />
            <p className="text-sm text-foreground">
              {result.created} lead{result.created !== 1 ? "s" : ""} imported
              successfully.
            </p>
          </div>

          {result.errors.length > 0 && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <p className="text-sm font-medium text-foreground">
                  {result.errors.length} row
                  {result.errors.length !== 1 ? "s" : ""} skipped
                </p>
              </div>
              <ul className="space-y-1">
                {result.errors.map((err, i) => (
                  <li key={i} className="text-xs text-muted-foreground">
                    Row {err.row}: {err.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={() => router.push("/leads")} size="sm">
              View Leads
            </Button>
            <Button variant="outline" size="sm" onClick={handleReset}>
              Import Another
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
