/**
 * AI Service
 * 
 * High-level wrapper around AI providers.
 * Handles business logic, prompt management, and response parsing.
 * Providers can be swapped without changing this code.
 */

import { getGroqProvider } from "./groq-provider";
import type { AIProvider } from "./provider";
import {
  MEETING_ANALYSIS_PROMPT,
  CHAT_SYSTEM_PROMPT,
  MEETING_CATEGORIZATION_PROMPT,
} from "./prompts";

export interface MeetingAnalysisResult {
  title: string;
  summary: string;
  decisions: string[];
  risks: string[];
  opportunities: string[];
  actionItems: Array<{
    text: string;
    owner?: string;
    dueDate?: string;
  }>;
  followUpEmail: {
    recipient: string;
    subject: string;
    body: string;
  };
  whatsappMessage: string;
  timelineEvents: Array<{
    time: string;
    event: string;
  }>;
  tags: string[];
  category:
    | "strategy"
    | "product"
    | "engineering"
    | "sales"
    | "marketing"
    | "hr"
    | "finance"
    | "general";
}

export class AIService {
  private provider: AIProvider;

  constructor(provider?: AIProvider) {
    this.provider = provider || getGroqProvider();
  }

  /**
   * Analyze a meeting transcript and extract structured data
   * Called ONCE per meeting after transcription
   * Returns everything needed: summary, decisions, risks, etc.
   */
  async analyzeMeeting(transcript: string): Promise<MeetingAnalysisResult> {
    if (!this.provider.isConfigured()) {
      throw new Error("AI provider not configured");
    }

    const prompt = MEETING_ANALYSIS_PROMPT(transcript);

    const response = await this.provider.generateStructured<MeetingAnalysisResult>(
      prompt,
      undefined,
      {
        temperature: 0.3, // Low temp for consistency
        maxTokens: 4000,
      }
    );

    // Validate required fields
    const result = response.data;
    if (!result.title || !result.summary || !result.decisions) {
      throw new Error("Invalid meeting analysis response from AI");
    }

    return result;
  }

  /**
   * Chat with the meeting assistant
   * User asks questions about a specific meeting
   * AI can ONLY reference the meeting data provided
   */
  async chatAboutMeeting(
    userMessage: string,
    meetingContext: {
      title: string;
      summary: string;
      transcript: string;
      decisions: string[];
      risks: string[];
      opportunities: string[];
      actionItems: Array<{ text: string }>;
    }
  ): Promise<AsyncIterable<string>> {
    if (!this.provider.isConfigured()) {
      throw new Error("AI provider not configured");
    }

    const systemPrompt = CHAT_SYSTEM_PROMPT(meetingContext);

    const response = await this.provider.streamText(
      [
        {
          role: "user",
          content: userMessage,
        },
      ],
      systemPrompt,
      {
        temperature: 0.3,
        maxTokens: 1000,
      }
    );

    return response.stream;
  }

  /**
   * Categorize a meeting based on its content
   */
  async categorizeMeeting(
    transcript: string,
    summary: string
  ): Promise<string> {
    const prompt = MEETING_CATEGORIZATION_PROMPT(transcript, summary);

    const response = await this.provider.generateStructured<{ category: string }>(
      prompt,
      { category: "string" },
      {
        temperature: 0.3,
        maxTokens: 100,
      }
    );

    return response.data.category;
  }
}

// Create singleton instance
let aiService: AIService | null = null;

export function getAIService(): AIService {
  if (!aiService) {
    aiService = new AIService();
  }
  return aiService;
}
