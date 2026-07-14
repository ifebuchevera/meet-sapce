import { CheckCircle, Share2, Download } from "lucide-react";
import type { Meeting, Participant } from "@/lib/mock-data";

export function HeroSection({
  meeting,
  onAskAI,
}: {
  meeting: Meeting;
  onAskAI: () => void;
}) {
  return (
    <div className="mb-12 space-y-6 animate-fade-in-up">
      {/* Title and Meta */}
      <div className="space-y-3">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          {meeting.title}
        </h1>
        {meeting.clientName && (
          <p className="text-lg text-muted-foreground">{meeting.clientName}</p>
        )}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground pt-2">
          <span>{meeting.dateLabel}</span>
          <span>•</span>
          <span>{meeting.duration}</span>
          <span>•</span>
          <span>{meeting.participants.length} participants</span>
        </div>
      </div>

      {/* Status Badge and CTAs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4">
        <div className="flex items-center gap-3 px-4 py-3 rounded-full bg-surface border border-border">
          <CheckCircle className="size-5 text-emerald-500" strokeWidth={1.75} />
          <div>
            <p className="text-sm font-medium">Meeting Processed</p>
            <p className="text-xs text-muted-foreground">
              {meeting.aiProcessedTime || "Just now"}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onAskAI}
            className="px-4 py-2 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
          >
            Ask AI
          </button>
          <button className="px-4 py-2 rounded-full border border-border bg-background hover:bg-surface transition-colors text-sm font-medium inline-flex items-center gap-2">
            <Share2 className="size-4" strokeWidth={1.75} />
            Share
          </button>
          <button className="px-4 py-2 rounded-full border border-border bg-background hover:bg-surface transition-colors text-sm font-medium inline-flex items-center gap-2">
            <Download className="size-4" strokeWidth={1.75} />
            Export
          </button>
        </div>
      </div>

      {/* Participant Avatars */}
      <div className="flex items-center gap-3">
        <div className="flex -space-x-2">
          {meeting.participants.slice(0, 5).map((p) => (
            <div
              key={p.id}
              className="size-8 rounded-full bg-surface border border-border flex items-center justify-center text-xs font-medium"
              title={p.name}
            >
              {p.initials}
            </div>
          ))}
          {meeting.participants.length > 5 && (
            <div className="size-8 rounded-full bg-surface border border-border flex items-center justify-center text-xs font-medium">
              +{meeting.participants.length - 5}
            </div>
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          {meeting.participants.map((p) => p.name).join(", ")}
        </span>
      </div>
    </div>
  );
}
