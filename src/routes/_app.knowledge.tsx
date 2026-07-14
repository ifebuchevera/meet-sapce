import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, ArrowUpRight } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { knowledgeCollections, meetings } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/knowledge")({
  head: () => ({ meta: [{ title: "Knowledge — Clarity" }] }),
  component: KnowledgePage,
});

function KnowledgePage() {
  return (
    <>
      <AppHeader
        title="Knowledge"
        subtitle="Every processed meeting becomes searchable institutional memory"
      />
      <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-12">
        <section className="p-8 rounded-3xl bg-primary text-primary-foreground">
          <div className="flex items-start gap-4">
            <div className="size-10 rounded-xl bg-primary-foreground/10 grid place-items-center shrink-0">
              <BookOpen className="size-5" strokeWidth={1.5} />
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] opacity-70">
                Your team's memory
              </p>
              <h2 className="text-2xl md:text-3xl font-light leading-tight max-w-2xl">
                {meetings.length} meetings, {" "}
                {meetings.reduce((n, m) => n + m.actionItemsCount, 0)} action items,
                and every decision — indexed and semantically searchable.
              </h2>
            </div>
          </div>
        </section>

        <section className="space-y-5">
          <div className="flex items-end justify-between">
            <h2 className="text-xl font-medium tracking-tight">Collections</h2>
            <Link
              to="/search"
              className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4"
            >
              Search everything
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {knowledgeCollections.map((c) => (
              <div
                key={c.id}
                className="group p-6 rounded-2xl border border-border hover:border-foreground/20 transition-colors bg-surface"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{c.title}</p>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                      {c.description}
                    </p>
                  </div>
                  <ArrowUpRight
                    className="size-4 text-muted-foreground group-hover:text-foreground"
                    strokeWidth={1.75}
                  />
                </div>
                <div className="mt-6 flex items-baseline gap-2">
                  <span className="text-3xl font-light">{c.count}</span>
                  <span className="text-xs text-muted-foreground">meetings</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-5">
          <h2 className="text-xl font-medium tracking-tight">Recent additions</h2>
          <div className="border border-border rounded-2xl overflow-hidden divide-y divide-border">
            {meetings.map((m) => (
              <Link
                key={m.id}
                to="/meetings/$meetingId"
                params={{ meetingId: m.id }}
                className="px-6 py-4 flex items-center hover:bg-surface transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{m.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                    {m.summary}
                  </p>
                </div>
                <div className="w-24 text-xs text-muted-foreground text-right hidden sm:block">
                  {m.dateLabel}
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
