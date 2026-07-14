export type MeetingStatus = "processed" | "processing" | "uploading" | "failed";
export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface Participant {
  id: string;
  name: string;
  initials: string;
}

export interface TranscriptLine {
  speaker: string;
  timestamp: string;
  text: string;
}

export interface ActionItem {
  id: string;
  title: string;
  owner: string;
  ownerInitials: string;
  due: string;
  status: TaskStatus;
  priority: TaskPriority;
  meetingId?: string;
  meetingTitle?: string;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  dateLabel: string;
  duration: string;
  participants: Participant[];
  status: MeetingStatus;
  actionItemsCount: number;
  summary: string;
  decisions: string[];
  risks: string[];
  transcript: TranscriptLine[];
  actionItems: ActionItem[];
  followUpEmail: string;
  followUpWhatsapp: string;
}

const participants = {
  sarah: { id: "u1", name: "Sarah Chen", initials: "SC" },
  marcus: { id: "u2", name: "Marcus Lee", initials: "ML" },
  kevin: { id: "u3", name: "Kevin Wu", initials: "KW" },
  ana: { id: "u4", name: "Ana Ribeiro", initials: "AR" },
  david: { id: "u5", name: "David Park", initials: "DP" },
};

export const meetings: Meeting[] = [
  {
    id: "roadmap-alignment",
    title: "Weekly Product Roadmap Alignment",
    date: "2026-07-14T10:15:00Z",
    dateLabel: "Today, 10:15 AM",
    duration: "42 min",
    participants: [participants.sarah, participants.marcus, participants.kevin],
    status: "processed",
    actionItemsCount: 12,
    summary:
      "The team aligned on shifting the launch date to August 15th to allow for final QA cycles on the dark mode implementation. Sarah confirmed the backend is ready for the new scale, and Marcus committed to leading the stakeholder comms.",
    decisions: [
      "Move public launch to August 15th to protect QA runway.",
      "Adopt Tailwind v4 for the next major internal project.",
      "Deprioritize the native mobile app in favor of PWA enhancements.",
    ],
    risks: [
      "Stakeholder expectation on original launch date — needs comms plan by Thursday.",
      "QA capacity is thin during the last week of July.",
    ],
    transcript: [
      {
        speaker: "Sarah Chen",
        timestamp: "00:42",
        text: "So the primary blocker on the launch is the QA depth on dark mode. If we ship on the original date we're rolling the dice.",
      },
      {
        speaker: "Marcus Lee",
        timestamp: "01:15",
        text: "Agreed. I'd rather move to the 15th and go in with confidence. I can own the stakeholder comms.",
      },
      {
        speaker: "Kevin Wu",
        timestamp: "02:04",
        text: "Backend-wise we're already prepared for the scale. The bottleneck is entirely on the front-end polish.",
      },
      {
        speaker: "Sarah Chen",
        timestamp: "03:20",
        text: "Great. Let's lock August 15th. Marcus, can you draft the internal note by Thursday?",
      },
      {
        speaker: "Marcus Lee",
        timestamp: "03:31",
        text: "Yes. I'll circulate a draft in the shared doc tomorrow.",
      },
    ],
    actionItems: [
      {
        id: "a1",
        title: "Update project timeline in Notion",
        owner: "Sarah Chen",
        ownerInitials: "SC",
        due: "Tomorrow",
        status: "todo",
        priority: "high",
      },
      {
        id: "a2",
        title: "Draft announcement for stakeholder review",
        owner: "Marcus Lee",
        ownerInitials: "ML",
        due: "Fri",
        status: "in_progress",
        priority: "high",
      },
      {
        id: "a3",
        title: "Review API documentation for scale readiness",
        owner: "Kevin Wu",
        ownerInitials: "KW",
        due: "Wed",
        status: "done",
        priority: "medium",
      },
      {
        id: "a4",
        title: "Schedule QA capacity review",
        owner: "Sarah Chen",
        ownerInitials: "SC",
        due: "Mon",
        status: "todo",
        priority: "medium",
      },
    ],
    followUpEmail: `Hi team,

Quick recap from today's roadmap sync:

• We're moving the public launch to August 15th to protect QA runway on dark mode.
• Kevin confirmed backend is ready for scale.
• Marcus will circulate a stakeholder note draft by Thursday.

Owners and deadlines are in the linked action items. Reply if anything looks off.

Thanks,
Sarah`,
    followUpWhatsapp: `📌 Roadmap sync recap:
• Launch → Aug 15 (QA runway)
• Backend ready ✅
• Marcus drafts stakeholder note by Thu
Full notes + tasks in Clarity ↗`,
  },
  {
    id: "design-system-sprint-4",
    title: "Design System Refactor — Sprint 4",
    date: "2026-07-13T14:00:00Z",
    dateLabel: "Yesterday",
    duration: "15 min",
    participants: [participants.ana, participants.david],
    status: "processed",
    actionItemsCount: 3,
    summary:
      "Ana walked David through the new token structure. Agreement to merge the semantic-color PR by Friday and hold a component audit next week.",
    decisions: [
      "Merge semantic-color PR by Friday.",
      "Hold a full component audit next Tuesday.",
    ],
    risks: ["Legacy overrides in the marketing site may break after merge."],
    transcript: [
      {
        speaker: "Ana Ribeiro",
        timestamp: "00:12",
        text: "The token layer is stable. I'd like to merge the PR Friday if we don't find blockers.",
      },
      {
        speaker: "David Park",
        timestamp: "00:34",
        text: "Sounds good. Let's audit components on Tuesday to catch any regressions.",
      },
    ],
    actionItems: [
      {
        id: "b1",
        title: "Merge semantic-color PR",
        owner: "Ana Ribeiro",
        ownerInitials: "AR",
        due: "Fri",
        status: "in_progress",
        priority: "high",
      },
      {
        id: "b2",
        title: "Schedule component audit",
        owner: "David Park",
        ownerInitials: "DP",
        due: "Tue",
        status: "todo",
        priority: "medium",
      },
    ],
    followUpEmail: `Hi David,

Quick notes from today: I'll merge the semantic-color PR Friday, and we've booked the component audit for Tuesday. I'll send calendar invites.

— Ana`,
    followUpWhatsapp: `Design system sync ✅
• PR merges Fri
• Audit Tue
Notes in Clarity ↗`,
  },
  {
    id: "q3-strategy",
    title: "Q3 Strategy & Hiring Planning",
    date: "2026-07-12T09:00:00Z",
    dateLabel: "Jul 12",
    duration: "85 min",
    participants: [
      participants.sarah,
      participants.marcus,
      participants.kevin,
      participants.ana,
      participants.david,
    ],
    status: "processed",
    actionItemsCount: 21,
    summary:
      "Leadership committed to two senior hires in Q3 (one design, one platform), a refreshed OKR set focused on retention, and a monthly customer research cadence starting August.",
    decisions: [
      "Open two senior roles: Senior Product Designer and Staff Platform Engineer.",
      "Retention becomes the top-line Q3 OKR.",
      "Monthly customer research cadence starting August.",
    ],
    risks: [
      "Hiring market for staff platform is tight — timeline may slip.",
      "Retention OKR needs a shared instrumentation story.",
    ],
    transcript: [
      {
        speaker: "Sarah Chen",
        timestamp: "05:20",
        text: "Retention has to be the top-line OKR. Everything else is a means to that end.",
      },
      {
        speaker: "Kevin Wu",
        timestamp: "07:45",
        text: "For that to work we need instrumentation everyone trusts. Right now the numbers move around too much.",
      },
    ],
    actionItems: [
      {
        id: "c1",
        title: "Publish Q3 OKR draft",
        owner: "Sarah Chen",
        ownerInitials: "SC",
        due: "Jul 18",
        status: "in_progress",
        priority: "high",
      },
      {
        id: "c2",
        title: "Open Senior Product Designer role",
        owner: "Marcus Lee",
        ownerInitials: "ML",
        due: "Jul 20",
        status: "todo",
        priority: "high",
      },
      {
        id: "c3",
        title: "Retention instrumentation review",
        owner: "Kevin Wu",
        ownerInitials: "KW",
        due: "Jul 25",
        status: "todo",
        priority: "high",
      },
    ],
    followUpEmail: `Team,

Q3 strategy is locked. Top-line OKR is retention. We're opening two senior roles (design + platform) and starting a monthly customer research cadence in August. Full deck in the shared drive.

— Sarah`,
    followUpWhatsapp: `Q3 plan ✅
• Retention = #1 OKR
• 2 senior hires (design + platform)
• Monthly research from Aug`,
  },
  {
    id: "customer-onboarding-review",
    title: "Customer Onboarding Review",
    date: "2026-07-11T15:30:00Z",
    dateLabel: "Jul 11",
    duration: "38 min",
    participants: [participants.marcus, participants.ana],
    status: "processed",
    actionItemsCount: 6,
    summary:
      "The current onboarding drops 22% of users at the workspace creation step. Ana will redesign that flow with a lighter first-run experience.",
    decisions: [
      "Ana leads onboarding redesign, target ship in 3 weeks.",
      "Add lightweight analytics on step drop-offs.",
    ],
    risks: ["Change requires backend workspace-provisioning refactor."],
    transcript: [
      {
        speaker: "Marcus Lee",
        timestamp: "01:12",
        text: "22% drop at workspace creation is unacceptable. It's the single biggest leak in the funnel.",
      },
    ],
    actionItems: [
      {
        id: "d1",
        title: "Onboarding redesign v1 spec",
        owner: "Ana Ribeiro",
        ownerInitials: "AR",
        due: "Jul 22",
        status: "in_progress",
        priority: "high",
      },
    ],
    followUpEmail: `Ana — thanks for taking the lead on the onboarding redesign. Targeting a 3-week ship. I'll unblock the provisioning refactor from my side.

— Marcus`,
    followUpWhatsapp: `Onboarding review 📉
• 22% drop at workspace step
• Ana leads redesign (3 wks)
• Analytics next`,
  },
];

export function getMeetingById(id: string): Meeting | undefined {
  return meetings.find((m) => m.id === id);
}

export const allActionItems: ActionItem[] = meetings.flatMap((m) =>
  m.actionItems.map((a) => ({
    ...a,
    meetingId: m.id,
    meetingTitle: m.title,
  })),
);

export const insights = [
  {
    id: "i1",
    label: "Decision velocity",
    value: "+20%",
    detail: "This week vs last week",
  },
  {
    id: "i2",
    label: "Avg. meeting length",
    value: "38 min",
    detail: "Down 6 min from last month",
  },
  {
    id: "i3",
    label: "Action item close rate",
    value: "72%",
    detail: "Within due date",
  },
];

export const knowledgeCollections = [
  {
    id: "k1",
    title: "Product decisions",
    count: 24,
    description: "Every launch, scope, and roadmap call — searchable.",
  },
  {
    id: "k2",
    title: "Customer research",
    count: 18,
    description: "Interview notes, quotes, and recurring themes.",
  },
  {
    id: "k3",
    title: "Engineering reviews",
    count: 31,
    description: "Architecture calls, tech debt scoping, incident post-mortems.",
  },
  {
    id: "k4",
    title: "Hiring loops",
    count: 12,
    description: "Debriefs, scorecards, and calibration syncs.",
  },
];
