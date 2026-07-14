import { Clock } from "lucide-react";
import { PremiumCard, SectionHeader } from "./premium-card";
import type { TimelineEvent } from "@/lib/mock-data";

interface TimelineViewerProps {
  events?: TimelineEvent[];
}

const typeStyles: Record<string, { dot: string; label: string }> = {
  start: { dot: "bg-blue-500", label: "Start" },
  decision: { dot: "bg-emerald-500", label: "Decision" },
  action: { dot: "bg-purple-500", label: "Action" },
  risk: { dot: "bg-amber-500", label: "Risk" },
  end: { dot: "bg-gray-500", label: "End" },
};

export function TimelineViewer({ events = [] }: TimelineViewerProps) {
  if (events.length === 0) {
    return null;
  }

  return (
    <section className="mb-12">
      <SectionHeader
        icon={<Clock className="size-5" strokeWidth={1.75} />}
        title="Meeting Timeline"
      />

      <PremiumCard>
        <div className="relative space-y-6">
          {/* Timeline line */}
          <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-emerald-500 to-gray-500" />

          {/* Events */}
          {events.map((event, i) => {
            const style = typeStyles[event.type] || typeStyles.action;
            return (
              <div key={event.id} className="relative pl-12">
                {/* Dot */}
                <div
                  className={`absolute left-0 top-1 size-7 rounded-full border-2 border-background ${style.dot}`}
                />

                {/* Content */}
                <div className="space-y-1">
                  <p className="text-sm font-medium">{event.label}</p>
                  <p className="text-xs text-muted-foreground">{event.timestamp}</p>
                </div>
              </div>
            );
          })}
        </div>
      </PremiumCard>
    </section>
  );
}
