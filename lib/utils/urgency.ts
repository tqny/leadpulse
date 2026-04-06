import { differenceInHours, differenceInMinutes } from "date-fns";

export type UrgencyLevel = "green" | "yellow" | "red";

export function getUrgencyLevel(createdAt: string): UrgencyLevel {
  const hours = differenceInHours(new Date(), new Date(createdAt));
  if (hours < 1) return "green";
  if (hours < 4) return "yellow";
  return "red";
}

export function getUrgencyLabel(createdAt: string): string {
  const now = new Date();
  const created = new Date(createdAt);
  const mins = differenceInMinutes(now, created);

  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}
