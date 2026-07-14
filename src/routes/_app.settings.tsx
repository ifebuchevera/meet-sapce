import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings — Clarity" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <>
      <AppHeader title="Settings" subtitle="Workspace, profile, and integrations" />
      <div className="max-w-3xl mx-auto p-6 md:p-8 space-y-10">
        <Section title="Profile">
          <Field label="Full name" defaultValue="Sarah Chen" />
          <Field label="Work email" defaultValue="sarah@acme.co" type="email" />
        </Section>

        <Section title="Workspace">
          <Field label="Workspace name" defaultValue="Acme Product" />
          <Field label="Default timezone" defaultValue="America/New_York" />
        </Section>

        <Section title="Meeting processing">
          <Toggle label="Auto-transcribe uploaded recordings" defaultOn />
          <Toggle label="Extract action items with AI" defaultOn />
          <Toggle label="Generate follow-up email drafts" defaultOn />
          <Toggle label="Generate WhatsApp follow-ups" defaultOn={false} />
        </Section>

        <Section title="Integrations">
          <IntegrationRow name="Google Calendar" status="Connected" />
          <IntegrationRow name="Slack" status="Connect" />
          <IntegrationRow name="Notion" status="Connect" />
          <IntegrationRow name="Linear" status="Connect" />
        </Section>

        <Section title="Danger zone">
          <button className="px-4 py-2 text-xs font-medium border border-destructive/40 text-destructive rounded-full hover:bg-destructive/5 transition-colors">
            Delete workspace
          </button>
        </Section>
      </div>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="eyebrow">{title}</h2>
      <div className="rounded-2xl border border-border divide-y divide-border overflow-hidden">
        {children}
      </div>
    </section>
  );
}

function Field({
  label,
  defaultValue,
  type = "text",
}: {
  label: string;
  defaultValue: string;
  type?: string;
}) {
  return (
    <label className="flex items-center justify-between gap-4 px-5 py-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <input
        type={type}
        defaultValue={defaultValue}
        className="text-sm bg-transparent text-right outline-none focus:text-foreground w-64 max-w-[60%]"
      />
    </label>
  );
}

function Toggle({ label, defaultOn }: { label: string; defaultOn: boolean }) {
  return (
    <label className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer">
      <span className="text-sm">{label}</span>
      <span className="relative inline-flex h-5 w-9">
        <input
          type="checkbox"
          defaultChecked={defaultOn}
          className="peer sr-only"
        />
        <span className="absolute inset-0 rounded-full bg-border peer-checked:bg-primary transition-colors" />
        <span className="absolute left-0.5 top-0.5 size-4 rounded-full bg-background transition-transform peer-checked:translate-x-4" />
      </span>
    </label>
  );
}

function IntegrationRow({ name, status }: { name: string; status: string }) {
  const connected = status === "Connected";
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4">
      <span className="text-sm">{name}</span>
      <button
        className={
          "px-3 py-1.5 text-xs font-medium rounded-full transition-colors " +
          (connected
            ? "bg-surface border border-border text-muted-foreground"
            : "bg-primary text-primary-foreground hover:opacity-90")
        }
      >
        {status}
      </button>
    </div>
  );
}
