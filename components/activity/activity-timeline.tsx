import { ACTIVITY_TYPE_LABELS, type Activity } from "@/lib/db/types";
import { formatRelativeTime } from "@/lib/utils/format";
import { Phone, PhoneOff, MessageSquare, FileText, Calendar, StickyNote } from "lucide-react";
import type { ActivityType } from "@/lib/db/types";

const ACTIVITY_ICONS: Record<ActivityType, React.ElementType> = {
  called: Phone,
  left_voicemail: PhoneOff,
  texted: MessageSquare,
  proposal_sent: FileText,
  follow_up_scheduled: Calendar,
  note: StickyNote,
};

interface ActivityTimelineProps {
  activities: Activity[];
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  if (activities.length === 0) {
    return (
      <p className="text-sm text-slate-400 py-4">No activity yet.</p>
    );
  }

  return (
    <div className="space-y-0">
      {activities.map((activity, i) => {
        const Icon = ACTIVITY_ICONS[activity.type] ?? StickyNote;
        return (
          <div key={activity.id} className="flex gap-3 py-2">
            <div className="flex flex-col items-center">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100">
                <Icon className="h-3 w-3 text-slate-500" />
              </div>
              {i < activities.length - 1 && (
                <div className="w-px flex-1 bg-slate-200 mt-1" />
              )}
            </div>
            <div className="flex-1 pb-2">
              <p className="text-sm font-medium text-slate-700">
                {ACTIVITY_TYPE_LABELS[activity.type]}
              </p>
              {activity.content && (
                <p className="mt-0.5 text-sm text-slate-500">
                  {activity.content}
                </p>
              )}
              <p className="mt-0.5 text-xs text-slate-400">
                {formatRelativeTime(activity.created_at)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
