import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  resizeImage,
  cropImage,
  transformImage,
  enlargeImage,
  extractColorPalette,
  createGifFromImages,
  type ExtractedColor,
  type ImageCropArea
} from '../utils/imageEditorEngine';
import { formatBytes } from '../utils/fileValidation';
import {
  Crop,
  Scaling,
  RotateCw,
  FlipHorizontal,
  Pipette,
  Film,
  ZoomIn,
  Download,
  RotateCcw,
  ShieldCheck,
  Check,
  Copy,
  ArrowLeft,
  Image as ImageIcon
} from 'lucide-react';

export type ImageEditorTool =
  | 'resize'
  | 'crop'
  | 'rotate'
  | 'flip'
  | 'color-picker'
  | 'enlarger'
  | 'gif-maker';

const TOOL_TITLES: Record<ImageEditorTool, { title: string; subtitle: string }> = {
  resize: {
    title: 'Resize Image',
    subtitle: 'Scale image dimensions by pixels or percentage with aspect ratio locking.'
  },
  crop: {
    title: 'Crop Image',
    subtitle: 'Trim canvas borders with precision aspect ratio presets (1:1, 16:9, 4:3).'
  },
  rotate: {
    title: 'Rotate Image',
    subtitle: 'Rotate graphics permanently by 90°, 180°, 270°, or arbitrary degrees.'
  },
  flip: {
    title: 'Flip Image',
    subtitle: 'Mirror graphics horizontally or flip vertically with zero quality loss.'
  },
  'color-picker': {
    title: 'Color Picker & Palette',
    subtitle: 'Interactive eyedropper and automatic dominant color extraction with HEX, RGB, and HSL copy.'
  },
  enlarger: {
    title: 'Image Enlarger',
    subtitle: 'Upscale resolution 2x or 4x using high-definition bicubic canvas interpolation.'
  },
  'gif-maker': {
    title: 'GIF Maker',
    subtitle: 'Combine multiple image frames into an animated GIF with custom frame delay and looping.'
  }
};

export const ImageEditorPage: React.FC = () => {
  const { toolId: paramToolId } = useParams<{ toolId?: string }>();
  const initialTool: ImageEditorTool = (paramToolId as ImageEditorTool) || 'resize';

  const [activeTool, setActiveTool] = useState<ImageEditorTool>(initialTool);
  const [file, setFile] = useState<File | null>(null);
  const [gifFiles, setGifFiles] = useState<File[]>([]);
  const [originalSrc, setOriginalSrc] = useState<string>('');

  // Result state
  const [resultSrc, setResultSrc] = useState<string>('');
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultDims, setResultDims] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  // Resize settings
  const [targetWidth, setTargetWidth] = useState<number>(800);
  const [targetHeight, setTargetHeight] = useState<number>(600);
  const [lockAspect, setLockAspect] = useState<boolean>(true);
  const [nativeDims, setNativeDims] = useState<{ width: number; height: number }>({ width: 800, height: 600 });

  // Transform settings
  const [rotationAngle, setRotationAngle] = useState<number>(90);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);

  // Enlarge settings
  const [enlargeScale, setEnlargeScale] = useState<number>(2.0);

  // GIF settings
  const [gifDelayMs, setGifDelayMs] = useState<number>(250);

  // Color picker state
  const [palette, setPalette] = useState<ExtractedColor[]>([]);
  const [pickedColor, setPickedColor] = useState<string | null>(null);

  // Clean URLs
  useEffect(() => {
    return () => {
      if (originalSrc && originalSrc.startsWith('blob:')) URL.revokeObjectURL(originalSrc);
      if (resultSrc && resultSrc.startsWith('blob:')) URL.revokeObjectURL(resultSrc);
    };
  }, [originalSrc, resultSrc]);

  // Load image dimensions when file is set
  const handleFileLoaded = (selectedFile: File) => {
    setFile(selectedFile);
    setErrorMessage(null);
    const url = URL.createObjectURL(selectedFile);
    setOriginalSrc(url);

    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;
      setNativeDims({ width: w, height: h });
      setTargetWidth(w);
      setTargetHeight(h);
      setResultDims({ width: w, height: h });
      setResultSrc(url);
    };
    img.src = url;

    // If color picker, extract palette automatically
    extractColorPalette(selectedFile).then((pal) => setPalette(pal));
  };

  const handleWidthChange = (val: number) => {
    setTargetWidth(val);
    if (lockAspect && nativeDims.width > 0) {
      const ratio = nativeDims.height / nativeDims.width;
      setTargetHeight(Math.round(val * ratio));
    }
  };

  const handleHeightChange = (val: number) => {
    setTargetHeight(val);
    if (lockAspect && nativeDims.height > 0) {
      const ratio = nativeDims.width / nativeDims.height;
      setTargetWidth(Math.round(val * ratio));
    }
  };

  const executeResize = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const res = await resizeImage(file, targetWidth, targetHeight);
      const url = URL.createObjectURL(res.blob);
      setResultBlob(res.blob);
      setResultSrc(url);
      setResultDims({ width: res.width, height: res.height });
    } catch (e: any) {
      setErrorMessage(e.message || 'Resize failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const executeCrop = async (aspect: '1:1' | '16:9' | '4:3' | '9:16') => {
    if (!file) return;
    setIsProcessing(true);
    try {
      let cropW = nativeDims.width;
      let cropH = nativeDims.height;

      if (aspect === '1:1') {
        const side = Math.min(cropW, cropH);
        cropW = side;
        cropH = side;
      } else if (aspect === '16:9') {
        cropH = Math.round(cropW * (9 / 16));
        if (cropH > nativeDims.height) {
          cropH = nativeDims.height;
          cropW = Math.round(cropH * (16 / 9));
        }
      } else if (aspect === '4:3') {
        cropH = Math.round(cropW * (3 / 4));
        if (cropH > nativeDims.height) {
          cropH = nativeDims.height;
          cropW = Math.round(cropH * (4 / 3));
        }
      } else if (aspect === '9:16') {
        cropW = Math.round(cropH * (9 / 16));
      }

      const area: ImageCropArea = {
        x: Math.round((nativeDims.width - cropW) / 2),
        y: Math.round((nativeDims.height - cropH) / 2),
        width: cropW,
        height: cropH
      };

      const res = await cropImage(file, area);
      const url = URL.createObjectURL(res.blob);
      setResultBlob(res.blob);
      setResultSrc(url);
      setResultDims({ width: res.width, height: res.height });
    } catch (e: any) {
      setErrorMessage(e.message || 'Crop failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const executeTransform = async (deg: number, fH = flipH, fV = flipV) => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const res = await transformImage(file, deg, fH, fV);
      const url = URL.createObjectURL(res.blob);
      setResultBlob(res.blob);
      setResultSrc(url);
      setResultDims({ width: res.width, height: res.height });
    } catch (e: any) {
      setErrorMessage(e.message || 'Transform failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const executeEnlarge = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const res = await enlargeImage(file, enlargeScale);
      const url = URL.createObjectURL(res.blob);
      setResultBlob(res.blob);
      setResultSrc(url);
      setResultDims({ width: res.width, height: res.height });
    } catch (e: any) {
      setErrorMessage(e.message || 'Enlarge failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const executeGif = async () => {
    if (gifFiles.length === 0) return;
    setIsProcessing(true);
    try {
      const blob = await createGifFromImages(gifFiles, gifDelayMs);
      const url = URL.createObjectURL(blob);
      setResultBlob(blob);
      setResultSrc(url);
    } catch (e: any) {
      setErrorMessage(e.message || 'GIF creation failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedColor(text);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const handleEyedropper = async () => {
    if (typeof window !== 'undefined' && (window as any).EyeDropper) {
      try {
        const eye = new (window as any).EyeDropper();
        const res = await eye.open();
        if (res && res.sRGBHex) {
          setPickedColor(res.sRGBHex);
          copyToClipboard(res.sRGBHex);
        }
      } catch {
        // User canceled eyedropper
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col py-8 sm:py-10 select-none">
      {/* Header Bar */}
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 mb-8 text-center space-y-3">
        <div className="flex items-center justify-center gap-3">
          <Link
            to="/image-converter"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-white/60 hover:text-white border border-white/10 text-xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Image Tools</span>
          </Link>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Client-Side Visual Canvas • Zero Uploads</span>
          </div>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          {TOOL_TITLES[activeTool]?.title || 'Image Editor'}
        </h1>

        <p className="text-xs sm:text-sm text-white/60 max-w-xl mx-auto leading-relaxed">
          {TOOL_TITLES[activeTool]?.subtitle}
        </p>

        {/* Tool Sub-Navigation Pills */}
        <div className="flex items-center justify-center gap-1 p-1 rounded-full bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] max-w-fit mx-auto flex-wrap mt-3 text-xs">
          {[
            { id: 'resize' as const, label: 'Resize', icon: Scaling },
            { id: 'crop' as const, label: 'Crop', icon: Crop },
            { id: 'rotate' as const, label: 'Rotate', icon: RotateCw },
            { id: 'flip' as const, label: 'Flip', icon: FlipHorizontal },
            { id: 'color-picker' as const, label: 'Color Picker', icon: Pipette },
            { id: 'enlarger' as const, label: 'Enlarger', icon: ZoomIn },
            { id: 'gif-maker' as const, label: 'GIF Maker', icon: Film }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTool === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTool(item.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium active:scale-[0.95] transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-b from-amber-300 to-amber-500 text-black font-semibold shadow-[0_2px_10px_rgba(245,158,11,0.3),inset_0_1px_0_rgba(255,255,255,0.4)]'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Workspace */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 flex-1 space-y-6">
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

        {activeTool === 'gif-maker' ? (
          /* Multi-file GIF Maker UI */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-5 bg-white/[0.02] border border-white/10 rounded-3xl p-6 backdrop-blur-xl space-y-5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Film className="w-4 h-4 text-amber-400" />
                <span>GIF Frame Sequence</span>
              </h3>

              <div className="space-y-3">
                <label className="block text-xs font-semibold text-white/70">
                  Upload Sequence Frames (Images)
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files) setGifFiles(Array.from(e.target.files));
                  }}
                  className="w-full text-xs text-white/60 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-400 file:text-black hover:file:bg-amber-300 cursor-pointer"
                />
                <p className="text-[11px] text-white/40 font-mono">
                  {gifFiles.length} frames selected
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-white/70">Frame Delay:</span>
                  <span className="text-amber-400">{gifDelayMs} ms ({Math.round(1000 / gifDelayMs)} fps)</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="1000"
                  step="50"
                  value={gifDelayMs}
                  onChange={(e) => setGifDelayMs(parseInt(e.target.value, 10))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              <button
                onClick={executeGif}
                disabled={gifFiles.length === 0 || isProcessing}
                className="w-full btn-primary py-2.5 rounded-lg text-xs font-semibold"
              >
                {isProcessing ? 'Generating GIF...' : 'Generate Animated GIF'}
              </button>
            </div>

            <div className="lg:col-span-7 bg-white/[0.02] border border-white/10 rounded-3xl p-6 backdrop-blur-xl flex flex-col items-center justify-center min-h-[360px]">
              {resultSrc ? (
                <div className="space-y-4 text-center">
                  <img src={resultSrc} alt="Generated GIF" className="max-h-[300px] rounded-2xl mx-auto shadow-2xl" />
                  <a
                    href={resultSrc}
                    download="animated.gif"
                    className="btn-primary text-xs px-5 py-2.5 rounded-lg font-semibold inline-flex items-center gap-2"
                  >
                    <Download className="w-4 h-4 text-black" />
                    <span>Download GIF ({resultBlob ? formatBytes(resultBlob.size) : ''})</span>
                  </a>
                </div>
              ) : (
                <div className="text-center text-white/40 space-y-2">
                  <Film className="w-10 h-10 mx-auto text-white/20" />
                  <p className="text-xs">Upload frames and click generate to preview your GIF</p>
                </div>
              )}
            </div>
          </div>
        ) : !file ? (
          /* Dropzone for single image tools */
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files[0]) handleFileLoaded(e.dataTransfer.files[0]);
            }}
            className="rounded-3xl border-2 border-dashed border-white/15 hover:border-amber-400/50 bg-white/[0.02] p-12 text-center transition-all cursor-pointer flex flex-col items-center justify-center relative group"
          >
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) handleFileLoaded(e.target.files[0]);
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 mb-3 transition-opacity group-hover:opacity-90">
              <ImageIcon className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Choose or drop an image to edit</h3>
            <p className="text-xs text-white/50 mb-4 font-mono">PNG, JPG, WEBP, HEIC, JFIF, SVG</p>
            <span className="btn-primary text-xs px-4 py-2 rounded-lg font-semibold">
              Select Image
            </span>
          </div>
        ) : (
          /* Active Editor Canvas & Controls */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Controls Drawer */}
            <div className="lg:col-span-5 bg-white/[0.02] border border-white/10 rounded-3xl p-6 backdrop-blur-xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                <div>
                  <h3 className="text-sm font-bold text-white truncate max-w-[200px]">{file.name}</h3>
                  <p className="text-[11px] font-mono text-white/50">
                    {nativeDims.width} × {nativeDims.height} px • {formatBytes(file.size)}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setFile(null);
                    setResultSrc('');
                  }}
                  className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white cursor-pointer"
                  title="Change image"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Tool Specific Drawer Content */}
              {activeTool === 'resize' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono text-white/60">Width (px)</label>
                      <input
                        type="number"
                        value={targetWidth}
                        onChange={(e) => handleWidthChange(parseInt(e.target.value, 10) || 0)}
                        className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs font-mono focus:border-amber-400 outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono text-white/60">Height (px)</label>
                      <input
                        type="number"
                        value={targetHeight}
                        onChange={(e) => handleHeightChange(parseInt(e.target.value, 10) || 0)}
                        className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs font-mono focus:border-amber-400 outline-none"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-xs text-white/70 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={lockAspect}
                      onChange={(e) => setLockAspect(e.target.checked)}
                      className="accent-amber-400"
                    />
                    <span>Lock Aspect Ratio</span>
                  </label>

                  <div className="grid grid-cols-4 gap-1.5 pt-2">
                    {[0.25, 0.5, 0.75, 2.0].map((pct) => (
                      <button
                        key={pct}
                        onClick={() => {
                          handleWidthChange(Math.round(nativeDims.width * pct));
                        }}
                        className="py-1.5 rounded-lg border border-white/10 bg-white/[0.02] hover:bg-white/[0.08] text-[11px] font-mono text-white/80 cursor-pointer"
                      >
                        {pct * 100}%
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={executeResize}
                    disabled={isProcessing}
                    className="w-full btn-primary py-2.5 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Apply Resize
                  </button>
                </div>
              )}

              {activeTool === 'crop' && (
                <div className="space-y-4">
                  <span className="text-xs font-semibold text-white/70">Preset Aspect Ratios</span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: '1:1' as const, label: '1:1 Square (Instagram)' },
                      { id: '16:9' as const, label: '16:9 Landscape (YouTube)' },
                      { id: '4:3' as const, label: '4:3 Standard Photo' },
                      { id: '9:16' as const, label: '9:16 Story / Reel' }
                    ].map((asp) => (
                      <button
                        key={asp.id}
                        onClick={() => executeCrop(asp.id)}
                        className="p-2.5 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-amber-400/10 hover:border-amber-400 text-left text-xs text-white/80 transition-all cursor-pointer"
                      >
                        <div className="font-bold text-white">{asp.id}</div>
                        <div className="text-[10px] text-white/50">{asp.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeTool === 'rotate' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    {[90, 180, 270].map((deg) => (
                      <button
                        key={deg}
                        onClick={() => {
                          setRotationAngle(deg);
                          executeTransform(deg);
                        }}
                        className="py-2.5 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-amber-400/10 hover:border-amber-400 text-xs font-bold text-white transition-all cursor-pointer"
                      >
                        +{deg}°
                      </button>
                    ))}
                  </div>
                  <div className="space-y-1.5 pt-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-white/60">Arbitrary Angle:</span>
                      <span className="text-amber-400">{rotationAngle}°</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={rotationAngle}
                      onChange={(e) => {
                        const deg = parseInt(e.target.value, 10);
                        setRotationAngle(deg);
                        executeTransform(deg);
                      }}
                      className="w-full accent-amber-400 cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {activeTool === 'flip' && (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      const next = !flipH;
                      setFlipH(next);
                      executeTransform(0, next, flipV);
                    }}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      flipH ? 'bg-amber-400/20 border-amber-400 text-white font-bold' : 'border-white/10 text-white/70'
                    }`}
                  >
                    <FlipHorizontal className="w-5 h-5 mx-auto mb-1 text-amber-400" />
                    <span className="text-xs">Flip Horizontal</span>
                  </button>

                  <button
                    onClick={() => {
                      const next = !flipV;
                      setFlipV(next);
                      executeTransform(0, flipH, next);
                    }}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      flipV ? 'bg-amber-400/20 border-amber-400 text-white font-bold' : 'border-white/10 text-white/70'
                    }`}
                  >
                    <div className="rotate-90">
                      <FlipHorizontal className="w-5 h-5 mx-auto mb-1 text-amber-400" />
                    </div>
                    <span className="text-xs">Flip Vertical</span>
                  </button>
                </div>
              )}

              {activeTool === 'enlarger' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {[2.0, 4.0].map((scale) => (
                      <button
                        key={scale}
                        onClick={() => setEnlargeScale(scale)}
                        className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                          enlargeScale === scale
                            ? 'bg-amber-400/10 border-amber-400 text-white font-bold'
                            : 'border-white/10 text-white/60'
                        }`}
                      >
                        <div className="text-sm font-bold text-white">{scale}x Upscale</div>
                        <div className="text-[10px] text-white/50 font-mono">
                          {Math.round(nativeDims.width * scale)} × {Math.round(nativeDims.height * scale)}
                        </div>
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={executeEnlarge}
                    disabled={isProcessing}
                    className="w-full btn-primary py-2.5 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    {isProcessing ? 'Upscaling...' : 'Enlarge Canvas'}
                  </button>
                </div>
              )}

              {activeTool === 'color-picker' && (
                <div className="space-y-4">
                  {typeof window !== 'undefined' && (window as any).EyeDropper && (
                    <button
                      onClick={handleEyedropper}
                      className="w-full btn-primary flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      <Pipette className="w-4 h-4" />
                      <span>Pick Color From Screen</span>
                    </button>
                  )}

                  {pickedColor && (
                    <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-lg border border-white/20" style={{ backgroundColor: pickedColor }} />
                        <span className="text-xs font-mono font-bold text-white">{pickedColor}</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(pickedColor)}
                        className="text-xs text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {copiedColor === pickedColor ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Copy</span>
                      </button>
                    </div>
                  )}

                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-white/70">Extracted Dominant Palette</span>
                    <div className="grid grid-cols-4 gap-2">
                      {palette.map((c) => (
                        <button
                          key={c.hex}
                          onClick={() => copyToClipboard(c.hex)}
                          className="group relative p-2 rounded-xl bg-white/[0.02] border border-white/10 hover:border-amber-400 transition-all text-center cursor-pointer"
                          title="Click to copy HEX"
                        >
                          <div className="w-full h-8 rounded-lg mb-1.5 border border-white/10" style={{ backgroundColor: c.hex }} />
                          <span className="text-[10px] font-mono text-white/70 group-hover:text-amber-400 truncate block">
                            {c.hex}
                          </span>
                        </button>
                      ))}
                    </div>
                    {copiedColor && (
                      <p className="text-[11px] text-emerald-400 font-mono text-center">
                        Copied {copiedColor} to clipboard!
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Canvas Preview Area */}
            <div className="lg:col-span-7 bg-white/[0.02] border border-white/10 rounded-3xl p-6 backdrop-blur-xl flex flex-col items-center justify-between min-h-[460px] space-y-4">
              <div className="w-full flex items-center justify-between text-xs text-white/50 font-mono pb-2 border-b border-white/[0.06]">
                <span>Output Resolution: {resultDims.width || nativeDims.width} × {resultDims.height || nativeDims.height} px</span>
                <span>In-Browser Output</span>
              </div>

              <div className="flex-1 w-full flex items-center justify-center p-2 rounded-2xl bg-black/40 border border-white/5 overflow-hidden">
                <img
                  src={resultSrc || originalSrc}
                  alt="Editor canvas preview"
                  className="max-h-[380px] max-w-full object-contain rounded-lg shadow-2xl transition-all"
                />
              </div>

              {/* Download Bar */}
              <div className="w-full flex items-center justify-between pt-2">
                <span className="text-xs text-white/50 font-mono">
                  {resultBlob ? formatBytes(resultBlob.size) : formatBytes(file.size)}
                </span>

                <a
                  href={resultSrc || originalSrc}
                  download={`edited_${file.name}`}
                  className="btn-primary text-xs px-5 py-2.5 rounded-full font-semibold inline-flex items-center gap-2"
                >
                  <Download className="w-4 h-4 text-black" />
                  <span>Download Image</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
