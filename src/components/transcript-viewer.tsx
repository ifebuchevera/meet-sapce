import { Search, Download } from "lucide-react";
import { useState } from "react";
import { PremiumCard, SectionHeader } from "./premium-card";
import type { TranscriptLine } from "@/lib/mock-data";

interface TranscriptViewerProps {
  transcript: TranscriptLine[];
}

export function TranscriptViewer({ transcript }: TranscriptViewerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSpeaker, setExpandedSpeaker] = useState<string | null>(null);

  const filteredTranscript = transcript.filter((line) =>
    line.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const speakers = Array.from(new Set(transcript.map((t) => t.speaker)));

  return (
    <section className="mb-12">
      <SectionHeader
        title="Transcript"
        action={
          <button className="text-xs font-medium text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5">
            <Download className="size-4" strokeWidth={1.75} />
            Download
          </button>
        }
      />

      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-3 size-4 text-muted-foreground" strokeWidth={1.75} />
          <input
            type="text"
            placeholder="Search transcript..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-surface/50 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:border-transparent"
          />
        </div>

        {/* Transcript */}
        <PremiumCard className="max-h-96 overflow-y-auto space-y-3">
          {filteredTranscript.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No matching transcript lines found.
            </p>
          ) : (
            filteredTranscript.map((line, i) => (
              <div
                key={i}
                className="pb-3 border-b border-border/30 last:border-0 space-y-2"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold text-foreground uppercase tracking-wide">
                    {line.speaker}
                  </span>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {line.timestamp}
                  </span>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {line.text}
                </p>
              </div>
            ))
          )}
        </PremiumCard>

        {/* Speaker Filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setExpandedSpeaker(null)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
              expandedSpeaker === null
                ? "bg-brand-accent text-primary-foreground"
                : "bg-surface border border-border hover:bg-surface/80"
            }`}
          >
            All speakers
          </button>
          {speakers.map((speaker) => (
            <button
              key={speaker}
              onClick={() =>
                setExpandedSpeaker(
                  expandedSpeaker === speaker ? null : speaker
                )
              }
              className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                expandedSpeaker === speaker
                  ? "bg-brand-accent text-primary-foreground"
                  : "bg-surface border border-border hover:bg-surface/80"
              }`}
            >
              {speaker}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
