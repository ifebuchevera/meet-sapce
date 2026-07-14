import { createFileRoute } from '@tanstack/react-router'
import { json, createFileRoute } from '@tanstack/start';
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export const Route = createFileRoute('/api/chat')({
  POST: async ({ request }) => {
    try {
      const { messages, meetingId, meetingTranscript, decisions, risks, opportunities } = await request.json();

      if (!messages || !Array.isArray(messages)) {
        return json({ error: 'Invalid messages format' }, { status: 400 });
      }

      if (!meetingTranscript) {
        return json({ error: 'No meeting data provided' }, { status: 400 });
      }

      // Build context from meeting data
      const context = `You are an AI assistant that answers questions ONLY about a specific meeting. 

MEETING TRANSCRIPT:
${meetingTranscript}

DECISIONS MADE:
${decisions?.map((d: string) => `- ${d}`).join('\n') || 'None recorded'}

RISKS IDENTIFIED:
${risks?.map((r: string) => `- ${r}`).join('\n') || 'None recorded'}

OPPORTUNITIES:
${opportunities?.map((o: string) => `- ${o}`).join('\n') || 'None recorded'}

IMPORTANT RULES:
1. Only answer questions using information from the meeting transcript, decisions, risks, and opportunities above
2. If a question asks about something not in the meeting, say "This was not discussed in the meeting"
3. Never make up or hallucinate information
4. Be concise and direct
5. Quote from the transcript when relevant`;

      const systemPrompt = {
        role: 'system',
        content: context,
      };

      // Add system message to the beginning if not already there
      const messagesWithSystem = messages[0]?.role === 'system' 
        ? messages 
        : [systemPrompt, ...messages];

      const result = streamText({
        model: openai('gpt-4-turbo'),
        messages: messagesWithSystem as Parameters<typeof streamText>[0]['messages'],
        temperature: 0.3, // Lower temperature for more factual responses
        maxTokens: 1000,
      });

      // Stream the response
      return result.toTextStreamResponse();
    } catch (error) {
      console.error('[v0] Chat API error:', error);
      return json(
        { error: error instanceof Error ? error.message : 'Chat failed' },
        { status: 500 }
      );
    }
  },
});
