import type { GenerationProvider, GenerationResult, AnalysisResult } from '../types';

export class GPTGenerationProvider implements GenerationProvider {
  name = 'gpt';
  private apiKey: string;

  constructor(apiKey: string = process.env.OPENAI_API_KEY || '') {
    this.apiKey = apiKey;
  }

  async generate(analysis: AnalysisResult, transcript: string, meetingTitle: string): Promise<GenerationResult> {
    try {
      const emailPrompt = this.buildEmailGenerationPrompt(analysis, meetingTitle);
      const messagePrompt = this.buildMessageGenerationPrompt(analysis, meetingTitle);

      const [emailResponse, messageResponse] = await Promise.all([
        this.callOpenAI(emailPrompt),
        this.callOpenAI(messagePrompt),
      ]);

      const emails = this.parseEmailResponse(emailResponse);
      const messages = this.parseMessageResponse(messageResponse);

      return {
        emails,
        messages,
      };
    } catch (error) {
      throw new Error(`Generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async callOpenAI(prompt: string): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  private buildEmailGenerationPrompt(analysis: AnalysisResult, meetingTitle: string): string {
    return `Generate professional follow-up emails based on this meeting analysis.

Meeting: ${meetingTitle}
Summary: ${analysis.summary}
Decisions: ${analysis.decisions.join(', ')}
Action Items: ${analysis.actionItems.map((a) => a.title).join(', ')}

Generate 2-3 emails to different recipients (stakeholders, team members, etc.) with appropriate subjects and concise bodies. Return as JSON:
{
  "emails": [
    {"recipientName": "name", "recipientEmail": "email@example.com", "subject": "...", "body": "..."}
  ]
}

Return ONLY valid JSON.`;
  }

  private buildMessageGenerationPrompt(analysis: AnalysisResult, meetingTitle: string): string {
    return `Generate concise follow-up messages for different channels based on this meeting analysis.

Meeting: ${meetingTitle}
Key Topics: ${analysis.keyTopics.join(', ')}
Action Items: ${analysis.actionItems.map((a) => a.title).join(', ')}

Generate 2 messages for WhatsApp/Slack and 1 email summary. Keep them concise (max 280 chars for WhatsApp). Return as JSON:
{
  "messages": [
    {"channel": "whatsapp", "body": "..."},
    {"channel": "slack", "body": "..."},
    {"channel": "email", "body": "..."}
  ]
}

Return ONLY valid JSON.`;
  }

  private parseEmailResponse(response: string): Array<{
    recipientName: string;
    recipientEmail: string;
    subject: string;
    body: string;
  }> {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return [];
      }

      const parsed = JSON.parse(jsonMatch[0]);
      return Array.isArray(parsed.emails) ? parsed.emails : [];
    } catch {
      return [];
    }
  }

  private parseMessageResponse(response: string): Array<{ channel: 'whatsapp' | 'slack' | 'email'; body: string }> {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return [];
      }

      const parsed = JSON.parse(jsonMatch[0]);
      return Array.isArray(parsed.messages) ? parsed.messages : [];
    } catch {
      return [];
    }
  }
}
