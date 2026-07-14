import type { AnalysisProvider, AnalysisResult } from '../types';

export class ClaudeAnalysisProvider implements AnalysisProvider {
  name = 'claude';
  private apiKey: string;

  constructor(apiKey: string = process.env.ANTHROPIC_API_KEY || '') {
    this.apiKey = apiKey;
  }

  async analyze(transcript: string, context?: string): Promise<AnalysisResult> {
    try {
      const prompt = this.buildAnalysisPrompt(transcript, context);

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 4096,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Claude API error: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const responseText = data.content[0].text;

      // Parse Claude's response
      return this.parseAnalysisResponse(responseText);
    } catch (error) {
      throw new Error(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private buildAnalysisPrompt(transcript: string, context?: string): string {
    return `You are an expert meeting analyst. Analyze the following meeting transcript and provide structured insights.

${context ? `Context: ${context}\n\n` : ''}Meeting Transcript:
${transcript}

Please provide your analysis in the following JSON format:
{
  "summary": "A 2-3 sentence executive summary of the meeting",
  "decisions": ["decision 1", "decision 2", ...],
  "risks": ["risk 1", "risk 2", ...],
  "opportunities": ["opportunity 1", "opportunity 2", ...],
  "keyTopics": ["topic 1", "topic 2", ...],
  "sentiment": "positive|neutral|negative",
  "actionItems": [
    {"title": "action", "owner": "person name or null", "priority": "high|medium|low"}
  ]
}

Return ONLY valid JSON, no additional text.`;
  }

  private parseAnalysisResponse(response: string): AnalysisResult {
    try {
      // Extract JSON from response (Claude sometimes adds extra text)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        summary: parsed.summary || '',
        decisions: Array.isArray(parsed.decisions) ? parsed.decisions : [],
        risks: Array.isArray(parsed.risks) ? parsed.risks : [],
        opportunities: Array.isArray(parsed.opportunities) ? parsed.opportunities : [],
        keyTopics: Array.isArray(parsed.keyTopics) ? parsed.keyTopics : [],
        sentiment: parsed.sentiment || 'neutral',
        actionItems: Array.isArray(parsed.actionItems) ? parsed.actionItems : [],
      };
    } catch (error) {
      throw new Error(`Failed to parse analysis response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
