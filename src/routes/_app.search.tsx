import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search as SearchIcon, Sparkles } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { meetings } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/search")({
  head: () => ({ meta: [{ title: "Search — Clarity" }] }),
  component: SearchPage,
});

const suggestions = [
  "When did we decide the launch date?",
  "Show me all risks flagged this month",
  "Who owns the retention OKR?",
  "Onboarding drop-off decisions",
];

function SearchPage() {
  const [q, setQ] = useState("");

  const results = useMemo(() => {
    if (!q.trim()) return [];
    const needle = q.toLowerCase();
    return meetings
      .map((m) => {
        const hitLine = m.transcript.find((l) =>
          l.text.toLowerCase().includes(needle),
        );
        const hitDecision = m.decisions.find((d) =>
          d.toLowerCase().includes(needle),
        );
        const summaryHit = m.summary.toLowerCase().includes(needle);
        const titleHit = m.title.toLowerCase().includes(needle);
        const matched = hitLine || hitDecision || summaryHit || titleHit;
        if (!matched) return null;
        const snippet =
          hitLine?.text ??
          hitDecision ??
          (summaryHit ? m.summary : m.title);
        return { meeting: m, snippet };
      })
      .filter(Boolean) as { meeting: (typeof meetings)[number]; snippet: string }[];
  }, [q]);

  return (
    <>
      <AppHeader
        title="Search"
        subtitle="Semantic search across every meeting, decision, and action item"
      />
      <div className="max-w-4xl mx-auto p-6 md:p-8 space-y-10">
        <div className="rounded-3xl border border-border bg-surface p-2 flex items-center gap-3">
          <SearchIcon
            className="size-4 ml-4 text-muted-foreground shrink-0"
            strokeWidth={1.75}
          />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ask anything about your meetings…"
            className="flex-1 bg-transparent text-base outline-none py-3"
          />
          {q ? (
            <button
              onClick={() => setQ("")}
              className="text-xs text-muted-foreground hover:text-foreground pr-4"
            >
              Clear
            </button>
          ) : null}
        </div>

        {!q ? (
          <section className="space-y-4">
            <p className="eyebrow">Try asking</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => setQ(s)}
                  className="px-4 py-2 rounded-full border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-surface transition-colors"
                >
                  <Sparkles className="size-3 inline mr-1.5 -mt-0.5" strokeWidth={1.75} />
                  {s}
                </button>
              ))}
            </div>
          </section>
        ) : results.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No matches yet. Clarity is scanning your archive semantically — try a
            broader query.
          </p>
        ) : (
          <section className="space-y-3">
            <p className="eyebrow">{results.length} results</p>
            <div className="border border-border rounded-2xl overflow-hidden divide-y divide-border">
              {results.map((r) => (
                <Link
                  key={r.meeting.id}
                  to="/meetings/$meetingId"
                  params={{ meetingId: r.meeting.id }}
                  className="block p-5 hover:bg-surface transition-colors"
                >
                  <p className="text-sm font-medium">{r.meeting.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {r.meeting.dateLabel} · {r.meeting.duration}
                  </p>
                  <p className="text-sm text-foreground/80 mt-3 leading-relaxed line-clamp-2">
                    "{r.snippet}"
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
