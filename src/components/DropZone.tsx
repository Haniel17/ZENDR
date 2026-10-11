import { useRef, useState } from 'react';
import type { DragEvent, ChangeEvent } from 'react';
import { Image as ImageIcon, FolderOpen, AlertCircle, FileCode } from 'lucide-react';

interface DropZoneProps {
  mode: string;
  onFileSelected: (file: File) => void;
  isLoading: boolean;
  acceptedExtensions?: string;
  acceptedHint?: string;
}

export const DropZone: React.FC<DropZoneProps> = ({
  mode,
  onFileSelected,
  isLoading,
  acceptedExtensions: customExts,
  acceptedHint: customHint
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const acceptedExtensions =
    customExts ||
    (mode === 'svg-to-png' || mode === 'svg-converter'
      ? '.svg'
      : '.png,.jpg,.jpeg,.webp,.jfif,.heic,.heif,.bmp');

  const acceptedHint =
    customHint ||
    (mode === 'svg-to-png' || mode === 'svg-converter'
      ? 'SVG vector file'
      : 'PNG, JPG, WEBP, JFIF, or HEIC');

  const maxSizeBytes = 30 * 1024 * 1024; // 30 MB

  const validateAndProcessFile = (file: File) => {
    setErrorMessage(null);

    if (file.size > maxSizeBytes) {
      setErrorMessage(`File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds 30 MB limit.`);
      return;
    }

    onFileSelected(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (isLoading) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      validateAndProcessFile(files[0]);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndProcessFile(files[0]);
    }
    e.target.value = '';
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleInputChange}
        accept={acceptedExtensions}
        className="hidden"
      />

      {/* Floating Center Glass Card Styled Exactly Like Reference Screenshot */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isLoading && fileInputRef.current?.click()}
        className={`group relative rounded-[28px] border border-dashed transition-transform transition-colors duration-100 active:scale-[0.99] cursor-pointer p-12 sm:p-16 text-center select-none backdrop-blur-md ${
          isDragOver
            ? 'border-amber-400 bg-amber-500/[0.08] shadow-[0_0_50px_rgba(245,158,11,0.25)]'
            : 'futuristic-card hover:border-amber-400/40'
        }`}
      >
        <div className="flex flex-col items-center justify-center space-y-4 max-w-sm mx-auto">
          {/* Centered Squircle Icon */}
          <div className="w-16 h-16 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/80 group-hover:text-amber-400 group-hover:scale-105 transition-all duration-300 shadow-inner">
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            ) : mode === 'png-to-svg' ? (
              <ImageIcon className="w-7 h-7 stroke-[1.5]" />
            ) : (
              <FileCode className="w-7 h-7 stroke-[1.5]" />
            )}
          </div>

          {/* Heading */}
          <div className="space-y-1">
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {mode === 'png-to-svg' ? 'Drag your images' : 'Drag your SVG'}
            </h3>
            <p className="text-xs sm:text-sm text-white/50">
              or click to add
            </p>
          </div>

          {/* Amber Select Action */}
          <div className="pt-1">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 group-hover:text-amber-300 transition-colors">
              <FolderOpen className="w-3.5 h-3.5" />
              <span>or select a {mode === 'png-to-svg' ? 'file' : 'vector'}</span>
            </span>
          </div>

          {/* Format Hint Badge */}
          <div className="pt-2 text-[11px] font-mono text-white/40">
            <span>{acceptedHint} • up to 30 MB</span>
          </div>
        </div>
      </div>

      {/* Error state alert */}
      {errorMessage && (
        <div className="mt-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-300 text-xs sm:text-sm backdrop-blur-xl">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
