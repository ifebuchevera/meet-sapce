# Production Conversion Roadmap - MeetSpace

## ✅ COMPLETED
1. AI Provider Interface (`lib/ai/provider.ts`)
2. Groq Provider Implementation (`lib/ai/groq-provider.ts`)
3. Project audit and security review

## 🔴 CRITICAL SECURITY ISSUE
**Supabase API keys visible in dashboard error messages**
- Need to verify `.env.development.local` is in `.gitignore`
- Remove any exposed keys and regenerate
- Ensure sensitive environment variables are not logged

## 📋 REMAINING PRODUCTION TASKS

### Phase 1: AI Service Layer (Immediate)
```
- [ ] AIService wrapper class (orchestrates all AI operations)
- [ ] PromptTemplates (meeting analysis, chat, classification)
- [ ] ChatService (streaming, history management)
- [ ] TranscriptionProvider for Whisper/external API
```

### Phase 2: Database & Migrations (Core)
```
- [ ] SQL migrations for all required tables
- [ ] Apply to Supabase
- [ ] Verify RLS policies work correctly
- [ ] Create database seed data script
```

### Phase 3: File Upload & Processing Pipeline
```
- [ ] POST /api/upload handler (multipart, validation)
- [ ] Virus scan integration (optional but recommended)
- [ ] Supabase Storage configuration
- [ ] File size/type validation
- [ ] Process status tracking in real-time
```

### Phase 4: Meeting Processing Pipeline
```
- [ ] Server Action: processMeeting()
  - Extract metadata from file
  - Transcribe audio
  - Call Groq ONE TIME with all data
  - Parse structured JSON response
  - Store all data in Supabase
  - Update meeting status to "completed"
```

### Phase 5: Replace Mock Data (Systematic)
Current state: All routes import from `mock-data.ts`

Routes to convert:
```
- [ ] Dashboard → fetchUserMeetings()
- [ ] Meetings list → React Query useMeetings()
- [ ] Meeting detail → React Query useMeeting(id)
- [ ] Tasks → React Query useActionItems()
- [ ] Search → Semantic search with full-text
- [ ] Knowledge → Remove or implement properly
```

### Phase 6: Real AI Chat
```
- [ ] Replace api.chat.ts stub with real implementation
- [ ] System prompt: "Answer ONLY using this meeting data: [transcript, decisions, risks]"
- [ ] Stream responses with Groq
- [ ] Persist chat history to Supabase
- [ ] Prevent hallucination with strict guardrails
```

### Phase 7: Semantic Search
```
- [ ] Full-text search in Supabase
- [ ] Fuzzy matching for typos
- [ ] Field weighting (title > summary > transcript)
- [ ] Highlight matches in results
- [ ] Rank by relevance
```

### Phase 8: Chrome Extension API (Backend Prep)
```
- [ ] POST /api/extension/upload (auth validated)
- [ ] POST /api/extension/process (async job)
- [ ] GET /api/extension/status (polling)
- [ ] API key management for extensions
- [ ] Rate limiting per extension
```

### Phase 9: Error Handling & UX
```
- [ ] Loading skeletons for all pages
- [ ] Error boundaries with retry
- [ ] Empty states
- [ ] Processing status indicators
- [ ] Timeout handling
```

### Phase 10: Security & Performance
```
- [ ] All AI calls server-side only
- [ ] Request validation with Zod
- [ ] Rate limiting
- [ ] CORS properly configured
- [ ] Server Components where appropriate
- [ ] React Query SWR setup
```

## Time Estimates (Approximate)
- Phase 1: 1-2 hours
- Phase 2: 1-2 hours (mostly Supabase)
- Phase 3: 2-3 hours
- Phase 4: 2-3 hours
- Phase 5: 3-4 hours (repetitive but important)
- Phase 6: 1-2 hours
- Phase 7: 1-2 hours
- Phase 8: 1-2 hours
- Phase 9: 1-2 hours
- Phase 10: 2-3 hours

**Total: ~16-25 hours for full production readiness**

## Deliverables Required
1. ✅ Architecture Diagram (visual system design)
2. ✅ Database Schema (SQL)
3. ✅ API Documentation (endpoints, auth, errors)
4. ✅ Launch Checklist (pre-deployment verification)

## Notes
- TanStack Start project (not Next.js as originally stated)
- Using Supabase for auth, storage, database
- Groq for LLM (can swap via provider interface)
- React Query for client-side data
- Server Actions for mutations
