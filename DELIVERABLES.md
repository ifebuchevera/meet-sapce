# MeetSpace Production Deliverables

## 📋 Deliverable 1: Complete Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      MEETSPACE ARCHITECTURE                 │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                        BROWSER / CLIENT                               │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  React Components                                           │    │
│  │  • Dashboard (real meetings from DB)                        │    │
│  │  • Meeting Detail (chat + search)                           │    │
│  │  • Upload Page (file + progress)                            │    │
│  │  • Search Page (semantic + fuzzy)                           │    │
│  │  • Tasks (real action items)                                │    │
│  │  No AI keys. No Groq calls. All via API.                    │    │
│  └─────────────────────────────────────────────────────────────┘    │
│         ↓ (HTTP + TanStack Router)                                   │
└──────────────────────────────────────────────────────────────────────┘

                              ↓↑

┌──────────────────────────────────────────────────────────────────────┐
│                      BACKEND (TanStack Start)                         │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ SERVER ACTIONS (Mutations)                                  │    │
│  │ • uploadMeeting(file, title)                                │    │
│  │ • deleteMeeting(id)                                         │    │
│  │ • updateDecision(id, changes)                               │    │
│  │ (Called from React, run on server)                          │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ ROUTE HANDLERS (API Endpoints)                              │    │
│  │ ┌──────────────────────────────────────────────────────┐    │    │
│  │ │ POST /api/upload                                     │    │    │
│  │ │ • Validate file (type, size, virus scan)            │    │    │
│  │ │ • Store in Supabase Storage                         │    │    │
│  │ │ • Create meeting record (status: "processing")      │    │    │
│  │ │ • Trigger processMeeting server action              │    │    │
│  │ └──────────────────────────────────────────────────────┘    │    │
│  │                                                              │    │
│  │ ┌──────────────────────────────────────────────────────┐    │    │
│  │ │ POST /api/chat                                       │    │    │
│  │ │ • Receive: { meetingId, messages }                  │    │    │
│  │ │ • Fetch meeting + transcript from DB                │    │    │
│  │ │ • Call AIService.chatAboutMeeting()                │    │    │
│  │ │ • Stream Groq response to client                    │    │    │
│  │ │ • Save to chat_history table                        │    │    │
│  │ └──────────────────────────────────────────────────────┘    │    │
│  │                                                              │    │
│  │ ┌──────────────────────────────────────────────────────┐    │    │
│  │ │ GET /api/search?q=...                               │    │    │
│  │ │ • Full-text search in transcripts, decisions, etc   │    │    │
│  │ │ • Fuzzy matching for typos                          │    │    │
│  │ │ • Rank by relevance                                 │    │    │
│  │ │ • Highlight matches in snippet                      │    │    │
│  │ │ • Return top 10-20 results                          │    │    │
│  │ └──────────────────────────────────────────────────────┘    │    │
│  │                                                              │    │
│  │ ┌──────────────────────────────────────────────────────┐    │    │
│  │ │ Extension APIs (Pre-built for future)                │    │    │
│  │ │ POST /api/extension/upload                           │    │    │
│  │ │ POST /api/extension/process                          │    │    │
│  │ │ GET /api/extension/status                            │    │    │
│  │ │ (Authenticated with API keys)                        │    │    │
│  │ └──────────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ ASYNC PROCESSING                                            │    │
│  │ • Meeting upload → processMeeting()                         │    │
│  │   - Transcribe audio                                        │    │
│  │   - Call Groq ONE TIME                                      │    │
│  │   - Parse structured JSON                                   │    │
│  │   - Store decisions, risks, opportunities, etc              │    │
│  │   - Update status to "completed"                            │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ AI SERVICE LAYER (lib/ai/)                                  │    │
│  │ • AIProvider (interface)                                    │    │
│  │ • GroqProvider (implementation)                             │    │
│  │ • AIService (business logic)                                │    │
│  │ • Prompts (centralized templates)                           │    │
│  │ • ChatService (conversation management)                     │    │
│  └─────────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────┘

                              ↓↑

┌──────────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                                  │
│ ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐   │
│ │  Groq LLM API    │  │ Supabase         │  │ Supabase         │   │
│ │ • Chat           │  │ PostgreSQL       │  │ Storage          │   │
│ │ • Analysis       │  │ • Meetings       │  │ • Audio Files    │   │
│ │ • Streaming      │  │ • Transcripts    │  │ • User Uploads   │   │
│ │ • JSON parsing   │  │ • Decisions      │  │                  │   │
│ │ • Low latency    │  │ • Chat History   │  │ • Storage Policies   │
│ │                  │  │ • RLS enabled    │  │   (per user)     │   │
│ └──────────────────┘  └──────────────────┘  └──────────────────┘   │
│         ↓                     ↓                      ↓                │
│   (groq-sdk)          (@supabase/supabase-js)  (Supabase REST API)  │
└──────────────────────────────────────────────────────────────────────┘

                              ↓↑

┌──────────────────────────────────────────────────────────────────────┐
│                    OPTIONAL SERVICES                                  │
│ ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐   │
│ │ Transcription    │  │ Virus Scanning   │  │ Error Tracking   │   │
│ │ (Whisper/API)    │  │ (ClamAV/etc)     │  │ (Sentry/etc)     │   │
│ │ [To implement]   │  │ [Optional]       │  │ [To implement]   │   │
│ └──────────────────┘  └──────────────────┘  └──────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
```

## 📊 Deliverable 2: Database Schema

### Core Tables

```sql
-- Authentication & Users
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Meetings (Main entity)
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  title TEXT,
  summary TEXT,
  date_time TIMESTAMP,
  duration_minutes INT,
  category TEXT CHECK (category IN ('strategy', 'product', 'engineering', 'sales', 'marketing', 'hr', 'finance', 'general')),
  tags TEXT[],
  audio_file_url TEXT,
  audio_file_size INT,
  processing_status TEXT CHECK (processing_status IN ('uploading', 'queued', 'processing', 'completed', 'failed')),
  ai_processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id, id)
);
CREATE INDEX idx_meetings_user_status ON meetings(user_id, processing_status);

-- Transcript (Line by line)
CREATE TABLE transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  speaker TEXT,
  text TEXT,
  timestamp_seconds INT,
  created_at TIMESTAMP DEFAULT now()
);
CREATE INDEX idx_transcripts_meeting ON transcripts(meeting_id);

-- Decisions
CREATE TABLE decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed')) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT now()
);
CREATE INDEX idx_decisions_meeting ON decisions(meeting_id);

-- Risks
CREATE TABLE risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high')),
  mitigation_plan TEXT,
  created_at TIMESTAMP DEFAULT now()
);
CREATE INDEX idx_risks_meeting ON risks(meeting_id);

-- Opportunities
CREATE TABLE opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  impact TEXT CHECK (impact IN ('low', 'medium', 'high')),
  created_at TIMESTAMP DEFAULT now()
);
CREATE INDEX idx_opportunities_meeting ON opportunities(meeting_id);

-- Action Items
CREATE TABLE action_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  owner_id UUID REFERENCES profiles(id),
  due_date DATE,
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed')) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
CREATE INDEX idx_action_items_meeting ON action_items(meeting_id);
CREATE INDEX idx_action_items_due_date ON action_items(due_date);

-- Timeline Events
CREATE TABLE timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  occurred_at TIMESTAMP,
  event_type TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT now()
);
CREATE INDEX idx_timeline_events_meeting ON timeline_events(meeting_id);

-- Chat History
CREATE TABLE chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  role TEXT CHECK (role IN ('user', 'assistant')),
  message TEXT,
  created_at TIMESTAMP DEFAULT now()
);
CREATE INDEX idx_chat_history_meeting ON chat_history(meeting_id, created_at DESC);

-- Suggested Follow-ups (Emails)
CREATE TABLE suggested_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  recipient_name TEXT,
  recipient_email TEXT,
  subject TEXT,
  body TEXT,
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);
CREATE INDEX idx_suggested_emails_meeting ON suggested_emails(meeting_id);

-- Suggested Messages (WhatsApp, Slack, etc)
CREATE TABLE suggested_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  channel TEXT CHECK (channel IN ('whatsapp', 'slack', 'email')),
  body TEXT,
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);
CREATE INDEX idx_suggested_messages_meeting ON suggested_messages(meeting_id);

-- Related Meetings (for power users)
CREATE TABLE related_meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_a_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  meeting_b_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  relationship_type TEXT CHECK (relationship_type IN ('followup', 'related_topic', 'same_project')),
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(meeting_a_id, meeting_b_id)
);

-- Workspace Settings (for future team features)
CREATE TABLE workspace_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  key TEXT,
  value TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id, key)
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggested_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggested_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE related_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Example for meetings table)
CREATE POLICY "users_can_view_own_meetings" ON meetings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_can_insert_own_meetings" ON meetings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_can_update_own_meetings" ON meetings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "users_can_delete_own_meetings" ON meetings
  FOR DELETE USING (auth.uid() = user_id);

-- Full-text search index
CREATE INDEX idx_meetings_fts ON meetings USING GIN (
  to_tsvector('english', title || ' ' || COALESCE(summary, ''))
);
```

## 📡 Deliverable 3: API Documentation

### POST /api/upload
Upload a meeting file for processing.

**Authentication**: Required (Bearer JWT)

**Request**:
```json
{
  "file": File (multipart),
  "title": string,
  "duration_minutes": number (optional)
}
```

**Response** (200):
```json
{
  "meetingId": "uuid",
  "processingStatus": "uploading",
  "fileSize": 12345,
  "estimatedProcessingTime": "2-5 minutes"
}
```

**Errors**:
- 400: Invalid file type / too large
- 401: Unauthorized
- 413: File too large
- 500: Storage error

---

### POST /api/chat
Stream chat responses about a specific meeting.

**Authentication**: Required (Bearer JWT)

**Request**:
```json
{
  "meetingId": "uuid",
  "messages": [
    {"role": "user", "content": "What were the main decisions?"},
    {"role": "assistant", "content": "..."},
    {"role": "user", "content": "Who owns the proposal?"}
  ]
}
```

**Response** (200):
```
Streaming response (text/event-stream or fetch streaming)
Each chunk is a piece of the AI response
```

**Errors**:
- 401: Unauthorized
- 404: Meeting not found
- 500: AI service error

---

### GET /api/search
Search across all meetings.

**Authentication**: Required (Bearer JWT)

**Query Parameters**:
- `q` (required): Search query
- `limit` (optional, default 10): Number of results
- `offset` (optional, default 0): Pagination offset

**Response** (200):
```json
{
  "results": [
    {
      "id": "uuid",
      "type": "decision|risk|opportunity|action_item|transcript|title",
      "title": "Meeting Title",
      "snippet": "...highlighted match...",
      "highlights": [{"start": 10, "end": 20}],
      "relevanceScore": 0.95,
      "createdAt": "2026-07-14T10:00:00Z"
    }
  ],
  "total": 42,
  "hasMore": true
}
```

**Errors**:
- 400: Invalid query
- 401: Unauthorized
- 500: Search error

---

### POST /api/extension/upload (Future)
Upload from Chrome extension.

**Authentication**: Required (Extension API Key)

**Request**:
```json
{
  "file": binary,
  "title": string,
  "source": "chrome_extension"
}
```

**Response**: Same as /api/upload

---

## ✅ Deliverable 4: Pre-Launch Checklist

See `IMPLEMENTATION_CHECKLIST.md` for complete 100+ item verification list.

**Critical Items**:
- [ ] No hallucination in chat (tested)
- [ ] All AI calls server-side only
- [ ] RLS policies working correctly
- [ ] File upload validation complete
- [ ] Supabase API keys rotated
- [ ] All mock data replaced
- [ ] Error handling complete
- [ ] Performance acceptable (< 500ms APIs)
- [ ] Security audit passed
- [ ] Mobile responsive

---

## 🎯 Summary

**Status**: Production Ready for Core Implementation

**What's Built**: 
- ✅ AI provider architecture
- ✅ Groq integration
- ✅ Complete documentation
- ✅ Database schema
- ✅ API specifications

**What's Needed** (Next 2-3 weeks):
- Database migrations
- Upload pipeline
- Meeting processor
- Data integration (replace mock)
- Real chat & search

**Timeline**: 16-25 hours total development
**Launch Ready**: Early August 2026 (estimated)
