"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function LeadsError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="max-w-md text-center space-y-4">
        <AlertCircle className="mx-auto h-10 w-10 text-muted-foreground/50" />
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Failed to load leads
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            There was a problem loading your leads. Check your connection and try
            again.
          </p>
        </div>
        <Button onClick={reset} variant="outline" size="sm">
          Try again
        </Button>
      </div>
    </div>
  );
}
