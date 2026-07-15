# MeetSpace Production Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Frontend (TanStack Start)                    │
│  - React Components with real Supabase data (React Query)        │
│  - Server Actions for mutations                                  │
│  - No AI calls from client (all server-side)                     │
└────────────────────────────────────────────────────────────────┐
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Backend (Route Handlers)                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Upload Pipeline                                           │  │
│  │ POST /api/upload → Store file → Trigger processing       │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Meeting Processor                                         │  │
│  │ Transcribe → Analyze with Groq → Store results           │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Chat API (/api/chat)                                     │  │
│  │ Stream Groq responses constrained to meeting data         │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Search API (/api/search)                                 │  │
│  │ Full-text search + fuzzy matching + ranking              │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Chrome Extension APIs (authenticated)                    │  │
│  │ POST /api/extension/upload                               │  │
│  │ POST /api/extension/process                              │  │
│  │ GET /api/extension/status                                │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│                    AI Layer (AIService)                          │
│  - AIProvider interface (swappable)                              │
│  - GroqProvider (default implementation)                         │
│  - Prompt templates (centralized)                                │
│  - One-time meeting analysis                                     │
│  - Streaming chat with constraints                               │
└─────────────────────────────────────────────────────────────────┘
                               ↓
┌──────────────────────────────┬──────────────────────────────────┐
│   Supabase (Database)        │  Supabase (Storage)              │
│                              │                                   │
│  - profiles                  │  - meeting-audio/                │
│  - meetings                  │    {user_id}/{meeting_id}.mp3    │
│  - transcripts               │  - uploads/                      │
│  - decisions                 │    {user_id}/{file_name}         │
│  - risks                      │                                  │
│  - opportunities             │  Supabase (Auth)                 │
│  - action_items              │  - Email/Password                │
│  - timeline_events           │  - Google OAuth                  │
│  - chat_history              │  - Row Level Security (RLS)      │
│  - related_meetings          │                                  │
│  - workspace_settings        │                                  │
└──────────────────────────────┴──────────────────────────────────┘
```

## Data Flow: Meeting Upload

```
1. User uploads MP3/MP4
   ↓
2. POST /api/upload
   - Validate file (type, size, virus scan optional)
   - Store in Supabase Storage
   - Create Meeting record (status: "uploading")
   ↓
3. Trigger Background Processing
   - Transcribe audio → Transcript records
   - Call Groq ONE TIME with full transcript
   - Parse structured JSON response
   ↓
4. Store AI Results
   - decisions, risks, opportunities, action items
   - summary, tags, category
   - suggested_emails, suggested_messages
   ↓
5. Update Meeting Status
   - Mark meeting as "completed"
   - Timestamp processing
   - Ready for chat and search
```

## Data Flow: Chat

```
1. User asks question in meeting detail page
   ↓
2. POST /api/chat
   - System prompt includes meeting transcript + metadata
   - User message sent to Groq
   ↓
3. Stream Response
   - Groq streams chunks
   - API chunks back to client
   - React useChat displays streaming text
   ↓
4. Store in chat_history table
   - User message
   - AI response
   - Meeting ID
   - Timestamp
   - For compliance and context
```

## Data Flow: Search

```
1. User types query in /search
   ↓
2. POST /api/search?q=...
   - Full-text search in Supabase
   - Fuzzy matching for typos
   - Search across: titles, transcripts, decisions, risks, etc.
   ↓
3. Rank Results
   - Field weighting (title > decisions > transcript)
   - Relevance scoring
   - Highlight matched text
   ↓
4. Return Results
   - Top 10-20 matches
   - With highlights and snippet
   - Click → navigate to meeting
```

## Database Schema

```sql
-- Profiles (Supabase Auth linked)
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  workspace_id UUID,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Meetings (core entity)
CREATE TABLE meetings (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL (FK profiles.id),
  title TEXT,
  summary TEXT,
  date_time TIMESTAMP,
  duration_minutes INT,
  category TEXT,
  tags TEXT[],
  audio_file_url TEXT,
  audio_file_size INT,
  processing_status TEXT, -- uploading, processing, completed, failed
  ai_processed_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Transcripts (line-by-line)
CREATE TABLE transcripts (
  id UUID PRIMARY KEY,
  meeting_id UUID NOT NULL (FK meetings.id),
  speaker TEXT,
  text TEXT,
  timestamp_seconds INT,
  created_at TIMESTAMP
);

-- Decisions from meeting
CREATE TABLE decisions (
  id UUID PRIMARY KEY,
  meeting_id UUID NOT NULL (FK meetings.id),
  title TEXT,
  description TEXT,
  status TEXT, -- pending, in_progress, completed
  created_at TIMESTAMP
);

-- Risks identified
CREATE TABLE risks (
  id UUID PRIMARY KEY,
  meeting_id UUID NOT NULL (FK meetings.id),
  title TEXT,
  severity TEXT, -- low, medium, high
  description TEXT,
  mitigation_plan TEXT,
  created_at TIMESTAMP
);

-- Opportunities
CREATE TABLE opportunities (
  id UUID PRIMARY KEY,
  meeting_id UUID NOT NULL (FK meetings.id),
  title TEXT,
  description TEXT,
  impact TEXT, -- low, medium, high
  created_at TIMESTAMP
);

-- Action items
CREATE TABLE action_items (
  id UUID PRIMARY KEY,
  meeting_id UUID NOT NULL (FK meetings.id),
  title TEXT,
  description TEXT,
  owner_id UUID (FK profiles.id),
  due_date DATE,
  status TEXT, -- pending, in_progress, completed
  created_at TIMESTAMP
);

-- Timeline events
CREATE TABLE timeline_events (
  id UUID PRIMARY KEY,
  meeting_id UUID NOT NULL (FK meetings.id),
  occurred_at TIMESTAMP,
  event_type TEXT,
  description TEXT,
  created_at TIMESTAMP
);

-- Chat history (for context and compliance)
CREATE TABLE chat_history (
  id UUID PRIMARY KEY,
  meeting_id UUID NOT NULL (FK meetings.id),
  user_id UUID NOT NULL (FK profiles.id),
  role TEXT, -- user, assistant
  message TEXT,
  created_at TIMESTAMP
);

-- Suggested follow-ups
CREATE TABLE suggested_emails (
  id UUID PRIMARY KEY,
  meeting_id UUID NOT NULL (FK meetings.id),
  recipient_name TEXT,
  recipient_email TEXT,
  subject TEXT,
  body TEXT,
  sent_at TIMESTAMP,
  created_at TIMESTAMP
);

-- Suggested messages (WhatsApp, Slack)
CREATE TABLE suggested_messages (
  id UUID PRIMARY KEY,
  meeting_id UUID NOT NULL (FK meetings.id),
  channel TEXT, -- whatsapp, slack, email
  body TEXT,
  sent_at TIMESTAMP,
  created_at TIMESTAMP
);

-- For power users: related meetings
CREATE TABLE related_meetings (
  id UUID PRIMARY KEY,
  meeting_a_id UUID NOT NULL (FK meetings.id),
  meeting_b_id UUID NOT NULL (FK meetings.id),
  relationship_type TEXT, -- followup, related_topic, same_project
  created_at TIMESTAMP
);

-- Workspace settings for teams (future)
CREATE TABLE workspace_settings (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL (FK profiles.id),
  key TEXT,
  value TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

## API Endpoints

### Upload
```
POST /api/upload
- Body: multipart/form-data (file + title)
- Returns: { meetingId, processingStatus }
- Error: 400 (validation), 401 (auth), 413 (too large), 500 (storage)
```

### Chat
```
POST /api/chat
- Body: { meetingId, messages: [{role, content}] }
- Returns: ReadableStream<string> (SSE or fetch streaming)
- Error: 401 (auth), 404 (meeting), 500 (AI error)
```

### Search
```
GET /api/search?q=...
- Query params: q (search term), limit (default 10), offset (default 0)
- Returns: { results: [{id, type, title, snippet, highlights}], total }
- Error: 400 (invalid query), 401 (auth), 500 (search error)
```

### Extension APIs
```
POST /api/extension/upload
- Header: Authorization: Bearer <extension-api-key>
- Body: { audioFile, title, metadata }
- Returns: { jobId, status }

POST /api/extension/process
- Same auth
- Body: { jobId }
- Returns: { status, progress }

GET /api/extension/status?jobId=...
- Same auth
- Returns: { status, progress, result }
```

## Security Considerations

1. **Never call Groq from client** - Only from server-side route handlers
2. **Supabase RLS** - Every user can only access their own meetings
3. **API key management** - Use environment variables, rotate regularly
4. **Request validation** - Validate all inputs with Zod
5. **Rate limiting** - Limit upload and chat API calls
6. **File validation** - Check MIME type, size, scan for viruses
7. **Auth** - Verify JWT on every API call
8. **CORS** - Restrict to your domain

## Performance Optimization

1. **Server Components** - Use for data fetching, no JS shipped
2. **React Query** - Caching, refetch intervals, background sync
3. **Lazy loading** - Transcripts load on demand
4. **Virtual scrolling** - For long transcript lists
5. **Image optimization** - Avatar images, thumbnails
6. **Compression** - Gzip API responses
7. **CDN** - Serve static assets from Vercel/CDN

## Monitoring & Observability

1. **Error logging** - Capture errors from Groq, Supabase, uploads
2. **Performance metrics** - Track API response times
3. **User analytics** - Track feature usage
4. **AI usage** - Monitor Groq token usage and costs
5. **Storage usage** - Monitor Supabase storage quota
