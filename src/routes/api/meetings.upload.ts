import { json } from '@tanstack/start';
import { createAPIFileRoute } from '@tanstack/start';
import { createClient } from '@/lib/supabase/server';
import { updateProcessingStatus } from '@/lib/supabase/storage';

export const Route = createAPIFileRoute('/api/meetings/upload')({
  POST: async ({ request }) => {
    try {
      const formData = await request.formData();
      const file = formData.get('file') as File;
      const title = formData.get('title') as string;
      
      if (!file || !title) {
        return json({ error: 'Missing required fields' }, { status: 400 });
      }

      const supabase = createClient();
      
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Save meeting to database
      const { data: meeting, error: dbError } = await supabase
        .from('meetings')
        .insert({
          user_id: user.id,
          title,
          date_time: new Date().toISOString(),
          processing_status: 'queued',
          processing_progress: 0,
        })
        .select()
        .single();

      if (dbError) {
        return json({ error: 'Failed to create meeting' }, { status: 500 });
      }

      // Upload file to storage
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'mp3';
      const timestamp = Date.now();
      const fileName = `${user.id}/${timestamp}-${meeting.id}.${fileExtension}`;

      const { error: uploadError } = await supabase.storage
        .from('meeting-audio')
        .upload(fileName, file);

      if (uploadError) {
        // Mark meeting as failed
        await updateProcessingStatus(meeting.id, 'failed', 0, uploadError.message);
        return json({ error: 'File upload failed' }, { status: 500 });
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('meeting-audio')
        .getPublicUrl(fileName);

      // Update meeting with file URL and queued status
      const { error: updateError } = await supabase
        .from('meetings')
        .update({
          audio_file_url: publicUrl,
          audio_file_size: file.size,
          file_type: fileExtension,
          processing_status: 'queued',
        })
        .eq('id', meeting.id);

      if (updateError) {
        return json({ error: 'Failed to update meeting' }, { status: 500 });
      }

      // Simulate processing start (in production, this would trigger a background job)
      // For now, we'll queue it to process after a short delay
      setTimeout(async () => {
        await simulateProcessing(meeting.id);
      }, 1000);

      return json({ 
        success: true, 
        meeting: {
          ...meeting,
          audio_file_url: publicUrl,
          audio_file_size: file.size,
          file_type: fileExtension,
          processing_status: 'queued',
        }
      });
    } catch (error) {
      return json({ 
        error: error instanceof Error ? error.message : 'Upload failed' 
      }, { status: 500 });
    }
  },
});

// Simulate processing meeting audio (would be replaced with real AI processing)
async function simulateProcessing(meetingId: string) {
  const supabase = createClient();
  
  // Update to processing
  await updateProcessingStatus(meetingId, 'processing', 10);
  await new Promise(r => setTimeout(r, 1000));

  // Simulate gradual progress
  for (let i = 20; i <= 90; i += 10) {
    await updateProcessingStatus(meetingId, 'processing', i);
    await new Promise(r => setTimeout(r, 500));
  }

  // Mark as completed
  await updateProcessingStatus(meetingId, 'completed', 100);
}
