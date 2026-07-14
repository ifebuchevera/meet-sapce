import type { TranscriptionProvider, AnalysisProvider, GenerationProvider, ProcessingLog } from './types';
import { createClient } from '@/lib/supabase/client';

export class MeetingProcessor {
  constructor(
    private transcriptionProvider: TranscriptionProvider,
    private analysisProvider: AnalysisProvider,
    private generationProvider: GenerationProvider,
  ) {}

  async processMeeting(
    meetingId: string,
    audioUrl: string,
    meetingTitle: string,
    onProgress?: (step: string, progress: number) => void,
  ) {
    const supabase = createClient();

    try {
      // Step 1: Transcribe
      onProgress?.('Transcribing audio...', 20);
      console.log('[v0] Starting transcription');
      const transcriptionResult = await this.transcriptionProvider.transcribe(audioUrl);
      const transcript = transcriptionResult.segments.map((s) => `${s.speaker}: ${s.text}`).join('\n');

      // Save transcripts to database
      await this.saveTranscripts(supabase, meetingId, transcriptionResult.segments);

      // Step 2: Analyze
      onProgress?.('Analyzing meeting...', 50);
      console.log('[v0] Starting analysis');
      const analysis = await this.analysisProvider.analyze(transcript, meetingTitle);

      // Save analysis results
      await this.saveAnalysis(supabase, meetingId, analysis);

      // Step 3: Generate
      onProgress?.('Generating suggestions...', 80);
      console.log('[v0] Starting generation');
      const generation = await this.generationProvider.generate(analysis, transcript, meetingTitle);

      // Save generated content
      await this.saveGeneration(supabase, meetingId, generation);

      // Step 4: Update meeting status
      onProgress?.('Finalizing...', 100);
      await supabase
        .from('meetings')
        .update({
          processing_status: 'completed',
          processing_progress: 100,
          ai_processed_at: new Date().toISOString(),
        })
        .eq('id', meetingId);

      console.log('[v0] Meeting processing completed successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[v0] Meeting processing failed:', errorMessage);

      // Update meeting with error status
      await supabase
        .from('meetings')
        .update({
          processing_status: 'failed',
          error_message: errorMessage,
        })
        .eq('id', meetingId);

      throw error;
    }
  }

  private async saveTranscripts(
    supabase: ReturnType<typeof createClient>,
    meetingId: string,
    segments: Array<{ speaker: string; text: string; timestamp: number }>,
  ) {
    const records = segments.map((segment) => ({
      meeting_id: meetingId,
      speaker: segment.speaker,
      text: segment.text,
      timestamp_seconds: Math.floor(segment.timestamp),
    }));

    const { error } = await supabase.from('transcripts').insert(records);
    if (error) throw new Error(`Failed to save transcripts: ${error.message}`);
  }

  private async saveAnalysis(
    supabase: ReturnType<typeof createClient>,
    meetingId: string,
    analysis: Awaited<ReturnType<AnalysisProvider['analyze']>>,
  ) {
    const decisions = analysis.decisions.map((d) => ({
      meeting_id: meetingId,
      title: d,
      description: '',
    }));

    const risks = analysis.risks.map((r) => ({
      meeting_id: meetingId,
      title: r,
      description: '',
    }));

    const opportunities = analysis.opportunities.map((o) => ({
      meeting_id: meetingId,
      title: o,
      description: '',
    }));

    const actionItems = analysis.actionItems.map((item) => ({
      meeting_id: meetingId,
      title: item.title,
      owner: item.owner || 'Unassigned',
      status: 'pending',
    }));

    const [{ error: decError }, { error: riskError }, { error: oppError }, { error: actionError }] = await Promise.all([
      supabase.from('decisions').insert(decisions),
      supabase.from('risks').insert(risks),
      supabase.from('opportunities').insert(opportunities),
      supabase.from('action_items').insert(actionItems),
    ]);

    if (decError || riskError || oppError || actionError) {
      throw new Error('Failed to save analysis results');
    }

    // Update meeting with summary
    await supabase
      .from('meetings')
      .update({
        summary: analysis.summary,
        tags: analysis.keyTopics,
      })
      .eq('id', meetingId);
  }

  private async saveGeneration(
    supabase: ReturnType<typeof createClient>,
    meetingId: string,
    generation: Awaited<ReturnType<GenerationProvider['generate']>>,
  ) {
    const emails = generation.emails.map((e) => ({
      meeting_id: meetingId,
      recipient_name: e.recipientName,
      recipient_email: e.recipientEmail,
      subject: e.subject,
      body: e.body,
    }));

    const messages = generation.messages.map((m) => ({
      meeting_id: meetingId,
      channel: m.channel,
      body: m.body,
    }));

    const [{ error: emailError }, { error: msgError }] = await Promise.all([
      emails.length > 0 ? supabase.from('suggested_emails').insert(emails) : Promise.resolve({ error: null }),
      messages.length > 0 ? supabase.from('suggested_messages').insert(messages) : Promise.resolve({ error: null }),
    ]);

    if (emailError || msgError) {
      throw new Error('Failed to save generated content');
    }
  }
}
