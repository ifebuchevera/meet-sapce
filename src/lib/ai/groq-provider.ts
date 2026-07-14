/**
 * Groq AI Provider Implementation
 * 
 * Implements the AIProvider interface using Groq's API
 * Groq provides fast LLM inference with streaming support
 */

import Groq from "groq-sdk";
import type { AIProvider, TextStreamResponse, StructuredResponse } from "./provider";

export class GroqProvider implements AIProvider {
  private client: Groq;
  private model = "mixtral-8x7b-32768"; // Fast, capable model

  constructor(apiKey?: string) {
    this.client = new Groq({
      apiKey: apiKey || process.env.GROQ_API_KEY,
    });
  }

  isConfigured(): boolean {
    return !!process.env.GROQ_API_KEY;
  }

  async streamText(
    messages: Array<{ role: "user" | "assistant"; content: string }>,
    systemPrompt?: string,
    options?: {
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<TextStreamResponse> {
    const systemMessages = systemPrompt
      ? [{ role: "system" as const, content: systemPrompt }]
      : [];

    const stream = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        ...systemMessages,
        ...messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      ],
      temperature: options?.temperature ?? 0.3,
      max_tokens: options?.maxTokens ?? 2000,
      stream: true,
    });

    // Convert Groq stream to async iterable of strings
    const textStream = this.streamToAsyncIterable(stream);

    return {
      stream: textStream,
    };
  }

  async generateStructured<T = Record<string, unknown>>(
    prompt: string,
    schema?: T,
    options?: {
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<StructuredResponse<T>> {
    const systemPrompt = `You are a meeting analysis AI. 
You must respond with valid JSON only, no other text.
${schema ? `Respond with this exact structure: ${JSON.stringify(schema)}` : ""}`;

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: options?.temperature ?? 0.3,
      max_tokens: options?.maxTokens ?? 4000,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content || "{}";

    try {
      const data = JSON.parse(content);
      return {
        data: data as T,
        metadata: {
          usage: {
            promptTokens: response.usage?.prompt_tokens ?? 0,
            completionTokens: response.usage?.completion_tokens ?? 0,
          },
        },
      };
    } catch (error) {
      console.error("[v0] Failed to parse Groq JSON response:", error);
      throw new Error("Failed to parse AI response as JSON");
    }
  }

  async embed(text: string): Promise<number[]> {
    // Groq doesn't provide embeddings, use a placeholder
    // In production, you'd use a dedicated embedding service
    // or use Supabase pgvector with another provider
    throw new Error("Groq does not support embeddings. Use a dedicated embedding service.");
  }

  private async *streamToAsyncIterable(
    stream: AsyncIterable<Groq.Chat.Completions.ChatCompletionChunk>
  ): AsyncIterable<string> {
    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content;
      if (text) {
        yield text;
      }
    }
  }
}

// Create singleton instance
let groqProvider: GroqProvider | null = null;

export function getGroqProvider(): GroqProvider {
  if (!groqProvider) {
    groqProvider = new GroqProvider();
  }
  return groqProvider;
}
