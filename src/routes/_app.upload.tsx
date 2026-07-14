import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { AppHeader } from '@/components/app-header';
import { FileUpload } from '@/components/file-upload';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, CheckCircle2 } from 'lucide-react';

function UploadPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [uploadedMeeting, setUploadedMeeting] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpload = async (file: File, title: string) => {
    setIsLoading(true);
    setError('');

    try {
      // For now, show a mock upload success
      // In production, this would upload to Supabase Storage and create the meeting
      const mockMeeting = {
        id: 'mock-' + Date.now(),
        title,
        date_time: new Date().toISOString(),
        processing_status: 'queued' as const,
        processing_progress: 0,
      };
      
      setUploadedMeeting(mockMeeting);
      
      // Invalidate meetings query to show new meeting
      queryClient.invalidateQueries({ queryKey: ['meetings'] });

      // Navigate to meeting detail after 2 seconds
      setTimeout(() => {
        navigate({ to: `/meetings/${mockMeeting.id}` });
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AppHeader 
        title="Upload Meeting" 
        subtitle="Record a new meeting or upload an audio file to analyze"
      />

      <div className="max-w-2xl mx-auto p-6 md:p-8">
        {uploadedMeeting && !isLoading ? (
          // Success state
          <div className="animate-fade-in-up text-center space-y-4">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl" />
                <CheckCircle2 className="relative size-16 text-green-500" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">Meeting Uploaded Successfully</h2>
              <p className="text-sm text-muted-foreground">
                "{uploadedMeeting.title}" is being processed. Redirecting to meeting details...
              </p>
            </div>
            <div className="pt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Processing...
            </div>
          </div>
        ) : (
          // Upload form
          <div className="space-y-8">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Add Audio File</h2>
              <p className="text-sm text-muted-foreground">
                Upload a recording to get AI-powered meeting analysis including transcripts, 
                decisions, action items, and more.
              </p>
            </div>

            <FileUpload 
              onUpload={handleUpload}
              isLoading={isLoading}
              error={error}
            />

            {/* File Format Info */}
            <div className="rounded-2xl border border-border/50 bg-surface/50 p-6 space-y-4">
              <h3 className="font-medium">Supported Formats</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="size-2 bg-primary rounded-full" />
                  <span>MP3 (MPEG Audio)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="size-2 bg-primary rounded-full" />
                  <span>MP4 (MPEG-4 Video)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="size-2 bg-primary rounded-full" />
                  <span>WAV (Waveform Audio)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="size-2 bg-primary rounded-full" />
                  <span>M4A (MPEG-4 Audio)</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground pt-2 border-t border-border">
                Maximum file size: 500MB. Processing usually takes a few minutes depending on file size.
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export const Route = createFileRoute('/_app/upload')({
  component: UploadPage,
});
