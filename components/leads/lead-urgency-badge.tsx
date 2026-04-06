import { Badge } from "@/components/ui/badge";
import {
  getUrgencyLevel,
  getUrgencyLabel,
  type UrgencyLevel,
} from "@/lib/utils/urgency";
import { cn } from "@/lib/utils";

const URGENCY_COLORS: Record<UrgencyLevel, string> = {
  green: "bg-green-100 text-green-700",
  yellow: "bg-amber-100 text-amber-700",
  red: "bg-red-100 text-red-700",
};

interface LeadUrgencyBadgeProps {
  createdAt: string;
  status: string;
}

export function LeadUrgencyBadge({ createdAt, status }: LeadUrgencyBadgeProps) {
  if (status !== "new") return null;

  const level = getUrgencyLevel(createdAt);
  const label = getUrgencyLabel(createdAt);

  return (
    <Badge
      variant="secondary"
      className={cn("text-xs font-medium", URGENCY_COLORS[level])}
    >
      {label}
    </Badge>
  );
}
