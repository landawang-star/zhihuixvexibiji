import { useState, useRef, useCallback } from 'react';
import { Upload, FileVideo, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoUploaderProps {
  file: File | null;
  onFile: (file: File | null) => void;
}

const ALLOWED_TYPES = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
const MAX_SIZE_MB = 2048;

export function VideoUploader({ file, onFile }: VideoUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((f: File): string | null => {
    if (!ALLOWED_TYPES.includes(f.type)) {
      return '不支持的视频格式，请上传 mp4、mov、avi 或 webm 格式';
    }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      return `视频文件过大（最大 ${MAX_SIZE_MB}MB）`;
    }
    return null;
  }, []);

  const handleFile = useCallback(
    (f: File | null) => {
      setError(null);
      if (!f) {
        onFile(null);
        return;
      }
      const err = validateFile(f);
      if (err) {
        setError(err);
        onFile(null);
        return;
      }
      onFile(f);
    },
    [validateFile, onFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      handleFile(e.dataTransfer.files[0] || null);
    },
    [handleFile]
  );

  if (file) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    return (
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
        <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
          <FileVideo className="w-5 h-5 text-indigo-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate">{file.name}</p>
          <p className="text-xs text-gray-500">{sizeMB} MB</p>
        </div>
        <button
          onClick={() => handleFile(null)}
          className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors',
          isDragOver
            ? 'border-indigo-400 bg-indigo-50'
            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
        )}
      >
        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
        <p className="text-sm text-gray-600 mb-1">拖拽视频文件到此处，或点击选择</p>
        <p className="text-xs text-gray-400">支持 mp4、mov、avi、webm 格式，最大 {MAX_SIZE_MB}MB</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(',')}
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] || null)}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
