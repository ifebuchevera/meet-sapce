import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, CheckCircle2, Clock, Sparkles } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { allActionItems, insights, meetings } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({
    meta: [{ title: "Dashboard — Clarity" }],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const today = meetings.slice(0, 2);
  const recent = meetings.slice(0, 4);
  const outstanding = allActionItems.filter((a) => a.status !== "done").slice(0, 5);

  return (
    <>
      <AppHeader title="Morning overview" subtitle="Tuesday, July 14" />
      <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-12">
        {/* Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <StatCard
            eyebrow="Today's load"
            value={today.length.toString()}
            unit="meetings"
            detail="Next: Product Sync in 12m"
            live
          />
          <StatCard
            eyebrow="Action items"
            value={outstanding.length.toString()}
            unit="pending"
            detail="3 overdue from yesterday"
          />
          <div className="p-6 rounded-2xl bg-primary text-primary-foreground space-y-3 shadow-xl">
            <div className="flex items-center gap-2">
              <Sparkles className="size-3.5 opacity-80" strokeWidth={1.75} />
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] opacity-70">
                AI insight
              </span>
            </div>
            <p className="text-lg leading-snug font-light">
              Decision velocity is up 20% this week. Great momentum — protect the
              next two focus blocks.
            </p>
          </div>
        </section>

        {/* Today's meetings */}
        <section className="space-y-5">
          <div className="flex items-end justify-between">
            <h2 className="text-xl font-medium tracking-tight">Today</h2>
            <Link
              to="/meetings"
              className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4"
            >
              View all meetings
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {today.map((m) => (
              <Link
                key={m.id}
                to="/meetings/$meetingId"
                params={{ meetingId: m.id }}
                className="group p-5 rounded-2xl bg-surface border border-border hover:border-foreground/20 transition-all block"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{m.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {m.dateLabel} · {m.duration} · {m.participants.length} people
                    </p>
                  </div>
                  <ArrowUpRight className="size-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" strokeWidth={1.75} />
                </div>
                <div className="flex -space-x-2 mt-4">
                  {m.participants.map((p) => (
                    <div
                      key={p.id}
                      className="size-7 rounded-full bg-primary text-primary-foreground grid place-items-center text-[10px] font-medium ring-2 ring-surface"
                    >
                      {p.initials}
                    </div>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Weekly productivity */}
        <section className="space-y-5">
          <h2 className="text-xl font-medium tracking-tight">Weekly productivity</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {insights.map((i) => (
              <div key={i.id} className="p-5 rounded-2xl border border-border">
                <p className="eyebrow">{i.label}</p>
                <p className="text-3xl font-light mt-3">{i.value}</p>
                <p className="text-xs text-muted-foreground mt-2">{i.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Outstanding action items + recent meetings side by side */}
        <section className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-5">
            <div className="flex items-end justify-between">
              <h2 className="text-xl font-medium tracking-tight">Recent meetings</h2>
              <Link
                to="/meetings"
                className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4"
              >
                View all
              </Link>
            </div>
            <div className="border border-border rounded-2xl overflow-hidden">
              <div className="bg-surface border-b border-border px-5 py-3 flex text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                <div className="flex-1">Meeting</div>
                <div className="w-28 hidden sm:block">Date</div>
                <div className="w-20 text-right">Status</div>
              </div>
              <div className="divide-y divide-border">
                {recent.map((m) => (
                  <Link
                    key={m.id}
                    to="/meetings/$meetingId"
                    params={{ meetingId: m.id }}
                    className="px-5 py-4 flex items-center hover:bg-surface transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{m.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {m.participants.length} people · {m.duration} ·{" "}
                        {m.actionItemsCount} action items
                      </p>
                    </div>
                    <div className="w-28 text-xs text-muted-foreground hidden sm:block">
                      {m.dateLabel}
                    </div>
                    <div className="w-20 text-right">
                      <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[9px] font-bold tracking-tighter uppercase">
                        {m.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-surface rounded-2xl p-6 border border-border space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold tracking-tight">
                  Outstanding action items
                </h3>
                <Link
                  to="/tasks"
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  All tasks
                </Link>
              </div>
              <div className="space-y-4">
                {outstanding.map((a) => (
                  <div key={a.id} className="flex items-start gap-3">
                    <div className="mt-1 size-4 rounded border border-border shrink-0" />
                    <div className="space-y-1 min-w-0">
                      <p className="text-sm font-medium leading-snug truncate">
                        {a.title}
                      </p>
                      <div className="flex gap-2 items-center text-[10px]">
                        <span className="font-medium text-muted-foreground uppercase">
                          {a.ownerInitials}
                        </span>
                        <span className="text-brand-accent font-medium flex items-center gap-1">
                          <Clock className="size-2.5" strokeWidth={2} />
                          Due {a.due}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                to="/tasks"
                className="flex items-center justify-center w-full py-2.5 bg-background border border-border rounded-xl text-xs font-medium hover:bg-surface transition-colors"
              >
                <CheckCircle2 className="size-3.5 mr-1.5" strokeWidth={1.75} />
                Open task list
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

function StatCard({
  eyebrow,
  value,
  unit,
  detail,
  live,
}: {
  eyebrow: string;
  value: string;
  unit: string;
  detail: string;
  live?: boolean;
}) {
  return (
    <div className="p-6 rounded-2xl bg-surface border border-border space-y-3">
      <div className="flex justify-between items-start">
        <span className="eyebrow">{eyebrow}</span>
        {live ? (
          <span className="text-[9px] py-0.5 px-2 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 uppercase font-bold tracking-wider">
            Live
          </span>
        ) : null}
      </div>
      <p className="text-3xl font-light">
        {value} <span className="text-base text-muted-foreground">{unit}</span>
      </p>
      <p className="text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}
