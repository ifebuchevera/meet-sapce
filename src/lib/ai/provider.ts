/**
 * AI Provider Interface
 * 
 * Defines the contract for AI service providers.
 * Future providers (OpenAI, Anthropic, etc.) implement this interface.
 * This ensures the UI and services don't depend on a specific provider.
 */

export interface TextStreamResponse {
  stream: AsyncIterable<string>;
  metadata?: {
    usage?: {
      promptTokens: number;
      completionTokens: number;
    };
  };
}

export interface StructuredResponse<T = Record<string, unknown>> {
  data: T;
  metadata?: {
    usage?: {
      promptTokens: number;
      completionTokens: number;
    };
  };
}

export interface AIProvider {
  /**
   * Stream text response from AI model
   * Used for chat, content generation, streaming responses
   */
  streamText(
    messages: Array<{ role: "user" | "assistant"; content: string }>,
    systemPrompt?: string,
    options?: {
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<TextStreamResponse>;

  /**
   * Get structured response from AI model
   * Used for extracting meeting data, parsing, etc.
   * Returns JSON matching the provided schema
   */
  generateStructured<T = Record<string, unknown>>(
    prompt: string,
    schema?: T,
    options?: {
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<StructuredResponse<T>>;

  /**
   * Get embedding vector for text
   * Used for semantic search
   */
  embed(text: string): Promise<number[]>;

  /**
   * Check if provider is properly configured
   */
  isConfigured(): boolean;
}

export interface TranscriptionProvider {
  /**
   * Transcribe audio file to text
   * Supports: mp3, wav, m4a, mp4, mov
   */
  transcribe(
    audioBuffer: Buffer,
    mimeType: string,
    language?: string
  ): Promise<{
    text: string;
    language?: string;
    duration?: number;
  }>;

  /**
   * Check if provider is properly configured
   */
  isConfigured(): boolean;
}
