import { useRef, useState } from 'react';
import type { DragEvent, ChangeEvent } from 'react';
import { Upload, Sparkles, Layers, AlertCircle, FileImage, FileCode } from 'lucide-react';
import { createSamplePngFile, createSampleSvgFile } from '../data/sampleFiles';

interface DropZoneProps {
  mode: 'png-to-svg' | 'svg-to-png';
  onFileSelected: (file: File) => void;
  isLoading: boolean;
}

export const DropZone: React.FC<DropZoneProps> = ({ mode, onFileSelected, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const acceptedExtensions = mode === 'png-to-svg' ? '.png,.jpg,.jpeg,.webp' : '.svg';
  const acceptedLabel = mode === 'png-to-svg' ? 'PNG, JPG, JPEG, WEBP' : 'SVG (Scalable Vector Graphics)';
  const maxSizeBytes = 30 * 1024 * 1024; // 30 MB

  const validateAndProcessFile = (file: File) => {
    setErrorMessage(null);

    // Validate size
    if (file.size > maxSizeBytes) {
      setErrorMessage(`File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds the 30 MB limit.`);
      return;
    }

    // Validate type
    if (mode === 'png-to-svg') {
      const validTypes = ['image/png', 'image/jpeg', 'image/webp'];
      const ext = file.name.split('.').pop()?.toLowerCase();
      const validExts = ['png', 'jpg', 'jpeg', 'webp'];
      
      if (!validTypes.includes(file.type) && (!ext || !validExts.includes(ext))) {
        setErrorMessage('Invalid file format. Please upload a PNG, JPG, or WEBP image.');
        return;
      }
    } else {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (file.type !== 'image/svg+xml' && ext !== 'svg') {
        setErrorMessage('Invalid file format. Please upload an SVG (.svg) vector file.');
        return;
      }
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
    // reset input so the same file can be selected again
    e.target.value = '';
  };

  const handleLoadSample = async () => {
    if (isLoading) return;
    setErrorMessage(null);
    if (mode === 'png-to-svg') {
      const sampleFile = await createSamplePngFile();
      onFileSelected(sampleFile);
    } else {
      const sampleFile = createSampleSvgFile();
      onFileSelected(sampleFile);
    }
  };

  return (
    <div className="w-full">
      {/* Hidden native input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleInputChange}
        accept={acceptedExtensions}
        className="hidden"
      />

      {/* Drop Zone Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isLoading && fileInputRef.current?.click()}
        className={`relative group rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center transition-all duration-300 cursor-pointer overflow-hidden ${
          isDragOver
            ? mode === 'png-to-svg'
              ? 'border-[#00D1FF] bg-[#00D1FF]/10 shadow-2xl shadow-[#00D1FF]/20 scale-[1.01]'
              : 'border-[#8B5CF6] bg-[#8B5CF6]/10 shadow-2xl shadow-[#8B5CF6]/20 scale-[1.01]'
            : 'border-white/10 dark:border-white/10 light:border-slate-300 bg-[#131318]/70 dark:bg-[#131318]/70 light:bg-slate-50 hover:border-white/25 dark:hover:border-white/25 light:hover:border-slate-400 hover:bg-[#131318] dark:hover:bg-[#131318] light:hover:bg-white'
        }`}
      >
        {/* Subtle background glow effect on hover */}
        <div
          className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none -z-10 ${
            mode === 'png-to-svg'
              ? 'bg-gradient-to-b from-[#00D1FF]/5 to-transparent'
              : 'bg-gradient-to-b from-[#8B5CF6]/5 to-transparent'
          }`}
        />

        <div className="flex flex-col items-center justify-center max-w-md mx-auto">
          {/* Main upload icon */}
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110 shadow-lg ${
              mode === 'png-to-svg'
                ? 'bg-gradient-to-tr from-[#00D1FF]/20 to-[#00D1FF]/5 border border-[#00D1FF]/30 text-[#00D1FF] shadow-[#00D1FF]/10'
                : 'bg-gradient-to-tr from-[#8B5CF6]/20 to-[#8B5CF6]/5 border border-[#8B5CF6]/30 text-[#8B5CF6] shadow-[#8B5CF6]/10'
            }`}
          >
            <Upload className="w-8 h-8 animate-pulse" />
          </div>

          {/* Prompt headline */}
          <h3 className="text-lg sm:text-xl font-bold text-white dark:text-white light:text-slate-900 mb-2">
            Drag &amp; drop your {mode === 'png-to-svg' ? 'raster image' : 'vector SVG'} here
          </h3>

          <p className="text-xs sm:text-sm text-[#A1A1AA] dark:text-[#A1A1AA] light:text-slate-500 mb-6 max-w-sm">
            or <span className={mode === 'png-to-svg' ? 'text-[#00D1FF] font-medium underline' : 'text-[#8B5CF6] font-medium underline'}>browse files</span> from your computer. Max 30 MB.
          </p>

          {/* Format pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 dark:bg-white/5 light:bg-slate-200 text-xs font-mono text-[#FAFAFA] dark:text-[#FAFAFA] light:text-slate-700 border border-white/10 dark:border-white/10 light:border-slate-300">
              {mode === 'png-to-svg' ? <FileImage className="w-3.5 h-3.5 text-[#00D1FF]" /> : <FileCode className="w-3.5 h-3.5 text-[#8B5CF6]" />}
              {acceptedLabel}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-mono border border-emerald-500/20">
              Client-side
            </span>
          </div>

          {/* Quick sample loader button (stops propagation so it triggers sample instead of file picker) */}
          <div className="pt-2 border-t border-white/5 dark:border-white/5 light:border-slate-200 w-full flex items-center justify-center">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleLoadSample();
              }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                mode === 'png-to-svg'
                  ? 'bg-[#00D1FF]/10 text-[#00D1FF] hover:bg-[#00D1FF]/20 border border-[#00D1FF]/30 hover:scale-105'
                  : 'bg-[#8B5CF6]/10 text-[#8B5CF6] hover:bg-[#8B5CF6]/20 border border-[#8B5CF6]/30 hover:scale-105'
              }`}
            >
              {mode === 'png-to-svg' ? <Sparkles className="w-3.5 h-3.5" /> : <Layers className="w-3.5 h-3.5" />}
              <span>Don't have a file? Try our {mode === 'png-to-svg' ? 'Demo PNG' : 'Demo SVG'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error state alert */}
      {errorMessage && (
        <div className="mt-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-400 text-xs sm:text-sm animate-shake">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
