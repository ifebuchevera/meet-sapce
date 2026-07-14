import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  Copy,
  Mail,
  MessageCircle,
  Send,
  Sparkles,
} from "lucide-react";
import { getMeetingById, type Meeting } from "@/lib/mock-data";
import { HeroSection } from "@/components/hero-section";
import { ExecutiveSummary } from "@/components/executive-summary";
import { WhatChangedSection } from "@/components/what-changed-section";
import { ActionCenter } from "@/components/action-center";
import { TranscriptViewer } from "@/components/transcript-viewer";
import { MeetingMemory } from "@/components/meeting-memory";
import { TimelineViewer } from "@/components/timeline-viewer";
import { AIChat } from "@/components/ai-chat";

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
          <p className="text-sm font-medium truncate">{meeting.title}</p>
        </div>
        <button
          onClick={() => setChatOpen((v) => !v)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-full hover:opacity-90"
        >
          <Sparkles className="size-3.5" strokeWidth={1.75} />
          Ask AI
        </button>
      </header>

      <div className="max-w-4xl mx-auto px-6 md:px-8 py-8 md:py-12 space-y-12">
        {/* Hero Section */}
        <HeroSection meeting={meeting} onAskAI={() => setChatOpen(true)} />

        {/* Executive Summary */}
        <ExecutiveSummary summary={meeting.summary} />

        {/* What Changed */}
        <WhatChangedSection
          decisions={meeting.decisions}
          risks={meeting.risks}
          opportunities={meeting.opportunities}
        />

        {/* Action Center */}
        <ActionCenter actionCards={meeting.actionCards} />

        {/* Transcript */}
        <TranscriptViewer transcript={meeting.transcript} />

        {/* Meeting Memory */}
        <MeetingMemory relatedMeetings={meeting.relatedMeetings} />

        {/* Timeline */}
        <TimelineViewer events={meeting.timelineEvents} />

        {/* Action Items Section */}
        {meeting.actionItems.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-semibold tracking-tight">
                Action Items ({meeting.actionItems.length})
              </h2>
              <Link to="/tasks" className="text-xs text-muted-foreground hover:text-foreground">
                View all
              </Link>
            </div>
            <div className="rounded-2xl border border-border/50 bg-surface/50 backdrop-blur-sm p-6">
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
                    <div className="min-w-0 space-y-1 flex-1">
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
          </section>
        )}

        {/* Follow-up Drafts */}
        <section className="mb-12">
          <h2 className="text-base font-semibold tracking-tight mb-6">Follow-up Drafts</h2>
          <div className="rounded-2xl border border-border/50 bg-surface/50 backdrop-blur-sm overflow-hidden">
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
            <div className="p-6 space-y-4">
              <pre className="text-xs leading-relaxed whitespace-pre-wrap font-sans text-foreground/80">
                {tab === "email" ? meeting.followUpEmail : meeting.followUpWhatsapp}
              </pre>
              <div className="flex gap-2 pt-4 border-t border-border">
                <button className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
                  <Send className="size-3.5" strokeWidth={2} />
                  Send
                </button>
                <button className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-background border border-border rounded-lg hover:bg-surface transition-colors">
                  <Copy className="size-3.5" strokeWidth={1.75} />
                  Copy
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* AI chat sidebar */}
      {chatOpen ? (
        <AIChat
          meeting={meeting}
          decisions={meeting.decisions}
          risks={meeting.risks}
          opportunities={meeting.opportunities}
          onClose={() => setChatOpen(false)}
        />
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
