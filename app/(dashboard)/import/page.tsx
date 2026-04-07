import { ExcelUploadForm } from "@/components/import/excel-upload-form";
import { FileSpreadsheet } from "lucide-react";

export default function ImportPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-xl font-semibold text-foreground">
            Import Leads
          </h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload an Excel file (.xlsx) to bulk import leads. Column headers are
          matched automatically.
        </p>
      </div>
      <ExcelUploadForm />
    </div>
  );
}
