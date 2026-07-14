/**
 * Prompt Templates
 * 
 * Centralized prompt management for AI operations.
 * Easy to update and test without changing code.
 */

export function MEETING_ANALYSIS_PROMPT(transcript: string): string {
  return `Analyze this meeting transcript and extract structured data.

TRANSCRIPT:
${transcript}

Respond with ONLY valid JSON (no other text) matching this structure:
{
  "title": "concise meeting title",
  "summary": "2-3 sentence executive summary",
  "decisions": ["decision 1", "decision 2"],
  "risks": ["risk 1", "risk 2"],
  "opportunities": ["opportunity 1"],
  "actionItems": [
    {"text": "action", "owner": "person name", "dueDate": "YYYY-MM-DD"}
  ],
  "followUpEmail": {
    "recipient": "recipient name or title",
    "subject": "email subject",
    "body": "professional email body"
  },
  "whatsappMessage": "brief message for WhatsApp",
  "timelineEvents": [
    {"time": "when", "event": "what"}
  ],
  "tags": ["tag1", "tag2"],
  "category": "strategy|product|engineering|sales|marketing|hr|finance|general"
}

Requirements:
- Extract ONLY information mentioned in the transcript
- Do NOT hallucinate or infer details not stated
- Be concise and specific
- For dates, use ISO format (YYYY-MM-DD) or "TBD"
- Include at least one decision if present
- Make the follow-up email professional and actionable
- Keep WhatsApp message under 160 characters
- Pick the most appropriate category`;
}

export function CHAT_SYSTEM_PROMPT(meetingContext: {
  title: string;
  summary: string;
  transcript: string;
  decisions: string[];
  risks: string[];
  opportunities: string[];
  actionItems: Array<{ text: string }>;
}): string {
  return `You are a meeting assistant for: "${meetingContext.title}"

You have access to the following meeting information:

SUMMARY:
${meetingContext.summary}

DECISIONS MADE:
${meetingContext.decisions.map((d) => `- ${d}`).join("\n") || "- No decisions recorded"}

RISKS IDENTIFIED:
${meetingContext.risks.map((r) => `- ${r}`).join("\n") || "- No risks identified"}

OPPORTUNITIES:
${meetingContext.opportunities.map((o) => `- ${o}`).join("\n") || "- No opportunities"}

ACTION ITEMS:
${meetingContext.actionItems.map((a) => `- ${a.text}`).join("\n") || "- No action items"}

FULL TRANSCRIPT:
${meetingContext.transcript}

IMPORTANT RULES:
1. Answer ONLY using the meeting information provided above
2. NEVER make up or assume information
3. If asked something not in the meeting, say "This wasn't discussed in the meeting"
4. Be helpful but honest about limitations
5. Reference specific decisions, risks, or people by name when relevant
6. Provide concise, focused answers`;
}

export function MEETING_CATEGORIZATION_PROMPT(
  transcript: string,
  summary: string
): string {
  return `Categorize this meeting into one category:

TITLE & SUMMARY: ${summary}

TRANSCRIPT: ${transcript}

Choose from: strategy, product, engineering, sales, marketing, hr, finance, general

Respond with ONLY valid JSON:
{"category": "category_name"}

Pick the PRIMARY category that best describes the meeting.`;
}

export function SEARCH_RERANKING_PROMPT(
  query: string,
  results: Array<{ title: string; snippet: string; type: string }>
): string {
  return `Rerank these search results for relevance to: "${query}"

${results.map((r, i) => `${i + 1}. [${r.type}] ${r.title}\n   ${r.snippet}`).join("\n\n")}

Return ONLY a JSON array of indices in relevance order:
[0, 2, 1]`;
}
