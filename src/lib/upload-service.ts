import { createClient } from '@/lib/supabase/client';

export interface UploadMeetingOptions {
  title: string;
  file: File;
  onProgress?: (progress: number) => void;
}

export interface UploadResult {
  meetingId: string;
  audioFileUrl: string;
  processingStatus: 'uploading' | 'queued' | 'processing' | 'completed' | 'failed';
}

/**
 * Upload a meeting audio file to Supabase Storage and create a meeting record
 */
export async function uploadMeeting(
  options: UploadMeetingOptions
): Promise<UploadResult> {
  const { title, file, onProgress } = options;
  
  if (!title.trim()) {
    throw new Error('Meeting title is required');
  }

  if (!file) {
    throw new Error('File is required');
  }

  // Validate file type
  const allowedTypes = ['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/x-m4a'];
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  const allowedExtensions = ['mp3', 'mp4', 'wav', 'm4a'];

  if (!allowedExtensions.includes(fileExtension || '')) {
    throw new Error(`Invalid file type. Allowed: ${allowedExtensions.join(', ')}`);
  }

  // Validate file size (500MB max)
  const maxSize = 500 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('File is too large. Maximum size is 500MB');
  }

  try {
    const supabase = createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error('You must be logged in to upload a meeting');
    }

    // Create meeting record with "uploading" status
    const meetingId = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    const { error: insertError } = await supabase.from('meetings').insert({
      id: meetingId,
      user_id: user.id,
      title: title.trim(),
      date_time: timestamp,
      processing_status: 'uploading',
      processing_progress: 0,
      file_type: fileExtension,
      audio_file_size: file.size,
    });

    if (insertError) {
      throw new Error(`Failed to create meeting record: ${insertError.message}`);
    }

    onProgress?.(10);

    // Upload file to Supabase Storage
    const fileName = `${user.id}/${meetingId}/${file.name}`;

    const { error: uploadError, data: uploadData } = await supabase.storage
      .from('meeting-audio')
      .upload(fileName, file, {
        upsert: false,
      });

    if (uploadError) {
      // Mark meeting as failed
      await supabase
        .from('meetings')
        .update({
          processing_status: 'failed',
          error_message: uploadError.message,
        })
        .eq('id', meetingId);

      throw new Error(`File upload failed: ${uploadError.message}`);
    }

    onProgress?.(50);

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('meeting-audio')
      .getPublicUrl(fileName);

    // Update meeting record with file URL and queued status
    const { error: updateError } = await supabase.from('meetings').update({
      audio_file_url: publicUrlData.publicUrl,
      processing_status: 'queued',
      processing_progress: 50,
    }).eq('id', meetingId);

    if (updateError) {
      throw new Error(`Failed to update meeting: ${updateError.message}`);
    }

    onProgress?.(75);

    return {
      meetingId,
      audioFileUrl: publicUrlData.publicUrl,
      processingStatus: 'queued',
    };
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error('An unexpected error occurred during upload');
  }
}

/**
 * Create a processing log entry for tracking upload progress
 */
export async function createProcessingLog(
  meetingId: string,
  step: string,
  status: 'pending' | 'in_progress' | 'completed' | 'failed',
  errorMessage?: string
) {
  const supabase = createClient();

  const { error } = await supabase.from('processing_logs').insert({
    meeting_id: meetingId,
    step,
    status,
    error_message: errorMessage,
    created_at: new Date().toISOString(),
  });

  if (error) {
    console.error('[v0] Failed to create processing log:', error);
  }
}

/**
 * Update meeting processing status
 */
export async function updateMeetingStatus(
  meetingId: string,
  status: 'uploading' | 'queued' | 'processing' | 'completed' | 'failed',
  progress: number,
  errorMessage?: string
) {
  const supabase = createClient();

  const updateData: any = {
    processing_status: status,
    processing_progress: progress,
  };

  if (errorMessage) {
    updateData.error_message = errorMessage;
  }

  const { error } = await supabase
    .from('meetings')
    .update(updateData)
    .eq('id', meetingId);

  if (error) {
    console.error('[v0] Failed to update meeting status:', error);
  }
}
