import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppHeader } from "@/components/app-header";
import { allActionItems, type TaskStatus, type TaskPriority } from "@/lib/mock-data";

type Filter = "all" | TaskStatus;

export const Route = createFileRoute("/_app/tasks")({
  head: () => ({ meta: [{ title: "Tasks — Clarity" }] }),
  component: TasksPage,
});

const priorityStyles: Record<TaskPriority, string> = {
  high: "bg-primary text-primary-foreground",
  medium: "bg-surface text-foreground border border-border",
  low: "bg-surface text-muted-foreground border border-border",
};

const statusLabels: Record<TaskStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
};

function TasksPage() {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return allActionItems;
    return allActionItems.filter((a) => a.status === filter);
  }, [filter]);

  const counts = useMemo(
    () => ({
      all: allActionItems.length,
      todo: allActionItems.filter((a) => a.status === "todo").length,
      in_progress: allActionItems.filter((a) => a.status === "in_progress").length,
      done: allActionItems.filter((a) => a.status === "done").length,
    }),
    [],
  );

  return (
    <>
      <AppHeader
        title="Tasks"
        subtitle="Action items automatically extracted from your meetings"
      />
      <div className="max-w-5xl mx-auto p-6 md:p-8 space-y-8">
        <div className="flex flex-wrap gap-2">
          <FilterChip
            active={filter === "all"}
            count={counts.all}
            label="All"
            onClick={() => setFilter("all")}
          />
          <FilterChip
            active={filter === "todo"}
            count={counts.todo}
            label="To do"
            onClick={() => setFilter("todo")}
          />
          <FilterChip
            active={filter === "in_progress"}
            count={counts.in_progress}
            label="In progress"
            onClick={() => setFilter("in_progress")}
          />
          <FilterChip
            active={filter === "done"}
            count={counts.done}
            label="Done"
            onClick={() => setFilter("done")}
          />
        </div>

        <div className="border border-border rounded-2xl overflow-hidden">
          <div className="bg-surface border-b border-border px-6 py-3 grid grid-cols-12 gap-4 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
            <div className="col-span-6">Task</div>
            <div className="col-span-2">Owner</div>
            <div className="col-span-2">Due</div>
            <div className="col-span-2 text-right">Priority</div>
          </div>
          <div className="divide-y divide-border">
            {filtered.map((a) => (
              <div
                key={a.id}
                className="px-6 py-4 grid grid-cols-12 gap-4 items-start hover:bg-surface transition-colors"
              >
                <div className="col-span-12 md:col-span-6 flex items-start gap-3">
                  <div
                    className={
                      "mt-1 size-4 rounded border shrink-0 " +
                      (a.status === "done"
                        ? "bg-primary border-primary"
                        : "border-border")
                    }
                  />
                  <div className="min-w-0">
                    <p
                      className={
                        "text-sm font-medium " +
                        (a.status === "done"
                          ? "text-muted-foreground line-through"
                          : "")
                      }
                    >
                      {a.title}
                    </p>
                    {a.meetingId ? (
                      <Link
                        to="/meetings/$meetingId"
                        params={{ meetingId: a.meetingId }}
                        className="text-[10px] text-muted-foreground hover:text-foreground uppercase tracking-widest mt-1 inline-block"
                      >
                        From: {a.meetingTitle}
                      </Link>
                    ) : null}
                  </div>
                </div>
                <div className="col-span-6 md:col-span-2 text-xs text-muted-foreground flex items-center gap-2">
                  <span className="size-6 rounded-full bg-primary text-primary-foreground grid place-items-center text-[9px] font-medium">
                    {a.ownerInitials}
                  </span>
                  <span className="hidden md:inline">{a.owner}</span>
                </div>
                <div className="col-span-3 md:col-span-2 text-xs">
                  <span className="text-brand-accent font-medium">{a.due}</span>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {statusLabels[a.status]}
                  </p>
                </div>
                <div className="col-span-3 md:col-span-2 flex md:justify-end">
                  <span
                    className={
                      "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest " +
                      priorityStyles[a.priority]
                    }
                  >
                    {a.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function FilterChip({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors " +
        (active
          ? "bg-primary text-primary-foreground"
          : "bg-background border border-border text-muted-foreground hover:text-foreground")
      }
    >
      {label}
      <span className="text-[10px] opacity-70">{count}</span>
    </button>
  );
}
