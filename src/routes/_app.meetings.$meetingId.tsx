import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  Copy,
  Mail,
  MessageCircle,
  Download,
  FileText,
  Send,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { getMeetingById, type Meeting } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/meetings/$meetingId")({
  loader: ({ params }) => {
    const meeting = getMeetingById(params.meetingId);
    if (!meeting) throw notFound();
    return { meeting };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData
          ? `${loaderData.meeting.title} — Clarity`
          : "Meeting — Clarity",
      },
    ],
  }),
  component: MeetingDetailPage,
  notFoundComponent: () => (
    <div className="p-8">
      <p className="text-sm text-muted-foreground">Meeting not found.</p>
      <Link to="/meetings" className="text-sm underline mt-2 inline-block">
        Back to meetings
      </Link>
    </div>
  ),
});

type ExportTab = "email" | "whatsapp";

function MeetingDetailPage() {
  const { meeting } = Route.useLoaderData() as { meeting: Meeting };
  const [tab, setTab] = useState<ExportTab>("email");
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <header className="h-16 border-b border-border flex items-center justify-between px-6 md:px-8 sticky top-0 bg-background/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to="/meetings"
            className="text-muted-foreground hover:text-foreground shrink-0"
          >
            <ArrowLeft className="size-4" strokeWidth={1.75} />
          </Link>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{meeting.title}</p>
            <p className="text-xs text-muted-foreground truncate">
              {meeting.dateLabel} · {meeting.duration} · {meeting.participants.length} people
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-background border border-border rounded-full hover:bg-surface transition-colors">
            <Download className="size-3.5" strokeWidth={1.75} />
            Export
          </button>
          <button
            onClick={() => setChatOpen((v) => !v)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-full hover:opacity-90"
          >
            <Sparkles className="size-3.5" strokeWidth={1.75} />
            Ask Clarity
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: transcript */}
        <section className="lg:col-span-7 space-y-10">
          {/* Summary */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="size-1 bg-brand-accent rounded-full" />
              <h3 className="eyebrow">Auto-summary</h3>
            </div>
            <p className="text-lg md:text-xl leading-relaxed font-light text-foreground/90">
              {meeting.summary}
            </p>
          </div>

          {/* Decisions */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="size-1 bg-brand-accent rounded-full" />
              <h3 className="eyebrow">Key decisions</h3>
            </div>
            <ul className="space-y-3">
              {meeting.decisions.map((d, i) => (
                <li key={i} className="flex gap-4">
                  <span className="text-brand-accent text-sm mt-0.5 tabular-nums">
                    {String(i + 1).padStart(2, "0")}.
                  </span>
                  <span className="text-sm leading-relaxed">{d}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Risks */}
          {meeting.risks.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="size-1 bg-brand-accent rounded-full" />
                <h3 className="eyebrow">Risks identified</h3>
              </div>
              <ul className="space-y-2">
                {meeting.risks.map((r, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <AlertTriangle
                      className="size-3.5 mt-1 text-amber-500 shrink-0"
                      strokeWidth={1.75}
                    />
                    <span className="leading-relaxed">{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* Transcript */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-1 bg-brand-accent rounded-full" />
                <h3 className="eyebrow">Transcript</h3>
              </div>
              <button className="text-[10px] font-medium text-muted-foreground hover:text-foreground uppercase tracking-widest">
                Download
              </button>
            </div>
            <div className="rounded-2xl border border-border bg-surface divide-y divide-border">
              {meeting.transcript.map((line, i) => (
                <div key={i} className="p-5 space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-semibold text-foreground uppercase tracking-widest">
                      {line.speaker}
                    </span>
                    <span className="text-[10px] tabular-nums text-muted-foreground">
                      {line.timestamp}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    {line.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Right: action items + drafts */}
        <aside className="lg:col-span-5 space-y-6">
          <div className="bg-surface rounded-3xl p-6 border border-border space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold tracking-tight">
                Action items ({meeting.actionItems.length})
              </h3>
              <Link to="/tasks" className="text-xs text-muted-foreground hover:text-foreground">
                All tasks
              </Link>
            </div>
            <div className="space-y-4">
              {meeting.actionItems.map((a) => (
                <div key={a.id} className="flex items-start gap-3">
                  <div
                    className={
                      "mt-1 size-4 rounded border shrink-0 " +
                      (a.status === "done"
                        ? "bg-primary border-primary"
                        : "border-border")
                    }
                  />
                  <div className="min-w-0 space-y-1">
                    <p
                      className={
                        "text-sm font-medium leading-snug " +
                        (a.status === "done"
                          ? "text-muted-foreground line-through"
                          : "")
                      }
                    >
                      {a.title}
                    </p>
                    <div className="flex gap-2 items-center text-[10px]">
                      <span className="font-medium text-muted-foreground uppercase">
                        {a.owner}
                      </span>
                      <span
                        className={
                          "font-medium " +
                          (a.status === "done"
                            ? "text-emerald-500"
                            : "text-brand-accent")
                        }
                      >
                        {a.status === "done" ? "Done" : `Due ${a.due}`}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Follow-up drafts */}
          <div className="rounded-3xl border border-border overflow-hidden">
            <div className="flex border-b border-border">
              <TabButton active={tab === "email"} onClick={() => setTab("email")}>
                <Mail className="size-3.5" strokeWidth={1.75} />
                Email draft
              </TabButton>
              <TabButton
                active={tab === "whatsapp"}
                onClick={() => setTab("whatsapp")}
              >
                <MessageCircle className="size-3.5" strokeWidth={1.75} />
                WhatsApp
              </TabButton>
            </div>
            <div className="p-5 space-y-3">
              <pre className="text-xs leading-relaxed whitespace-pre-wrap font-sans text-foreground/80">
                {tab === "email" ? meeting.followUpEmail : meeting.followUpWhatsapp}
              </pre>
              <div className="flex gap-2 pt-2 border-t border-border">
                <button className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-full hover:opacity-90">
                  <Send className="size-3" strokeWidth={2} />
                  Send
                </button>
                <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-background border border-border rounded-full hover:bg-surface">
                  <Copy className="size-3" strokeWidth={1.75} />
                  Copy
                </button>
              </div>
            </div>
          </div>

          {/* Export */}
          <div className="rounded-3xl border border-border p-5 space-y-3">
            <h3 className="text-sm font-semibold tracking-tight">Export</h3>
            <div className="grid grid-cols-2 gap-2">
              <ExportButton icon={FileText} label="PDF" />
              <ExportButton icon={FileText} label="Markdown" />
              <ExportButton icon={Copy} label="Copy" />
              <ExportButton icon={Mail} label="Email" />
            </div>
          </div>
        </aside>
      </div>

      {/* AI chat sidebar */}
      {chatOpen ? (
        <AIChatPanel onClose={() => setChatOpen(false)} meetingTitle={meeting.title} />
      ) : null}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "flex-1 flex items-center justify-center gap-2 py-3 text-xs font-medium transition-colors " +
        (active
          ? "bg-surface text-foreground"
          : "text-muted-foreground hover:text-foreground")
      }
    >
      {children}
    </button>
  );
}

function ExportButton({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
}) {
  return (
    <button className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium bg-background border border-border rounded-xl hover:bg-surface transition-colors">
      <Icon className="size-3.5" strokeWidth={1.75} />
      {label}
    </button>
  );
}

function AIChatPanel({
  onClose,
  meetingTitle,
}: {
  onClose: () => void;
  meetingTitle: string;
}) {
  const [q, setQ] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
    {
      role: "ai",
      text: `I've read the full transcript of "${meetingTitle}". Ask me about decisions, blockers, or what to do next.`,
    },
  ]);

  function send(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    setMessages((m) => [
      ...m,
      { role: "user", text: q },
      {
        role: "ai",
        text: "Based on the transcript, the launch was moved to August 15 primarily to protect QA runway on dark mode. Marcus owns stakeholder comms — draft goes out Thursday.",
      },
    ]);
    setQ("");
  }

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-background border-l border-border shadow-2xl z-30 flex flex-col">
      <div className="h-16 border-b border-border flex items-center justify-between px-5">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4" strokeWidth={1.75} />
          <p className="text-sm font-medium">Ask Clarity</p>
        </div>
        <button
          onClick={onClose}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Close
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={
              "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed " +
              (m.role === "user"
                ? "ml-auto bg-primary text-primary-foreground"
                : "bg-surface border border-border")
            }
          >
            {m.text}
          </div>
        ))}
      </div>
      <form onSubmit={send} className="p-4 border-t border-border">
        <div className="flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ask about this meeting…"
            className="flex-1 bg-transparent text-sm outline-none"
          />
          <button
            type="submit"
            className="text-primary hover:opacity-80 disabled:opacity-40"
            disabled={!q.trim()}
          >
            <Send className="size-4" strokeWidth={1.75} />
          </button>
        </div>
      </form>
    </div>
  );
}
