import { useState, useRef } from 'react';
import { Cloud, AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react';
import { formatFileSize } from '@/lib/supabase/storage';

interface FileUploadProps {
  onUpload: (file: File, title: string) => Promise<void>;
  isLoading?: boolean;
  error?: string;
}

export function FileUpload({ onUpload, isLoading, error: initialError }: FileUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [error, setError] = useState(initialError);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);

  const ALLOWED_TYPES = ['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/x-m4a'];
  const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

  const validateFile = (file: File) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Unsupported file type. Allowed: MP3, MP4, WAV, M4A');
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError(`File size exceeds 500MB. Your file is ${formatFileSize(file.size)}`);
      return false;
    }
    return true;
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        setError('');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        setError('');
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile || !title.trim()) {
      setError('Please select a file and enter a title');
      return;
    }

    setUploadStatus('uploading');
    setError('');

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 20;
        });
      }, 200);

      await onUpload(selectedFile, title);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadStatus('success');
      setSelectedFile(null);
      setTitle('');

      // Reset after 2 seconds
      setTimeout(() => {
        setUploadStatus('idle');
        setUploadProgress(0);
      }, 2000);
    } catch (err) {
      setUploadStatus('error');
      setError(err instanceof Error ? err.message : 'Upload failed');
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleUpload} className="space-y-4">
        {/* Title Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Meeting Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Q3 Planning Session"
            disabled={isLoading || uploadStatus === 'uploading'}
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm outline-none focus:border-foreground/30 disabled:opacity-50 transition-colors"
          />
        </div>

        {/* File Drop Zone */}
        <div
          ref={dragRef}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative rounded-2xl border-2 border-dashed p-8 transition-all cursor-pointer ${
            isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-foreground/20 hover:bg-surface/30'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            accept="audio/*"
            disabled={isLoading || uploadStatus === 'uploading'}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center gap-3">
            {selectedFile ? (
              <>
                <CheckCircle2 className="size-12 text-green-500" />
                <div className="text-center">
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </>
            ) : (
              <>
                <Cloud className="size-12 text-muted-foreground" />
                <div className="text-center">
                  <p className="font-medium">Drop your audio file here</p>
                  <p className="text-xs text-muted-foreground">
                    MP3, MP4, WAV, M4A up to 500MB
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Progress Bar */}
          {uploadStatus === 'uploading' && (
            <div className="absolute inset-0 rounded-2xl bg-primary/5 flex items-center justify-center">
              <div className="w-32 space-y-2">
                <div className="h-1 bg-primary/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-center text-muted-foreground">
                  {Math.round(uploadProgress)}%
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            <AlertCircle className="size-4 mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={!selectedFile || !title.trim() || isLoading || uploadStatus === 'uploading' || uploadStatus === 'success'}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {uploadStatus === 'uploading' ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Uploading...
              </>
            ) : uploadStatus === 'success' ? (
              <>
                <CheckCircle2 className="size-4" />
                Uploaded!
              </>
            ) : (
              'Upload Meeting'
            )}
          </button>

          {selectedFile && uploadStatus === 'idle' && (
            <button
              type="button"
              onClick={() => {
                setSelectedFile(null);
                setTitle('');
                setError('');
              }}
              className="px-4 py-2.5 bg-background border border-border rounded-lg hover:bg-surface transition-colors"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
