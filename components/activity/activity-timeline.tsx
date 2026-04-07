import { ACTIVITY_TYPE_LABELS, type Activity } from "@/lib/db/types";
import { formatRelativeTime } from "@/lib/utils/format";
import {
  Phone,
  PhoneOff,
  MessageSquare,
  FileText,
  Calendar,
  StickyNote,
  Inbox,
} from "lucide-react";
import type { ActivityType } from "@/lib/db/types";

const ACTIVITY_ICONS: Record<ActivityType, React.ElementType> = {
  called: Phone,
  left_voicemail: PhoneOff,
  texted: MessageSquare,
  proposal_sent: FileText,
  follow_up_scheduled: Calendar,
  note: StickyNote,
};

const ACTIVITY_ICON_COLORS: Record<ActivityType, string> = {
  called: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400",
  left_voicemail: "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400",
  texted: "bg-teal-100 text-teal-600 dark:bg-teal-900/40 dark:text-teal-400",
  proposal_sent: "bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400",
  follow_up_scheduled: "bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400",
  note: "bg-muted text-muted-foreground",
};

interface ActivityTimelineProps {
  activities: Activity[];
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
        <Inbox className="h-8 w-8 mb-2 opacity-40" />
        <p className="text-sm">No activity yet</p>
        <p className="text-xs mt-0.5">Log a call, text, or note above</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {activities.map((activity, i) => {
        const Icon = ACTIVITY_ICONS[activity.type] ?? StickyNote;
        const colorClass = ACTIVITY_ICON_COLORS[activity.type] ?? "bg-muted text-muted-foreground";
        const isLast = i === activities.length - 1;

        return (
          <div key={activity.id} className="flex gap-3 group">
            {/* Timeline column */}
            <div className="flex flex-col items-center relative">
              <div
                className={`flex h-7 w-7 items-center justify-center shrink-0 ${colorClass}`}
              >
                <Icon className="h-3.5 w-3.5" />
              </div>
              {!isLast && (
                <div className="w-px flex-1 bg-muted-foreground/30" />
              )}
            </div>

            {/* Content */}
            <div className={`flex-1 min-w-0 ${isLast ? "pb-0" : "pb-3"}`}>
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-sm font-medium text-foreground">
                  {ACTIVITY_TYPE_LABELS[activity.type]}
                </p>
                <span className="text-[11px] text-muted-foreground shrink-0">
                  {formatRelativeTime(activity.created_at)}
                </span>
              </div>
              {activity.content && (
                <p className="mt-0.5 text-sm text-muted-foreground leading-snug">
                  {activity.content}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
