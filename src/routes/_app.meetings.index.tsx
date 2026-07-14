import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Upload, FileAudio, Loader2, CheckCircle2 } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { meetings } from "@/lib/mock-data";

type UploadState =
  | { kind: "idle" }
  | { kind: "uploading"; name: string; progress: number }
  | { kind: "processing"; name: string }
  | { kind: "done"; name: string };

export const Route = createFileRoute("/_app/meetings/")({
  head: () => ({ meta: [{ title: "Meetings — Clarity" }] }),
  component: MeetingsPage,
});

function MeetingsPage() {
  const [state, setState] = useState<UploadState>({ kind: "idle" });
  const inputRef = useRef<HTMLInputElement | null>(null);

  function pickFile() {
    inputRef.current?.click();
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    simulateUpload(file.name);
  }

  function simulateUpload(name: string) {
    setState({ kind: "uploading", name, progress: 0 });
    let progress = 0;
    const iv = setInterval(() => {
      progress += 12;
      if (progress >= 100) {
        clearInterval(iv);
        setState({ kind: "processing", name });
        setTimeout(() => setState({ kind: "done", name }), 2200);
      } else {
        setState({ kind: "uploading", name, progress });
      }
    }, 250);
  }

  return (
    <>
      <AppHeader
        title="Meetings"
        subtitle="Upload audio or video — Clarity handles the rest"
      />
      <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-10">
        {/* Uploader */}
        <section>
          <input
            ref={inputRef}
            type="file"
            accept="audio/*,video/*"
            className="hidden"
            onChange={onFile}
          />
          {state.kind === "idle" ? (
            <button
              type="button"
              onClick={pickFile}
              className="w-full rounded-2xl border-2 border-dashed border-border hover:border-foreground/30 hover:bg-surface transition-colors p-10 flex flex-col items-center gap-3 text-center"
            >
              <div className="size-12 rounded-full bg-surface border border-border grid place-items-center">
                <Upload className="size-5" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-sm font-medium">Drop a meeting recording</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Audio or video, up to 2 GB · MP3, WAV, MP4, MOV
                </p>
              </div>
              <span className="mt-2 inline-flex items-center px-4 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-full">
                Choose file
              </span>
            </button>
          ) : (
            <UploadProgress state={state} onReset={() => setState({ kind: "idle" })} />
          )}
        </section>

        {/* Meetings list */}
        <section className="space-y-5">
          <div className="flex items-end justify-between">
            <h2 className="text-xl font-medium tracking-tight">All meetings</h2>
            <span className="text-xs text-muted-foreground">
              {meetings.length} total
            </span>
          </div>
          <div className="border border-border rounded-2xl overflow-hidden">
            <div className="bg-surface border-b border-border px-6 py-3 flex text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
              <div className="flex-1">Meeting</div>
              <div className="w-32 hidden sm:block">Date</div>
              <div className="w-24 text-right">Status</div>
            </div>
            <div className="divide-y divide-border">
              {meetings.map((m) => (
                <Link
                  key={m.id}
                  to="/meetings/$meetingId"
                  params={{ meetingId: m.id }}
                  className="px-6 py-4 flex items-center hover:bg-surface transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{m.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {m.participants.length} people · {m.duration} ·{" "}
                      {m.actionItemsCount} action items
                    </p>
                  </div>
                  <div className="w-32 text-xs text-muted-foreground hidden sm:block">
                    {m.dateLabel}
                  </div>
                  <div className="w-24 text-right">
                    <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[9px] font-bold tracking-tighter uppercase">
                      {m.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

function UploadProgress({
  state,
  onReset,
}: {
  state: UploadState;
  onReset: () => void;
}) {
  if (state.kind === "idle") return null;
  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <div className="flex items-center gap-4">
        <div className="size-10 rounded-full bg-background border border-border grid place-items-center shrink-0">
          <FileAudio className="size-4" strokeWidth={1.75} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{state.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {state.kind === "uploading" && `Uploading… ${state.progress}%`}
            {state.kind === "processing" && "Transcribing and extracting decisions…"}
            {state.kind === "done" && "Ready. Open the meeting to review."}
          </p>
        </div>
        {state.kind === "processing" ? (
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        ) : state.kind === "done" ? (
          <CheckCircle2 className="size-4 text-emerald-500" />
        ) : null}
      </div>
      <div className="mt-4 h-1 rounded-full bg-border overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{
            width:
              state.kind === "uploading"
                ? `${state.progress}%`
                : state.kind === "processing"
                  ? "100%"
                  : "100%",
          }}
        />
      </div>
      {state.kind === "done" ? (
        <div className="mt-5 flex gap-2">
          <Link
            to="/meetings/$meetingId"
            params={{ meetingId: meetings[0].id }}
            className="inline-flex items-center px-3.5 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-full hover:opacity-90"
          >
            Open meeting
          </Link>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center px-3.5 py-1.5 text-xs font-medium bg-background border border-border rounded-full hover:bg-surface"
          >
            Upload another
          </button>
        </div>
      ) : null}
    </div>
  );
}
