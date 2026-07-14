import { createClient } from './client';
import type {
  Meeting,
  MeetingDetail,
  Participant,
  Transcript,
  Decision,
  Risk,
  Opportunity,
  ActionItem,
  ActionCard,
  TimelineEvent,
  Profile,
} from './types';

// MEETINGS
export async function getMeetings(userId: string): Promise<Meeting[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('meetings')
    .select('*')
    .eq('user_id', userId)
    .order('date_time', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getMeetingById(meetingId: string): Promise<Meeting | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('meetings')
    .select('*')
    .eq('id', meetingId)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
  return data || null;
}

export async function createMeeting(
  userId: string,
  meeting: Omit<Meeting, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<Meeting> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('meetings')
    .insert([{ ...meeting, user_id: userId }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateMeeting(
  meetingId: string,
  updates: Partial<Omit<Meeting, 'id' | 'user_id' | 'created_at'>>
): Promise<Meeting> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('meetings')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', meetingId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteMeeting(meetingId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.from('meetings').delete().eq('id', meetingId);

  if (error) throw error;
}

// MEETING DETAILS - Get all related data
export async function getMeetingDetail(meetingId: string): Promise<MeetingDetail | null> {
  const supabase = createClient();

  const [meeting, participants, transcripts, decisions, risks, opportunities, actionItems, actionCards, timelineEvents] =
    await Promise.all([
      getMeetingById(meetingId),
      supabase.from('participants').select('*').eq('meeting_id', meetingId),
      supabase.from('transcripts').select('*').eq('meeting_id', meetingId).order('timestamp_seconds', { ascending: true }),
      supabase.from('decisions').select('*').eq('meeting_id', meetingId),
      supabase.from('risks').select('*').eq('meeting_id', meetingId),
      supabase.from('opportunities').select('*').eq('meeting_id', meetingId),
      supabase.from('action_items').select('*').eq('meeting_id', meetingId),
      supabase.from('action_cards').select('*').eq('meeting_id', meetingId),
      supabase.from('timeline_events').select('*').eq('meeting_id', meetingId).order('created_at', { ascending: true }),
    ]);

  if (!meeting) return null;

  return {
    ...meeting,
    participants: participants.data || [],
    transcripts: transcripts.data || [],
    decisions: decisions.data || [],
    risks: risks.data || [],
    opportunities: opportunities.data || [],
    action_items: actionItems.data || [],
    action_cards: actionCards.data || [],
    timeline_events: timelineEvents.data || [],
  };
}

// PARTICIPANTS
export async function getParticipants(meetingId: string): Promise<Participant[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('participants')
    .select('*')
    .eq('meeting_id', meetingId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createParticipant(participant: Omit<Participant, 'id' | 'created_at'>): Promise<Participant> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('participants')
    .insert([participant])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// TRANSCRIPTS
export async function getTranscripts(meetingId: string): Promise<Transcript[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('transcripts')
    .select('*')
    .eq('meeting_id', meetingId)
    .order('timestamp_seconds', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createTranscript(transcript: Omit<Transcript, 'id' | 'created_at'>): Promise<Transcript> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('transcripts')
    .insert([transcript])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// DECISIONS
export async function getDecisions(meetingId: string): Promise<Decision[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('decisions')
    .select('*')
    .eq('meeting_id', meetingId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

// RISKS
export async function getRisks(meetingId: string): Promise<Risk[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('risks')
    .select('*')
    .eq('meeting_id', meetingId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

// OPPORTUNITIES
export async function getOpportunities(meetingId: string): Promise<Opportunity[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('opportunities')
    .select('*')
    .eq('meeting_id', meetingId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

// ACTION ITEMS
export async function getActionItems(meetingId: string): Promise<ActionItem[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('action_items')
    .select('*')
    .eq('meeting_id', meetingId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function updateActionItem(
  itemId: string,
  updates: Partial<Omit<ActionItem, 'id' | 'meeting_id' | 'created_at'>>
): Promise<ActionItem> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('action_items')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', itemId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ACTION CARDS
export async function getActionCards(meetingId: string): Promise<ActionCard[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('action_cards')
    .select('*')
    .eq('meeting_id', meetingId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

// TIMELINE EVENTS
export async function getTimelineEvents(meetingId: string): Promise<TimelineEvent[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('timeline_events')
    .select('*')
    .eq('meeting_id', meetingId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

// PROFILE
export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

export async function updateProfile(
  userId: string,
  updates: Partial<Omit<Profile, 'id' | 'created_at'>>
): Promise<Profile> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
