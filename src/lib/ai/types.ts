// Transcription types
export interface TranscriptionSegment {
  speaker: string;
  text: string;
  timestamp: number; // in seconds
}

export interface TranscriptionResult {
  segments: TranscriptionSegment[];
  duration: number;
  language: string;
}

export interface TranscriptionProvider {
  transcribe(audioUrl: string): Promise<TranscriptionResult>;
  name: string;
}

// Analysis types
export interface AnalysisResult {
  summary: string;
  decisions: string[];
  risks: string[];
  opportunities: string[];
  keyTopics: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  actionItems: Array<{
    title: string;
    owner?: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}

export interface AnalysisProvider {
  analyze(transcript: string, context?: string): Promise<AnalysisResult>;
  name: string;
}

// Generation types
export interface GeneratedEmail {
  recipientName: string;
  recipientEmail: string;
  subject: string;
  body: string;
}

export interface GeneratedMessage {
  channel: 'whatsapp' | 'slack' | 'email';
  body: string;
}

export interface GenerationResult {
  emails: GeneratedEmail[];
  messages: GeneratedMessage[];
}

export interface GenerationProvider {
  generate(analysis: AnalysisResult, transcript: string, meetingTitle: string): Promise<GenerationResult>;
  name: string;
}

// Processing step types
export type ProcessingStep = 'extracting' | 'transcribing' | 'analyzing' | 'generating' | 'storing';

export interface ProcessingLog {
  id: string;
  meetingId: string;
  step: ProcessingStep;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  errorMessage?: string;
  durationMs?: number;
  createdAt: Date;
  updatedAt: Date;
}
