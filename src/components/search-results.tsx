import { Link } from "@tanstack/react-router";
import { FileText, CheckSquare2, AlertTriangle, Lightbulb, Zap } from "lucide-react";
import type { SearchResult } from "@/lib/search/semantic";

const typeConfig = {
  meeting_title: { icon: FileText, label: "Meeting", color: "text-blue-500" },
  transcript: { icon: FileText, label: "Transcript", color: "text-slate-500" },
  decision: { icon: CheckSquare2, label: "Decision", color: "text-green-500" },
  action_item: { icon: Zap, label: "Action Item", color: "text-amber-500" },
  risk: { icon: AlertTriangle, label: "Risk", color: "text-red-500" },
  opportunity: { icon: Lightbulb, label: "Opportunity", color: "text-yellow-500" },
};

interface SearchResultsProps {
  results: SearchResult[];
  isLoading: boolean;
  query: string;
}

export function SearchResults({ results, isLoading, query }: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-2">
          <div className="size-8 border-2 border-brand-accent border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Searching...</p>
        </div>
      </div>
    );
  }

  if (!query.trim()) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-2 max-w-xs">
          <p className="text-sm font-medium text-foreground">Search across your meetings</p>
          <p className="text-xs text-muted-foreground">
            Type to search meeting titles, transcripts, decisions, action items, risks, and opportunities.
          </p>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-2 max-w-xs">
          <p className="text-sm font-medium text-foreground">No results found</p>
          <p className="text-xs text-muted-foreground">
            Try different keywords or check your meeting content.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {results.map((result) => {
        const config = typeConfig[result.type];
        const Icon = config.icon;

        return (
          <Link
            key={result.id}
            to={`/meetings/${result.meetingId}`}
            className="block p-4 rounded-xl border border-border bg-surface/50 hover:bg-surface transition-colors group"
          >
            <div className="space-y-2">
              {/* Header with type badge */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Icon className={`size-4 shrink-0 ${config.color}`} />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {config.label}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-foreground group-hover:text-brand-accent transition-colors truncate">
                    {result.meetingTitle}
                  </p>
                </div>
              </div>

              {/* Highlighted text preview */}
              <div className="space-y-1">
                <p className="text-sm leading-relaxed line-clamp-3">
                  <span
                    dangerouslySetInnerHTML={{
                      __html: result.highlightedText.replace(/<mark>/g, '<mark className="bg-brand-accent/30 font-medium">').replace(/<\/mark>/g, '</mark>'),
                    }}
                  />
                </p>
              </div>

              {/* Relevance indicator */}
              <div className="flex items-center gap-2 pt-1">
                <div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-brand-accent to-brand-accent/50 rounded-full"
                    style={{ width: `${Math.min(100, result.relevanceScore * 10)}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">
                  {Math.round(result.relevanceScore * 10)}%
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
