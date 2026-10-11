import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  compressImage,
  compressJpeg,
  compressPng,
  compressPdfWithLevel
} from '../utils/compressionEngine';
import type { PdfCompressionLevel } from '../utils/compressionEngine';
import { formatBytes } from '../utils/fileValidation';
import {
  Minimize2,
  ArrowLeft,
  ShieldCheck,
  Download,
  RotateCcw,
  Sliders,
  CheckCircle2,
  RefreshCw,
  Percent,
  FileText,
  Image as ImageIcon
} from 'lucide-react';

interface CompressorWorkspaceProps {
  initialMode?: 'image-compressor' | 'jpeg-compressor' | 'png-compressor' | 'pdf-compressor';
}

const COMPRESSOR_METADATA: Record<string, { title: string; subtitle: string; accept: string; icon: string }> = {
  'image-compressor': {
    title: 'Image Compressor',
    subtitle: 'Universal image size reducer: compress JPG, PNG, WEBP, and HEIC with optimal visual fidelity.',
    accept: '.jpg,.jpeg,.png,.webp,.jfif,.heic,.bmp',
    icon: 'ImageIcon'
  },
  'jpeg-compressor': {
    title: 'JPEG Compressor',
    subtitle: 'Fine-tune JPEG compression levels, chroma subsampling, and dimensions to drastically reduce file weight.',
    accept: '.jpg,.jpeg',
    icon: 'ImageIcon'
  },
  'png-compressor': {
    title: 'PNG Compressor',
    subtitle: 'Quantize color palettes and strip unneeded chunks to shrink PNG file sizes while preserving transparency.',
    accept: '.png',
    icon: 'ImageIcon'
  },
  'pdf-compressor': {
    title: 'PDF Compressor',
    subtitle: 'Optimize object streams, clean duplicate fonts, and downsample embedded images 100% in your browser.',
    accept: '.pdf',
    icon: 'FileText'
  }
};

export const CompressorWorkspacePage: React.FC<CompressorWorkspaceProps> = ({ initialMode }) => {
  const { toolId: paramToolId } = useParams<{ toolId?: string }>();
  const mode = paramToolId || initialMode || 'image-compressor';
  const meta = COMPRESSOR_METADATA[mode] || COMPRESSOR_METADATA['image-compressor'];

  const isPdf = mode === 'pdf-compressor';

  // File states
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Settings
  const [qualityPreset, setQualityPreset] = useState<'high' | 'balanced' | 'small' | 'custom'>('balanced');
  const [qualityValue, setQualityValue] = useState<number>(75); // 10 to 100
  const [colorDepth, setColorDepth] = useState<number>(128); // For PNG
  const [maxWidth, setMaxWidth] = useState<number>(3840); // 1080, 1920, 2560, 3840
  const [pdfLevel, setPdfLevel] = useState<PdfCompressionLevel>('recommended');

  // Results
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string>('');
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [reductionPercent, setReductionPercent] = useState<number>(0);
  const [previewSrc, setPreviewSrc] = useState<string>('');
  const [executionTimeMs, setExecutionTimeMs] = useState<number>(0);

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (resultUrl && resultUrl.startsWith('blob:')) {
        URL.revokeObjectURL(resultUrl);
      }
      if (previewSrc && previewSrc.startsWith('blob:')) {
        URL.revokeObjectURL(previewSrc);
      }
    };
  }, [resultUrl, previewSrc]);

  const handleClear = () => {
    if (resultUrl && resultUrl.startsWith('blob:')) URL.revokeObjectURL(resultUrl);
    if (previewSrc && previewSrc.startsWith('blob:')) URL.revokeObjectURL(previewSrc);
    setFile(null);
    setResultBlob(null);
    setResultUrl('');
    setPreviewSrc('');
    setOriginalSize(0);
    setCompressedSize(0);
    setReductionPercent(0);
    setErrorMessage(null);
  };

  const handlePresetSelect = (preset: 'high' | 'balanced' | 'small') => {
    setQualityPreset(preset);
    if (preset === 'high') {
      setQualityValue(88);
      setColorDepth(256);
      setPdfLevel('lossless');
    } else if (preset === 'balanced') {
      setQualityValue(75);
      setColorDepth(128);
      setPdfLevel('recommended');
    } else {
      setQualityValue(55);
      setColorDepth(64);
      setPdfLevel('extreme');
    }
  };

  const runCompression = async (targetFile: File) => {
    setIsProcessing(true);
    setErrorMessage(null);
    const startT = performance.now();

    try {
      if (isPdf) {
        const res = await compressPdfWithLevel(targetFile, pdfLevel, (_p, msg) => {
          setProgressMsg(msg);
        });

        const url = URL.createObjectURL(res.blob);
        setResultBlob(res.blob);
        setResultUrl(url);
        setOriginalSize(res.originalSize);
        setCompressedSize(res.newSize);
        setReductionPercent(res.reductionPercent);
      } else if (mode === 'jpeg-compressor') {
        const qualityDecimal = qualityValue / 100;
        const res = await compressJpeg(targetFile, qualityDecimal, maxWidth);
        const url = URL.createObjectURL(res.blob);
        setResultBlob(res.blob);
        setResultUrl(url);
        setOriginalSize(res.originalSize);
        setCompressedSize(res.newSize);
        setReductionPercent(res.reductionPercent);
      } else if (mode === 'png-compressor') {
        const res = await compressPng(targetFile, colorDepth, qualityValue / 100);
        const url = URL.createObjectURL(res.blob);
        setResultBlob(res.blob);
        setResultUrl(url);
        setOriginalSize(res.originalSize);
        setCompressedSize(res.newSize);
        setReductionPercent(res.reductionPercent);
      } else {
        // Universal image compressor
        const res = await compressImage(targetFile, {
          quality: qualityValue / 100,
          maxWidth,
          colorDepth
        });
        const url = URL.createObjectURL(res.blob);
        setResultBlob(res.blob);
        setResultUrl(url);
        setOriginalSize(res.originalSize);
        setCompressedSize(res.newSize);
        setReductionPercent(res.reductionPercent);
      }

      setExecutionTimeMs(Math.round(performance.now() - startT));
    } catch (err: any) {
      console.error('Compression error:', err);
      setErrorMessage(err.message || 'Compression failed. Please try a different preset.');
    } finally {
      setIsProcessing(false);
      setProgressMsg('');
    }
  };

  const handleFileDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selected = e.dataTransfer.files[0];
      setFile(selected);
      if (!isPdf && !selected.name.toLowerCase().endsWith('.heic')) {
        setPreviewSrc(URL.createObjectURL(selected));
      }
      await runCompression(selected);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      if (!isPdf && !selected.name.toLowerCase().endsWith('.heic')) {
        setPreviewSrc(URL.createObjectURL(selected));
      }
      await runCompression(selected);
    }
  };

  const handleRecompress = () => {
    if (file) {
      runCompression(file);
    }
  };

  return (
    <div className="flex-1 flex flex-col py-8 sm:py-12 select-none">
      {/* Header Bar */}
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 mb-8 text-center space-y-3">
        <div className="flex items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-white/60 hover:text-white border border-white/10 text-xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Directory</span>
          </Link>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% In-Browser Compression • Zero Uploads</span>
          </div>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          {meta.title}
        </h1>

        <p className="text-xs sm:text-sm text-white/60 max-w-xl mx-auto leading-relaxed">
          {meta.subtitle}
        </p>
      </div>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 flex-1 space-y-6">
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center justify-between">
            <span>{errorMessage}</span>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-white/40 hover:text-white cursor-pointer ml-3"
            >
              ✕
            </button>
          </div>
        )}

        {!file ? (
          /* Dropzone */
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            className="relative rounded-3xl border-2 border-dashed border-white/15 hover:border-amber-400/50 bg-white/[0.02] hover:bg-white/[0.04] p-10 sm:p-14 text-center transition-all duration-200 cursor-pointer flex flex-col items-center justify-center group"
          >
            <input
              type="file"
              accept={meta.accept}
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />

            <div className="w-16 h-16 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 mb-4 transition-opacity group-hover:opacity-90">
              <Minimize2 className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-bold text-white mb-1.5">
              Choose or drag &amp; drop {isPdf ? 'a PDF document' : 'an image'}
            </h3>
            <p className="text-xs text-white/50 mb-4 font-mono">
              Supported: {meta.accept.toUpperCase().replace(/\./g, ' ')}
            </p>

            <span className="btn-primary text-xs px-4 py-2 rounded-lg">
              Select File to Compress
            </span>
          </div>
        ) : (
          /* Workspace with Controls & Stats */
          <div className="space-y-6">
            {/* Control Panel */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-white/[0.08] gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
                    {isPdf ? <FileText className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white truncate max-w-xs sm:max-w-md">
                      {file.name}
                    </h3>
                    <p className="text-[11px] font-mono text-white/50">
                      Original Size: {formatBytes(file.size)}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleClear}
                  className="self-start sm:self-center btn-secondary text-xs px-3 py-1.5 rounded-lg"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Choose Another</span>
                </button>
              </div>

              {/* Compression Level Presets */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-white/90 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-amber-400" />
                    <span>Compression Level</span>
                  </label>

                  <span className="text-xs font-mono text-amber-400">
                    {isPdf
                      ? pdfLevel === 'extreme'
                        ? 'Deep Raster Optimization'
                        : pdfLevel === 'recommended'
                        ? 'Structural Optimization'
                        : 'Lossless Cleanup'
                      : `${qualityValue}% Quality`}
                  </span>
                </div>

                {isPdf ? (
                  /* PDF Presets */
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {[
                      {
                        id: 'recommended' as PdfCompressionLevel,
                        label: 'Recommended',
                        sub: 'Clean redundant streams & font tables'
                      },
                      {
                        id: 'extreme' as PdfCompressionLevel,
                        label: 'Extreme',
                        sub: 'Downsample raster elements to 90 DPI'
                      },
                      {
                        id: 'lossless' as PdfCompressionLevel,
                        label: 'Light',
                        sub: 'Lossless metadata & header stripping'
                      }
                    ].map((lvl) => (
                      <button
                        key={lvl.id}
                        onClick={() => {
                          setPdfLevel(lvl.id);
                        }}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          pdfLevel === lvl.id
                            ? 'bg-amber-400/10 border-amber-400 text-white shadow-sm'
                            : 'bg-white/[0.02] border-white/10 text-white/60 hover:text-white hover:bg-white/[0.04]'
                        }`}
                      >
                        <div className="text-xs font-bold text-white flex items-center justify-between">
                          <span>{lvl.label}</span>
                          {pdfLevel === lvl.id && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                        </div>
                        <p className="text-[10px] text-white/50 mt-1">{lvl.sub}</p>
                      </button>
                    ))}
                  </div>
                ) : (
                  /* Image Presets & Sliders */
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'high' as const, label: 'High Quality', val: '88%' },
                        { id: 'balanced' as const, label: 'Balanced', val: '75%' },
                        { id: 'small' as const, label: 'Small File', val: '55%' }
                      ].map((preset) => (
                        <button
                          key={preset.id}
                          onClick={() => handlePresetSelect(preset.id)}
                          className={`py-2 px-3 rounded-xl border text-center transition-all cursor-pointer ${
                            qualityPreset === preset.id
                              ? 'bg-amber-400/10 border-amber-400 text-white font-bold'
                              : 'bg-white/[0.02] border-white/10 text-white/60 hover:text-white hover:bg-white/[0.04]'
                          }`}
                        >
                          <div className="text-xs font-semibold">{preset.label}</div>
                          <div className="text-[10px] text-white/40 font-mono">{preset.val}</div>
                        </button>
                      ))}
                    </div>

                    {/* Fine-tuning Slider */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between text-xs text-white/50 mb-1.5 font-mono">
                        <span>Smaller File (Low)</span>
                        <span>High Quality</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="95"
                        step="1"
                        value={qualityValue}
                        onChange={(e) => {
                          setQualityValue(parseInt(e.target.value, 10));
                          setQualityPreset('custom');
                        }}
                        className="w-full accent-amber-400 cursor-pointer"
                      />
                    </div>

                    {/* PNG specific palette depth */}
                    {mode === 'png-compressor' && (
                      <div className="pt-2 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-white/70 font-semibold">Palette Quantization:</span>
                          <span className="text-amber-400 font-mono">{colorDepth} colors</span>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          {[32, 64, 128, 256].map((depth) => (
                            <button
                              key={depth}
                              onClick={() => setColorDepth(depth)}
                              className={`py-1.5 rounded-lg border text-xs font-mono transition-all cursor-pointer ${
                                colorDepth === depth
                                  ? 'bg-amber-400 text-black font-bold border-amber-400'
                                  : 'bg-white/[0.02] border-white/10 text-white/60 hover:text-white'
                              }`}
                            >
                              {depth} cols
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Max Resolution selector */}
                    <div className="pt-2 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white/70 font-semibold">Max Resolution:</span>
                        <span className="text-amber-400 font-mono">
                          {maxWidth >= 3840 ? 'Original / 4K' : `${maxWidth}px`}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { label: 'Original', val: 3840 },
                          { label: '1080p', val: 1920 },
                          { label: '720p', val: 1280 }
                        ].map((dim) => (
                          <button
                            key={dim.val}
                            onClick={() => setMaxWidth(dim.val)}
                            className={`py-1.5 rounded-full border text-xs font-mono transition-all duration-150 active:scale-95 cursor-pointer ${
                              maxWidth === dim.val
                                ? 'bg-amber-400 text-black font-bold border-amber-400 shadow-sm'
                                : 'bg-white/[0.02] border-white/10 text-white/60 hover:text-white'
                            }`}
                          >
                            {dim.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleRecompress}
                    disabled={isProcessing}
                    className="btn-secondary text-xs px-4 py-2 rounded-full"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                    <span>Apply &amp; Recompress</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Results Showcase Card */}
            {isProcessing ? (
              <div className="p-12 text-center rounded-3xl border border-white/10 bg-white/[0.02] space-y-3">
                <div className="w-10 h-10 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm font-semibold text-white">Compressing file in browser...</p>
                <p className="text-xs text-white/50 font-mono">{progressMsg || 'Processing streams...'}</p>
              </div>
            ) : resultBlob ? (
              <div className="rounded-[28px] border border-emerald-500/20 bg-emerald-500/[0.03] p-6 sm:p-8 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.14)] space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                      <Percent className="w-3.5 h-3.5" />
                      <span>{reductionPercent}% Size Reduction</span>
                    </div>
                    <h3 className="text-lg font-bold text-white pt-1">
                      Compression Successful
                    </h3>
                  </div>

                  <a
                    href={resultUrl}
                    download={
                      isPdf
                        ? `${file.name.replace(/\.[^/.]+$/, '')}_compressed.pdf`
                        : `${file.name.replace(/\.[^/.]+$/, '')}_compressed.${file.name.split('.').pop() || 'jpg'}`
                    }
                    className="btn-primary text-sm px-6 py-2.5 rounded-full font-semibold"
                  >
                    <Download className="w-4 h-4 text-black" />
                    <span>Download Compressed File</span>
                  </a>
                </div>

                {/* Metric Cards Comparison */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                    <span className="text-[11px] font-mono text-white/50">Original Size</span>
                    <div className="text-base sm:text-lg font-bold text-white font-mono">
                      {formatBytes(originalSize)}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                    <span className="text-[11px] font-mono text-emerald-400">Compressed Size</span>
                    <div className="text-base sm:text-lg font-bold text-emerald-400 font-mono">
                      {formatBytes(compressedSize)}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                    <span className="text-[11px] font-mono text-white/50">Processing Time</span>
                    <div className="text-base sm:text-lg font-bold text-white font-mono">
                      {executionTimeMs} ms
                    </div>
                  </div>
                </div>

                {/* Visual Preview if Image */}
                {!isPdf && resultUrl && (
                  <div className="space-y-3 pt-2">
                    <span className="text-xs font-semibold text-white/70">Compressed Preview</span>
                    <div className="rounded-2xl border border-white/10 bg-black/40 p-4 flex items-center justify-center max-h-[380px] overflow-hidden">
                      <img
                        src={resultUrl}
                        alt="Compressed output"
                        className="max-h-[340px] max-w-full object-contain rounded-lg shadow-2xl"
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}
      </main>
    </div>
  );
};
