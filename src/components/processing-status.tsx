import { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { subscribeToMeetingProgress } from '@/lib/supabase/storage';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface ProcessingStatusProps {
  meetingId: string;
  initialStatus?: 'pending' | 'uploading' | 'queued' | 'processing' | 'completed' | 'failed';
  initialProgress?: number;
}

export function ProcessingStatus({ 
  meetingId, 
  initialStatus = 'queued',
  initialProgress = 0 
}: ProcessingStatusProps) {
  const [status, setStatus] = useState<'pending' | 'uploading' | 'queued' | 'processing' | 'completed' | 'failed'>(initialStatus);
  const [progress, setProgress] = useState(initialProgress);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    // Subscribe to real-time updates
    const subscription = subscribeToMeetingProgress(meetingId, (newStatus, newProgress) => {
      setStatus(newStatus);
      setProgress(newProgress);
    });

    setChannel(subscription);

    return () => {
      subscription?.unsubscribe();
    };
  }, [meetingId]);

  const getStatusLabel = () => {
    switch (status) {
      case 'uploading':
        return 'Uploading...';
      case 'queued':
        return 'Queued for processing';
      case 'processing':
        return 'Processing meeting...';
      case 'completed':
        return 'Processing complete!';
      case 'failed':
        return 'Processing failed';
      default:
        return 'Pending';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'uploading':
      case 'processing':
      case 'queued':
        return <Loader2 className="size-5 animate-spin text-primary" />;
      case 'completed':
        return <CheckCircle2 className="size-5 text-green-500" />;
      case 'failed':
        return <AlertCircle className="size-5 text-destructive" />;
      default:
        return <Clock className="size-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-600 border-green-200';
      case 'failed':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'processing':
      case 'uploading':
        return 'bg-primary/10 text-primary border-primary/20';
      default:
        return 'bg-surface border-border';
    }
  };

  return (
    <div className={`rounded-2xl border p-6 space-y-4 ${getStatusColor()}`}>
      <div className="flex items-start gap-3">
        {getStatusIcon()}
        <div className="flex-1">
          <h3 className="font-medium">{getStatusLabel()}</h3>
          <p className="text-sm opacity-75">
            {status === 'processing' && 'AI is analyzing your meeting audio and generating insights...'}
            {status === 'queued' && 'Your meeting is in the queue. Processing will start shortly.'}
            {status === 'uploading' && 'Your audio file is being uploaded to secure storage.'}
            {status === 'completed' && 'Your meeting has been fully processed. View the analysis below.'}
            {status === 'failed' && 'There was an issue processing your meeting. Please try again.'}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      {status !== 'completed' && status !== 'failed' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span>Progress</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-black/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-current transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Status Timeline */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center gap-2 text-xs">
          <div className={`size-2 rounded-full ${status !== 'pending' ? 'bg-current' : 'bg-muted-foreground/30'}`} />
          <span>Upload</span>
          {status !== 'uploading' && status !== 'pending' && (
            <CheckCircle2 className="size-3 ml-auto" />
          )}
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className={`size-2 rounded-full ${['processing', 'completed', 'failed'].includes(status) ? 'bg-current' : 'bg-muted-foreground/30'}`} />
          <span>Processing</span>
          {status === 'completed' && (
            <CheckCircle2 className="size-3 ml-auto" />
          )}
          {status === 'failed' && (
            <AlertCircle className="size-3 ml-auto" />
          )}
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className={`size-2 rounded-full ${status === 'completed' ? 'bg-current' : 'bg-muted-foreground/30'}`} />
          <span>Ready to view</span>
          {status === 'completed' && (
            <CheckCircle2 className="size-3 ml-auto" />
          )}
        </div>
      </div>
    </div>
  );
}
