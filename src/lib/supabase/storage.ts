import { createClient } from './client';
import type { Meeting } from './types';

const BUCKET_NAME = 'meeting-audio';
const ALLOWED_TYPES = ['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/x-m4a'];
const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

export type FileType = 'mp3' | 'mp4' | 'wav' | 'm4a';

interface UploadProgress {
  fileName: string;
  fileSize: number;
  uploadedSize: number;
  percentage: number;
  status: 'uploading' | 'queued' | 'processing' | 'completed' | 'failed';
}

export async function uploadMeetingAudio(
  file: File,
  userId: string,
  meetingTitle: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<{ url: string; fileType: FileType } | { error: string }> {
  try {
    // Validate file
    const validation = validateAudioFile(file);
    if ('error' in validation) {
      return validation;
    }

    const { fileType, mimeType } = validation;
    const supabase = createClient();
    
    // Generate unique file path
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${userId}/${timestamp}-${file.name}`;

    // Report uploading status
    onProgress?.({
      fileName: file.name,
      fileSize: file.size,
      uploadedSize: 0,
      percentage: 0,
      status: 'uploading',
    });

    // Upload file to Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        contentType: mimeType,
        upsert: false,
      });

    if (uploadError) {
      return { error: `Upload failed: ${uploadError.message}` };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    // Report queued status (waiting for processing)
    onProgress?.({
      fileName: file.name,
      fileSize: file.size,
      uploadedSize: file.size,
      percentage: 100,
      status: 'queued',
    });

    return { url: publicUrl, fileType };
  } catch (error) {
    return { error: `Upload error: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

export async function createMeetingRecord(
  userId: string,
  title: string,
  audioUrl: string,
  fileType: FileType,
  fileSize: number
): Promise<{ meeting: Meeting } | { error: string }> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('meetings')
      .insert({
        user_id: userId,
        title,
        date_time: new Date().toISOString(),
        audio_file_url: audioUrl,
        file_type: fileType,
        audio_file_size: fileSize,
        processing_status: 'queued',
        processing_progress: 0,
      })
      .select()
      .single();

    if (error) {
      return { error: `Failed to create meeting: ${error.message}` };
    }

    return { meeting: data };
  } catch (error) {
    return { error: `Database error: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

export async function updateProcessingStatus(
  meetingId: string,
  status: 'uploading' | 'queued' | 'processing' | 'completed' | 'failed',
  progress?: number,
  errorMessage?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();

    const updateData: any = { processing_status: status };
    if (progress !== undefined) updateData.processing_progress = progress;
    if (errorMessage) updateData.error_message = errorMessage;

    const { error } = await supabase
      .from('meetings')
      .update(updateData)
      .eq('id', meetingId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function subscribeToMeetingProgress(
  meetingId: string,
  onUpdate: (status: 'queued' | 'processing' | 'completed' | 'failed', progress: number) => void
) {
  const supabase = createClient();

  return supabase
    .channel(`meeting:${meetingId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'meetings',
        filter: `id=eq.${meetingId}`,
      },
      (payload: any) => {
        const { processing_status, processing_progress } = payload.new;
        onUpdate(processing_status, processing_progress);
      }
    )
    .subscribe();
}

function validateAudioFile(file: File): { fileType: FileType; mimeType: string } | { error: string } {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return { error: `File size exceeds 500MB limit. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB` };
  }

  // Check MIME type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: `Unsupported file type. Allowed types: mp3, mp4, wav, m4a` };
  }

  // Determine file type from extension
  const extension = file.name.split('.').pop()?.toLowerCase() as FileType | undefined;
  if (!extension || !['mp3', 'mp4', 'wav', 'm4a'].includes(extension)) {
    return { error: 'Could not determine file type from extension' };
  }

  return { fileType: extension, mimeType: file.type };
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
