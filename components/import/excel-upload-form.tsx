"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle } from "lucide-react";

interface ImportResult {
  created: number;
  errors: { row: number; message: string }[];
}

export function ExcelUploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
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

  return (
    <div className="max-w-lg space-y-6">
      {/* Drop zone */}
      <div
        className="rounded-lg border-2 border-dashed border-border bg-card px-6 py-12 text-center hover:border-ring cursor-pointer transition-colors"
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
        <p className="mt-2 text-sm font-medium text-foreground">
          {file ? file.name : "Click to select an Excel file"}
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
        <FileSpreadsheet className="h-4 w-4" />
        <span>
          Need a template? Use columns:{" "}
          <code className="text-xs bg-muted px-1 py-0.5 rounded">
            Name, Phone, Email, City, State, Job Type, Service Type, Message
          </code>
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
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="text-sm text-green-700">
              {result.created} lead{result.created !== 1 ? "s" : ""} imported
              successfully.
            </p>
          </div>

          {result.errors.length > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <p className="text-sm font-medium text-amber-700">
                  {result.errors.length} row{result.errors.length !== 1 ? "s" : ""} skipped
                </p>
              </div>
              <ul className="space-y-1">
                {result.errors.map((err, i) => (
                  <li key={i} className="text-xs text-amber-600">
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
