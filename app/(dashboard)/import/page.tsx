import { ExcelUploadForm } from "@/components/import/excel-upload-form";

export default function ImportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Import Leads</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload an Excel file (.xlsx) to bulk import leads. Column headers are
          matched automatically.
        </p>
      </div>
      <ExcelUploadForm />
    </div>
  );
}
