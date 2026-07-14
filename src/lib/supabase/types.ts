// Database row types generated from Supabase schema

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Meeting = {
  id: string;
  user_id: string;
  title: string;
  date_time: string;
  duration_minutes: number | null;
  client_name: string | null;
  ai_processed_at: string | null;
  summary: string | null;
  created_at: string;
  updated_at: string;
};

export type Participant = {
  id: string;
  meeting_id: string;
  name: string;
  email: string | null;
  avatar_url: string | null;
  created_at: string;
};

export type Transcript = {
  id: string;
  meeting_id: string;
  speaker: string;
  text: string;
  timestamp_seconds: number | null;
  created_at: string;
};

export type Decision = {
  id: string;
  meeting_id: string;
  title: string;
  description: string | null;
  created_at: string;
};

export type Risk = {
  id: string;
  meeting_id: string;
  title: string;
  description: string | null;
  created_at: string;
};

export type Opportunity = {
  id: string;
  meeting_id: string;
  title: string;
  description: string | null;
  created_at: string;
};

export type ActionItem = {
  id: string;
  meeting_id: string;
  title: string;
  owner: string;
  due_date: string | null;
  status: 'pending' | 'done';
  created_at: string;
  updated_at: string;
};

export type ActionCard = {
  id: string;
  meeting_id: string;
  title: string;
  description: string | null;
  icon: string | null;
  action: string | null;
  created_at: string;
};

export type TimelineEvent = {
  id: string;
  meeting_id: string;
  label: string;
  timestamp_str: string | null;
  event_type: 'start' | 'decision' | 'action' | 'risk' | 'end';
  created_at: string;
};

// Aggregated meeting type with related data
export type MeetingDetail = Meeting & {
  participants: Participant[];
  transcripts: Transcript[];
  decisions: Decision[];
  risks: Risk[];
  opportunities: Opportunity[];
  action_items: ActionItem[];
  action_cards: ActionCard[];
  timeline_events: TimelineEvent[];
};

// Auth types
export type AuthUser = {
  id: string;
  email: string;
  user_metadata: Record<string, any>;
  app_metadata: Record<string, any>;
};

export type AuthSession = {
  user: AuthUser;
  access_token: string;
  refresh_token: string;
};
