import { CheckCircle2, AlertCircle, Clock, Loader2 } from 'lucide-react';
import { PremiumCard, SectionHeader } from './premium-card';

interface ProcessingLog {
  id: string;
  step: 'extracting' | 'transcribing' | 'analyzing' | 'generating' | 'storing';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  errorMessage?: string;
  durationMs?: number;
  createdAt: string;
  updatedAt: string;
}

const stepLabels: Record<string, string> = {
  extracting: 'Audio Extraction',
  transcribing: 'Transcription',
  analyzing: 'Analysis',
  generating: 'Generating Suggestions',
  storing: 'Saving Results',
};

const stepDescriptions: Record<string, string> = {
  extracting: 'Preparing audio file for processing',
  transcribing: 'Converting speech to text using Whisper',
  analyzing: 'Extracting decisions, risks, and opportunities',
  generating: 'Generating email and message suggestions',
  storing: 'Saving all results to database',
};

export function ProcessingLogs({ logs = [] }: { logs?: ProcessingLog[] }) {
  if (logs.length === 0) {
    return null;
  }

  return (
    <section className="mb-12">
      <SectionHeader icon={Clock} title="Processing Log" />

      <PremiumCard>
        <div className="space-y-4">
          {logs.map((log, index) => {
            const isCompleted = log.status === 'completed';
            const isFailed = log.status === 'failed';
            const isInProgress = log.status === 'in_progress';

            return (
              <div key={log.id} className="space-y-2">
                <div className="flex items-start gap-3">
                  <div className="mt-1 shrink-0">
                    {isCompleted && <CheckCircle2 className="size-5 text-emerald-500" />}
                    {isFailed && <AlertCircle className="size-5 text-red-500" />}
                    {isInProgress && <Loader2 className="size-5 text-blue-500 animate-spin" />}
                    {log.status === 'pending' && <Clock className="size-5 text-muted-foreground" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{stepLabels[log.step]}</p>
                    <p className="text-xs text-muted-foreground">{stepDescriptions[log.step]}</p>

                    {isFailed && log.errorMessage && (
                      <p className="text-xs text-red-500 mt-1">{log.errorMessage}</p>
                    )}

                    {isCompleted && log.durationMs && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Completed in {(log.durationMs / 1000).toFixed(1)}s
                      </p>
                    )}
                  </div>

                  <div className="shrink-0 text-right">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        isCompleted
                          ? 'bg-emerald-500/10 text-emerald-700'
                          : isFailed
                            ? 'bg-red-500/10 text-red-700'
                            : isInProgress
                              ? 'bg-blue-500/10 text-blue-700'
                              : 'bg-gray-500/10 text-gray-700'
                      }`}
                    >
                      {log.status === 'in_progress' ? 'Processing' : log.status}
                    </span>
                  </div>
                </div>

                {index < logs.length - 1 && <div className="ml-2 h-4 border-l border-border" />}
              </div>
            );
          })}
        </div>
      </PremiumCard>
    </section>
  );
}
