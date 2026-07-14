import type { TranscriptionProvider, TranscriptionResult } from '../types';

export class WhisperTranscriptionProvider implements TranscriptionProvider {
  name = 'whisper';
  private apiKey: string;

  constructor(apiKey: string = process.env.OPENAI_API_KEY || '') {
    this.apiKey = apiKey;
  }

  async transcribe(audioUrl: string): Promise<TranscriptionResult> {
    try {
      // Download audio file from URL
      const audioResponse = await fetch(audioUrl);
      if (!audioResponse.ok) {
        throw new Error(`Failed to fetch audio: ${audioResponse.statusText}`);
      }

      const audioBuffer = await audioResponse.arrayBuffer();
      const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });

      // Create FormData for OpenAI API
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.mp3');
      formData.append('model', 'whisper-1');
      formData.append('response_format', 'json');
      formData.append('language', 'en');

      // Call OpenAI Whisper API
      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Whisper API error: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();

      // Parse transcript into segments (simplified - assumes speaker turns)
      const segments = this.parseTranscript(data.text);

      return {
        segments,
        duration: data.duration || 0,
        language: 'en',
      };
    } catch (error) {
      throw new Error(`Transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private parseTranscript(text: string): Array<{ speaker: string; text: string; timestamp: number }> {
    // Simple parsing - in production, would use more sophisticated speaker detection
    const segments = [];
    const lines = text.split('\n').filter(l => l.trim());

    for (let i = 0; i < lines.length; i++) {
      segments.push({
        speaker: `Speaker ${(i % 2) + 1}`,
        text: lines[i].trim(),
        timestamp: (i * 10), // Simplified timestamp
      });
    }

    return segments;
  }
}
