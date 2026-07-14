import { Link } from "@tanstack/react-router";
import { Brain } from "lucide-react";
import { PremiumCard, SectionHeader } from "./premium-card";
import type { RelatedMeeting } from "@/lib/mock-data";

interface MeetingMemoryProps {
  relatedMeetings?: RelatedMeeting[];
}

export function MeetingMemory({ relatedMeetings = [] }: MeetingMemoryProps) {
  if (relatedMeetings.length === 0) {
    return null;
  }

  return (
    <section className="mb-12">
      <SectionHeader
        icon={<Brain className="size-5" strokeWidth={1.75} />}
        title="Meeting Memory"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {relatedMeetings.map((meeting) => {
          const date = new Date(meeting.date);
          const dateLabel = date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });

          return (
            <Link
              key={meeting.id}
              to={`/meetings/${meeting.id}`}
              className="group"
            >
              <PremiumCard className="h-full hover:shadow-md">
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm group-hover:text-brand-accent transition-colors">
                    {meeting.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">{dateLabel}</p>
                  <div className="flex flex-wrap gap-1 pt-2">
                    {meeting.participants.slice(0, 3).map((p, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-1 rounded-full bg-surface border border-border"
                      >
                        {p.split(" ")[0]}
                      </span>
                    ))}
                    {meeting.participants.length > 3 && (
                      <span className="text-[10px] px-2 py-1 rounded-full bg-surface border border-border">
                        +{meeting.participants.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </PremiumCard>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
