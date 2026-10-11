import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DropZone } from '../components/DropZone';
import { PngToSvgSettings } from '../components/PngToSvgSettings';
import { SvgToPngSettings } from '../components/SvgToPngSettings';
import { PreviewWorkspace } from '../components/PreviewWorkspace';
import { ImageToolsMenu } from '../modules/image/ImageToolsMenu';
import { useAuth } from '../context/AuthContext';
import { useVault } from '../context/VaultContext';
import { vectorizePng } from '../utils/pngToSvg';
import type { PngToSvgOptions, VectorizationResult } from '../utils/pngToSvg';
import { convertSvgToPng, parseSvgDimensions } from '../utils/svgToPng';
import type { SvgToPngOptions, SvgDimensions } from '../utils/svgToPng';
import {
  convertHeicToJpg,
  convertHeicToPng,
  convertWebpOrJfifToPng,
  convertWebpOrPngToJpg,
  convertUniversalImage
} from '../utils/imageEngine';
import {
  ArrowLeft,
  ShieldCheck,
  Download,
  RotateCcw
} from 'lucide-react';

interface ImageWorkspacePageProps {
  onOpenAuth: () => void;
}

const MODE_METADATA: Record<string, { title: string; subtitle: string; outputExt: string }> = {
  'png-to-svg': {
    title: 'PNG to SVG (Vectorize)',
    subtitle: 'Genuine vectorization of raster bitmaps into scalable multi-color SVG vector paths.',
    outputExt: 'svg'
  },
  'svg-to-png': {
    title: 'SVG to PNG (Rasterize)',
    subtitle: 'Render scalable SVG vectors into high-resolution, transparent raster PNGs.',
    outputExt: 'png'
  },
  'webp-to-png': {
    title: 'WEBP to PNG',
    subtitle: 'Convert modern WebP images into lossless PNG format with transparency support.',
    outputExt: 'png'
  },
  'jfif-to-png': {
    title: 'JFIF to PNG',
    subtitle: 'Convert digital camera and web JFIF files into standard lossless PNG format.',
    outputExt: 'png'
  },
  'heic-to-jpg': {
    title: 'HEIC to JPG',
    subtitle: 'Convert Apple iPhone HEIC/HEIF camera photos into universally viewable JPG files.',
    outputExt: 'jpg'
  },
  'heic-to-png': {
    title: 'HEIC to PNG',
    subtitle: 'Convert Apple iPhone HEIC/HEIF camera photos into transparent, uncompressed PNG files.',
    outputExt: 'png'
  },
  'webp-to-jpg': {
    title: 'WEBP to JPG',
    subtitle: 'Convert WebP web graphics into standard JPG images compatible with any software.',
    outputExt: 'jpg'
  },
  'svg-converter': {
    title: 'SVG Converter',
    subtitle: 'Render and export vector SVG graphics into crisp PNG, JPG, or WEBP at custom scale.',
    outputExt: 'png'
  },
  'image-converter': {
    title: 'Universal Image Converter',
    subtitle: 'Convert between JPG, PNG, WEBP, JFIF, HEIC, GIF, and BMP 100% in your browser.',
    outputExt: 'png'
  }
};

export const ImageWorkspacePage: React.FC<ImageWorkspacePageProps> = ({ onOpenAuth }) => {
  const { mode: paramMode } = useParams<{ mode?: string }>();

  // If no mode specified, render the full Image Tools Menu
  if (!paramMode) {
    return (
      <div className="flex-1 flex flex-col">
        <ImageToolsMenu />
      </div>
    );
  }

  return <ImageWorkspaceContent mode={paramMode} onOpenAuth={onOpenAuth} />;
};

interface ImageWorkspaceContentProps {
  mode: string;
  onOpenAuth: () => void;
}

const ImageWorkspaceContent: React.FC<ImageWorkspaceContentProps> = ({ mode, onOpenAuth }) => {
  const { user } = useAuth();
  const { saveToVault } = useVault();
  const meta = MODE_METADATA[mode] || {
    title: 'Image Converter',
    subtitle: 'Fast, client-side image conversion with zero server uploads.',
    outputExt: 'png'
  };

  const [file, setFile] = useState<File | null>(null);
  const [originalSrc, setOriginalSrc] = useState<string>('');

  // Conversion Output States
  const [convertedSrc, setConvertedSrc] = useState<string>('');
  const [convertedSvgString, setConvertedSvgString] = useState<string>('');
  const [convertedBlob, setConvertedBlob] = useState<Blob | null>(null);
  const [convertedSizeBytes, setConvertedSizeBytes] = useState<number>(0);
  const [outputWidth, setOutputWidth] = useState<number>(0);
  const [outputHeight, setOutputHeight] = useState<number>(0);
  const [pathCount, setPathCount] = useState<number | undefined>(undefined);
  const [executionTimeMs, setExecutionTimeMs] = useState<number | undefined>(undefined);

  // Status & Error
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [, setIsSavedToVault] = useState<boolean>(false);

  // Universal target format selector (used for 'image-converter' mode)
  const [targetFormat, setTargetFormat] = useState<'png' | 'jpeg' | 'webp'>('png');

  // Settings for PNG -> SVG
  const [pngOptions, setPngOptions] = useState<PngToSvgOptions>({
    preset: 'default',
    numberOfColors: 16,
    lineThreshold: 1,
    splineThreshold: 1,
    pathOmit: 8,
    blurRadius: 0,
    strokeWidth: 1,
    rightAngleEnhance: true,
    removeBackground: false
  });

  // Settings for SVG -> PNG
  const [, setSvgNativeDim] = useState<SvgDimensions>({
    width: 800,
    height: 800,
    aspectRatio: 1
  });
  const [svgOptions, setSvgOptions] = useState<SvgToPngOptions>({
    width: 800,
    height: 800,
    backgroundColor: 'transparent'
  });

  const workspaceRef = useRef<HTMLDivElement>(null);

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (originalSrc && originalSrc.startsWith('blob:')) {
        URL.revokeObjectURL(originalSrc);
      }
      if (convertedSrc && convertedSrc.startsWith('blob:')) {
        URL.revokeObjectURL(convertedSrc);
      }
    };
  }, [originalSrc, convertedSrc]);

  // Clear File & Results
  const handleClear = () => {
    setFile(null);
    setOriginalSrc('');
    setConvertedSrc('');
    setConvertedSvgString('');
    setConvertedBlob(null);
    setConvertedSizeBytes(0);
    setPathCount(undefined);
    setExecutionTimeMs(undefined);
    setErrorMessage(null);
    setIsSavedToVault(false);
  };

  // Execution: PNG -> SVG Vectorization
  const runVectorization = async (targetFile: File, options: PngToSvgOptions) => {
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const result: VectorizationResult = await vectorizePng(targetFile, options);
      if (convertedSrc && convertedSrc.startsWith('blob:')) {
        URL.revokeObjectURL(convertedSrc);
      }

      const blobUrl = URL.createObjectURL(result.blob);
      setConvertedSrc(blobUrl);
      setConvertedSvgString(result.svgString);
      setConvertedBlob(result.blob);
      setConvertedSizeBytes(result.sizeBytes);
      setOutputWidth(result.width);
      setOutputHeight(result.height);
      setPathCount(result.pathCount);
      setExecutionTimeMs(result.executionTimeMs);
    } catch (err: any) {
      setErrorMessage(err.message || 'Vectorization failed. Please try different settings.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Execution: SVG -> Raster
  const runRasterization = async (targetFile: File, options: SvgToPngOptions) => {
    setIsProcessing(true);
    setErrorMessage(null);
    const startT = performance.now();
    try {
      const svgText = await targetFile.text();
      setConvertedSvgString(svgText);
      const result = await convertSvgToPng(svgText, options);
      if (convertedSrc && convertedSrc.startsWith('blob:')) {
        URL.revokeObjectURL(convertedSrc);
      }

      const durationMs = Math.round(performance.now() - startT);
      setConvertedSrc(result.dataUrl);
      setConvertedBlob(result.blob);
      setConvertedSizeBytes(result.sizeBytes);
      setOutputWidth(options.width);
      setOutputHeight(options.height);
      setExecutionTimeMs(durationMs);
      setPathCount(undefined);
    } catch (err: any) {
      setErrorMessage(err.message || 'Rasterization failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Execution: Modern & Universal Image Conversions (HEIC, WEBP, JFIF, etc.)
  const runGenericConversion = async (targetFile: File) => {
    setIsProcessing(true);
    setErrorMessage(null);
    const startT = performance.now();

    try {
      let resultBlob: Blob;

      switch (mode) {
        case 'heic-to-jpg':
          resultBlob = await convertHeicToJpg(targetFile);
          break;
        case 'heic-to-png':
          resultBlob = await convertHeicToPng(targetFile);
          break;
        case 'webp-to-png':
        case 'jfif-to-png':
          resultBlob = await convertWebpOrJfifToPng(targetFile);
          break;
        case 'webp-to-jpg':
          resultBlob = await convertWebpOrPngToJpg(targetFile);
          break;
        case 'image-converter':
          resultBlob = await convertUniversalImage(targetFile, targetFormat);
          break;
        default:
          resultBlob = await convertUniversalImage(targetFile, 'png');
          break;
      }

      const durationMs = Math.round(performance.now() - startT);
      const blobUrl = URL.createObjectURL(resultBlob);

      setConvertedBlob(resultBlob);
      setConvertedSrc(blobUrl);
      setConvertedSizeBytes(resultBlob.size);
      setExecutionTimeMs(durationMs);
    } catch (err: any) {
      console.error('Image conversion error:', err);
      setErrorMessage(err.message || 'Conversion failed. Please verify the uploaded image.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Dropzone File Selected
  const handleFileSelected = async (newFile: File) => {
    handleClear();
    setFile(newFile);

    const isHeic = newFile.name.toLowerCase().endsWith('.heic') || newFile.name.toLowerCase().endsWith('.heif');
    if (!isHeic) {
      const blobUrl = URL.createObjectURL(newFile);
      setOriginalSrc(blobUrl);
    }

    if (mode === 'png-to-svg') {
      await runVectorization(newFile, pngOptions);
    } else if (mode === 'svg-to-png' || mode === 'svg-converter') {
      try {
        const svgText = await newFile.text();
        setConvertedSvgString(svgText);
        const dims = parseSvgDimensions(svgText);
        setSvgNativeDim(dims);
        const initialOpts: SvgToPngOptions = {
          width: dims.width,
          height: dims.height,
          backgroundColor: 'transparent'
        };
        setSvgOptions(initialOpts);
        await runRasterization(newFile, initialOpts);
      } catch {
        await runRasterization(newFile, svgOptions);
      }
    } else {
      await runGenericConversion(newFile);
    }
  };

  const handlePngSettingsChange = (newOpts: PngToSvgOptions) => {
    setPngOptions(newOpts);
    if (file && mode === 'png-to-svg') {
      runVectorization(file, newOpts);
    }
  };

  const handleSvgSettingsChange = (newOpts: SvgToPngOptions) => {
    setSvgOptions(newOpts);
    if (file && (mode === 'svg-to-png' || mode === 'svg-converter')) {
      runRasterization(file, newOpts);
    }
  };

  const handleSaveToVault = async () => {
    if (!file) return;
    if (!user) {
      onOpenAuth();
      return;
    }

    const res = await saveToVault({
      mode: mode as any,
      fileName: file.name,
      fileSizeBytes: file.size,
      outputSizeBytes: convertedSizeBytes,
      width: outputWidth,
      height: outputHeight,
      pathCount,
      executionTimeMs,
      previewSvgSnippet: convertedSvgString ? convertedSvgString.substring(0, 1500) : undefined
    });

    if (res.success) {
      setIsSavedToVault(true);
      setTimeout(() => setIsSavedToVault(false), 3000);
    }
  };

  const isVectorMode = mode === 'png-to-svg';
  const isSvgMode = mode === 'svg-to-png' || mode === 'svg-converter';

  return (
    <div className="flex-1 flex flex-col py-6 select-none">
      {/* Top Header & Back Button */}
      <div className="max-w-4xl mx-auto px-4 text-center mb-6">
        {/* Back Link to All Image Tools Menu */}
        <div className="mb-3">
          <Link
            to="/image-converter"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white/70 hover:text-white text-xs font-mono transition-all group cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-amber-400 group-hover:-translate-x-1 transition-transform" />
            <span>All Image Tools Menu</span>
          </Link>
        </div>

        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="px-3 py-1 rounded-full text-xs font-mono font-medium bg-amber-400/10 border border-amber-400/20 text-amber-400">
            Image Studio
          </span>
          <div className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full border border-emerald-400/20 font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% In-Browser</span>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
          {meta.title}
        </h1>
        <p className="text-xs sm:text-sm text-white/60 max-w-xl mx-auto mb-6">
          {meta.subtitle}
        </p>

        {/* Format Selector if Universal Image Converter */}
        {mode === 'image-converter' && (
          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-[#0c0d10] border border-white/[0.08] text-xs font-mono mb-4">
            <span className="text-white/50 pl-2 pr-1 text-[11px]">Format:</span>
            {(['png', 'jpeg', 'webp'] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => {
                  setTargetFormat(fmt);
                  if (file) runGenericConversion(file);
                }}
                className={`px-3 py-1 rounded-lg uppercase font-semibold transition-all duration-100 cursor-pointer select-none ${
                  targetFormat === fmt
                    ? 'bg-amber-400 text-black shadow-sm'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {fmt === 'jpeg' ? 'JPG' : fmt}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Workspace Area */}
      <main ref={workspaceRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1">
        {errorMessage && (
          <div className="max-w-2xl mx-auto mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center justify-between">
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
          <div className="max-w-2xl mx-auto pt-2">
            <DropZone
              mode={mode}
              onFileSelected={handleFileSelected}
              isLoading={isProcessing}
            />
          </div>
        ) : (
          <div className="space-y-6">
            {/* If Vector / SVG mode, show interactive settings drawer */}
            {isVectorMode ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-4 bg-white/[0.02] border border-white/10 rounded-3xl p-5 backdrop-blur-xl">
                  <PngToSvgSettings
                    options={pngOptions}
                    onChange={handlePngSettingsChange}
                    onVectorize={() => file && runVectorization(file, pngOptions)}
                    isProcessing={isProcessing}
                  />
                </div>
                <div className="lg:col-span-8">
                  <PreviewWorkspace
                    mode={mode === 'png-to-svg' ? 'png-to-svg' : 'svg-to-png'}
                    originalFileName={file?.name || 'original'}
                    originalFileSize={file?.size || 0}
                    originalSrc={originalSrc}
                    convertedSrc={convertedSrc}
                    convertedSvgString={convertedSvgString}
                    convertedBlob={convertedBlob || undefined}
                    convertedSizeBytes={convertedSizeBytes}
                    width={outputWidth || 800}
                    height={outputHeight || 800}
                    pathCount={pathCount}
                    executionTimeMs={executionTimeMs}
                    isProcessing={isProcessing}
                    onClear={handleClear}
                    onSaveVault={handleSaveToVault}
                    isSavedToVault={false}
                  />
                </div>
              </div>
            ) : isSvgMode ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-4 bg-white/[0.02] border border-white/10 rounded-3xl p-5 backdrop-blur-xl">
                  <SvgToPngSettings
                    options={svgOptions}
                    nativeDimensions={{ width: 800, height: 800, aspectRatio: 1 }}
                    onChange={handleSvgSettingsChange}
                    onRender={() => file && runRasterization(file, svgOptions)}
                    isProcessing={isProcessing}
                  />
                </div>
                <div className="lg:col-span-8">
                  <PreviewWorkspace
                    mode="svg-to-png"
                    originalFileName={file?.name || 'original.svg'}
                    originalFileSize={file?.size || 0}
                    originalSrc={originalSrc}
                    convertedSrc={convertedSrc}
                    convertedSvgString={convertedSvgString}
                    convertedBlob={convertedBlob || undefined}
                    convertedSizeBytes={convertedSizeBytes}
                    width={outputWidth || svgOptions.width}
                    height={outputHeight || svgOptions.height}
                    pathCount={pathCount}
                    executionTimeMs={executionTimeMs}
                    isProcessing={isProcessing}
                    onClear={handleClear}
                    onSaveVault={handleSaveToVault}
                    isSavedToVault={false}
                  />
                </div>
              </div>
            ) : (
              /* High-Res Modern Image Conversion View (HEIC, WEBP, JFIF) */
              <div className="max-w-4xl mx-auto space-y-6">
                <div className="p-6 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-2xl space-y-5">
                  <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
                    <div>
                      <h3 className="text-base font-bold text-white">{file.name}</h3>
                      <p className="text-xs text-white/50 font-mono">
                        {(file.size / 1024).toFixed(1)} KB → Output: {meta.outputExt.toUpperCase()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleClear}
                        className="btn-secondary text-xs px-3 py-1.5 rounded-lg"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Change File</span>
                      </button>
                    </div>
                  </div>

                  {/* Image Preview & Output */}
                  {convertedSrc && (
                    <div className="space-y-4">
                      <div className="rounded-2xl border border-white/10 bg-black/40 p-4 flex items-center justify-center min-h-[300px] overflow-hidden">
                        <img
                          src={convertedSrc}
                          alt="Converted output"
                          className="max-h-[450px] max-w-full object-contain rounded-lg shadow-2xl"
                        />
                      </div>

                      {/* Download Strip */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                        <div className="text-xs font-mono text-emerald-400 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Converted in {executionTimeMs || 120}ms • {(convertedSizeBytes / 1024).toFixed(1)} KB</span>
                        </div>

                        {convertedBlob && (
                          <a
                            href={convertedSrc}
                            download={`${file.name.replace(/\.[^/.]+$/, '')}.${meta.outputExt}`}
                            className="btn-primary text-xs px-5 py-2.5 rounded-lg"
                          >
                            <Download className="w-4 h-4 text-black" />
                            <span>Download {meta.outputExt.toUpperCase()}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
