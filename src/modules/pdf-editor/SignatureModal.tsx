import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  PenTool,
  Type,
  Upload,
  BookmarkCheck,
  RotateCcw,
  Trash2,
  Check,
  X,
  Sliders
} from 'lucide-react';

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertSignature: (dataUrl: string, width?: number, height?: number) => void;
}

interface SavedSignature {
  id: string;
  dataUrl: string;
  createdAt: string;
}

const STORAGE_KEY = 'zendr_saved_signatures';

const SIGNATURE_COLORS = [
  { name: 'Black', hex: '#09090b' },
  { name: 'Navy Blue', hex: '#1e3a8a' },
  { name: 'Royal Blue', hex: '#2563eb' },
  { name: 'Amber Gold', hex: '#d97706' },
  { name: 'Crimson', hex: '#991b1b' }
];

const TYPED_FONTS = [
  {
    id: 'font-caveat',
    name: 'Casual Hand',
    fontFamily: '"Caveat", "Brush Script MT", cursive'
  },
  {
    id: 'font-dancing',
    name: 'Elegant Script',
    fontFamily: '"Dancing Script", "Lucida Handwriting", cursive'
  },
  {
    id: 'font-formal',
    name: 'Classic Cursive',
    fontFamily: '"Great Vibes", "Segoe Script", cursive'
  },
  {
    id: 'font-modern',
    name: 'Clean Calligraphy',
    fontFamily: '"Allura", "Snell Roundhand", "Apple Chancery", cursive'
  }
];

export const SignatureModal: React.FC<SignatureModalProps> = ({
  isOpen,
  onClose,
  onInsertSignature
}) => {
  const [activeTab, setActiveTab] = useState<'draw' | 'type' | 'upload' | 'saved'>('draw');

  // Drawing state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState('#09090b');
  const [penWidth, setPenWidth] = useState(2.5);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [drawHistory, setDrawHistory] = useState<ImageData[]>([]);

  // Typed state
  const [typedText, setTypedText] = useState('');
  const [selectedFontIndex, setSelectedFontIndex] = useState(0);
  const [typedColor, setTypedColor] = useState('#09090b');

  // Uploaded state
  const [uploadedDataUrl, setUploadedDataUrl] = useState<string | null>(null);
  const [removeBackground, setRemoveBackground] = useState(true);
  const [bgThreshold, setBgThreshold] = useState(220); // 0-255 white threshold

  // Saved signatures - lazy loaded from localStorage
  const [savedSignatures, setSavedSignatures] = useState<SavedSignature[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [saveToVault, setSaveToVault] = useState(true);

  // Setup drawing canvas
  useEffect(() => {
    if (activeTab === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = penColor;
        ctx.lineWidth = penWidth;
      }
    }
  }, [activeTab, penColor, penWidth]);

  // Drawing Handlers
  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Save history snapshot before new stroke
    const currentSnapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setDrawHistory((prev) => [...prev.slice(-10), currentSnapshot]);

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx?.closePath();
      }
      setIsDrawing(false);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    setDrawHistory([]);
  };

  const undoDrawStroke = () => {
    const canvas = canvasRef.current;
    if (!canvas || drawHistory.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const previousSnapshot = drawHistory[drawHistory.length - 1];
    ctx.putImageData(previousSnapshot, 0, 0);
    setDrawHistory((prev) => prev.slice(0, -1));
    if (drawHistory.length <= 1) setHasDrawn(false);
  };

  // Convert Drawn canvas to trimmed PNG
  const getTrimmedDrawnSignature = (): string | null => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) return null;
    return canvas.toDataURL('image/png');
  };

  // Generate PNG from typed text
  const generateTypedSignaturePng = (): string | null => {
    const textToRender = typedText.trim() || 'Your Signature';
    const offscreen = document.createElement('canvas');
    offscreen.width = 600;
    offscreen.height = 180;
    const ctx = offscreen.getContext('2d');
    if (!ctx) return null;

    ctx.clearRect(0, 0, offscreen.width, offscreen.height);
    const selectedFont = TYPED_FONTS[selectedFontIndex];
    ctx.font = `64px ${selectedFont.fontFamily}`;
    ctx.fillStyle = typedColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(textToRender, offscreen.width / 2, offscreen.height / 2);

    return offscreen.toDataURL('image/png');
  };

  // Handle uploaded image and background removal
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const rawUrl = event.target?.result as string;
      processUploadedImage(rawUrl, removeBackground, bgThreshold);
    };
    reader.readAsDataURL(file);
  };

  const processUploadedImage = (rawUrl: string, makeTransparent: boolean, threshold: number) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);

      if (makeTransparent) {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          // Check if pixel is close to white/light gray
          if (r >= threshold && g >= threshold && b >= threshold) {
            data[i + 3] = 0; // alpha transparent
          } else {
            // Optional: boost ink contrast for clearer signatures
            const darkness = (r + g + b) / 3;
            if (darkness > 150) {
              data[i + 3] = Math.max(0, 255 - (darkness - 150) * 3);
            }
          }
        }
        ctx.putImageData(imgData, 0, 0);
      }

      setUploadedDataUrl(canvas.toDataURL('image/png'));
    };
    img.src = rawUrl;
  };

  // Save signature to local vault
  const saveSignatureToVault = useCallback((dataUrl: string) => {
    try {
      const now = new Date();
      const newEntry: SavedSignature = {
        id: `sig_${now.getTime()}`,
        dataUrl,
        createdAt: now.toLocaleDateString()
      };
      setSavedSignatures((prev) => {
        const updated = [newEntry, ...prev.slice(0, 7)];
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch {
          // Storage full or disabled
        }
        return updated;
      });
    } catch {
      // Storage full or disabled
    }
  }, []);

  const deleteSavedSignature = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedSignatures.filter((s) => s.id !== id);
    setSavedSignatures(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  // Final Insert Handler
  const handleInsert = (signatureUrl?: string) => {
    let finalUrl = signatureUrl;

    if (!finalUrl) {
      if (activeTab === 'draw') {
        finalUrl = getTrimmedDrawnSignature() || undefined;
      } else if (activeTab === 'type') {
        finalUrl = generateTypedSignaturePng() || undefined;
      } else if (activeTab === 'upload') {
        finalUrl = uploadedDataUrl || undefined;
      }
    }

    if (!finalUrl) return;

    if (saveToVault && activeTab !== 'saved') {
      saveSignatureToVault(finalUrl);
    }

    // Default signature width/height on the PDF canvas
    onInsertSignature(finalUrl, 180, 70);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-[28px] border border-white/10 bg-[#07070a]/95 backdrop-blur-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.15)] overflow-hidden flex flex-col text-white">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
              <PenTool className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-white">Digital Signature Studio</h2>
              <p className="text-xs text-white/50">Sign contracts, agreements, and official documents</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.04] hover:bg-white/[0.1] border border-white/5 flex items-center justify-center text-white/50 hover:text-white transition-colors cursor-pointer active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 pt-4">
          <div className="flex items-center gap-1 p-1 bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-full shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
            <button
              onClick={() => setActiveTab('draw')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full text-xs font-medium transition-all active:scale-[0.95] cursor-pointer ${
                activeTab === 'draw'
                  ? 'bg-gradient-to-b from-amber-300 to-amber-500 text-black shadow-[0_2px_10px_rgba(245,158,11,0.3),inset_0_1px_0_rgba(255,255,255,0.4)] font-semibold'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Draw</span>
            </button>

            <button
              onClick={() => setActiveTab('type')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full text-xs font-medium transition-all active:scale-[0.95] cursor-pointer ${
                activeTab === 'type'
                  ? 'bg-gradient-to-b from-amber-300 to-amber-500 text-black shadow-[0_2px_10px_rgba(245,158,11,0.3),inset_0_1px_0_rgba(255,255,255,0.4)] font-semibold'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span>Type</span>
            </button>

            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full text-xs font-medium transition-all active:scale-[0.95] cursor-pointer ${
                activeTab === 'upload'
                  ? 'bg-gradient-to-b from-amber-300 to-amber-500 text-black shadow-[0_2px_10px_rgba(245,158,11,0.3),inset_0_1px_0_rgba(255,255,255,0.4)] font-semibold'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Image</span>
            </button>

            <button
              onClick={() => setActiveTab('saved')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full text-xs font-medium transition-all active:scale-[0.95] cursor-pointer relative ${
                activeTab === 'saved'
                  ? 'bg-gradient-to-b from-amber-300 to-amber-500 text-black shadow-[0_2px_10px_rgba(245,158,11,0.3),inset_0_1px_0_rgba(255,255,255,0.4)] font-semibold'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <BookmarkCheck className="w-3.5 h-3.5" />
              <span>Saved ({savedSignatures.length})</span>
            </button>
          </div>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 space-y-4">
          {/* TAB 1: DRAW SIGNATURE */}
          {activeTab === 'draw' && (
            <div className="space-y-4">
              {/* Drawing Controls: Color & Stroke width */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-white/50 text-[11px] font-mono">Ink:</span>
                  <div className="flex items-center gap-1.5">
                    {SIGNATURE_COLORS.map((col) => (
                      <button
                        key={col.hex}
                        onClick={() => setPenColor(col.hex)}
                        className={`w-6 h-6 rounded-full border border-white/20 transition-all flex items-center justify-center cursor-pointer ${
                          penColor === col.hex
                            ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-[#07070a] scale-110 shadow-sm'
                            : 'opacity-85 hover:opacity-100 hover:scale-105'
                        }`}
                        style={{ backgroundColor: col.hex }}
                        title={col.name}
                      >
                        {penColor === col.hex && (
                          <Check className={`w-3 h-3 stroke-[3] ${col.hex === '#09090b' ? 'text-amber-400' : 'text-white'}`} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-white/50 text-[11px] font-mono">Stroke:</span>
                  <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-lg border border-white/10">
                    <button
                      onClick={() => setPenWidth(1.5)}
                      className={`px-2 py-0.5 rounded text-[10px] ${penWidth === 1.5 ? 'bg-amber-400 text-black font-bold' : 'text-white/60'}`}
                    >
                      Fine
                    </button>
                    <button
                      onClick={() => setPenWidth(2.5)}
                      className={`px-2 py-0.5 rounded text-[10px] ${penWidth === 2.5 ? 'bg-amber-400 text-black font-bold' : 'text-white/60'}`}
                    >
                      Medium
                    </button>
                    <button
                      onClick={() => setPenWidth(4)}
                      className={`px-2 py-0.5 rounded text-[10px] ${penWidth === 4 ? 'bg-amber-400 text-black font-bold' : 'text-white/60'}`}
                    >
                      Bold
                    </button>
                  </div>
                </div>
              </div>

              {/* Drawing Canvas Board */}
              <div className="relative rounded-2xl border border-white/15 bg-white shadow-inner overflow-hidden cursor-crosshair">
                <canvas
                  ref={canvasRef}
                  width={520}
                  height={190}
                  className="w-full h-44 touch-none"
                  onPointerDown={startDrawing}
                  onPointerMove={draw}
                  onPointerUp={stopDrawing}
                  onPointerLeave={stopDrawing}
                />

                {!hasDrawn && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-zinc-400">
                    <PenTool className="w-6 h-6 mb-1 opacity-40 animate-pulse text-zinc-500" />
                    <span className="text-xs font-mono">Sign your name here with mouse, trackpad, or stylus</span>
                    <span className="text-[10px] text-zinc-400 mt-1">Bottom line indicates signing base</span>
                  </div>
                )}

                {/* Subtle Baseline */}
                <div className="absolute bottom-6 left-8 right-8 border-b border-dashed border-zinc-300 pointer-events-none" />
              </div>

              {/* Pad Actions */}
              <div className="flex items-center justify-between text-xs">
                <button
                  onClick={undoDrawStroke}
                  disabled={drawHistory.length === 0}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/5 transition-colors disabled:opacity-30 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Undo Stroke</span>
                </button>

                <button
                  onClick={clearCanvas}
                  disabled={!hasDrawn}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 transition-colors disabled:opacity-30 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Pad</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: TYPE SIGNATURE */}
          {activeTab === 'type' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  Enter Name or Initials
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. Alex Morgan"
                    value={typedText}
                    onChange={(e) => setTypedText(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all font-medium"
                  />
                  {typedText && (
                    <button
                      onClick={() => setTypedText('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-xs cursor-pointer px-1 py-0.5"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Ink Color for typed font */}
              <div className="flex items-center justify-between text-xs bg-white/[0.02] border border-white/[0.06] rounded-xl px-3.5 py-2">
                <span className="text-white/60 text-xs font-medium">Ink Color:</span>
                <div className="flex items-center gap-2">
                  {SIGNATURE_COLORS.map((col) => (
                    <button
                      key={col.hex}
                      onClick={() => setTypedColor(col.hex)}
                      className={`w-6 h-6 rounded-full border border-white/20 transition-all flex items-center justify-center cursor-pointer ${
                        typedColor === col.hex
                          ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-[#07070a] scale-110 shadow-sm'
                          : 'opacity-85 hover:opacity-100 hover:scale-105'
                      }`}
                      style={{ backgroundColor: col.hex }}
                      title={col.name}
                    >
                      {typedColor === col.hex && (
                        <Check className={`w-3 h-3 stroke-[3] ${col.hex === '#09090b' ? 'text-amber-400' : 'text-white'}`} />
                      )}
                    </button>
                  ))}
                  <span className="text-[11px] font-mono text-white/40 pl-1 hidden sm:inline">
                    {SIGNATURE_COLORS.find((c) => c.hex === typedColor)?.name}
                  </span>
                </div>
              </div>

              {/* Font Previews Grid */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-white/70 text-xs font-semibold">Select Signature Style:</span>
                  <span className="text-[10px] font-mono text-white/40">Real Document Paper Preview</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {TYPED_FONTS.map((font, idx) => {
                    const isSelected = selectedFontIndex === idx;
                    const previewText = typedText.trim() || 'Your Signature';
                    return (
                      <div
                        key={font.id}
                        onClick={() => setSelectedFontIndex(idx)}
                        className={`group relative p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-amber-400/[0.06] border-amber-400 ring-1 ring-amber-400/40 shadow-[0_0_20px_rgba(245,158,11,0.12)]'
                            : 'bg-white/[0.02] border-white/10 hover:border-white/25 hover:bg-white/[0.04]'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className={`font-semibold tracking-wide ${isSelected ? 'text-amber-400' : 'text-white/80'}`}>
                            {font.name}
                          </span>
                          {isSelected && (
                            <span className="flex items-center gap-1 text-[10px] font-mono text-amber-400 font-bold bg-amber-400/15 px-2 py-0.5 rounded-full border border-amber-400/30">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                              Selected
                            </span>
                          )}
                        </div>

                        {/* Document Paper Preview Pad */}
                        <div className="relative w-full h-20 rounded-xl bg-white border border-zinc-200/90 shadow-sm flex items-center justify-center px-3 overflow-hidden transition-transform group-hover:scale-[1.01]">
                          {/* Ruled signature baseline */}
                          <div className="absolute bottom-3 left-4 right-4 border-b border-dashed border-zinc-200 pointer-events-none" />
                          <div
                            className="text-2xl sm:text-3xl text-center truncate relative z-10 select-none font-medium"
                            style={{
                              fontFamily: font.fontFamily,
                              color: typedColor
                            }}
                          >
                            {previewText}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: UPLOAD SIGNATURE */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-white/15 hover:border-amber-400/50 rounded-2xl p-6 text-center transition-colors bg-white/[0.01]">
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="sig-file-upload"
                />
                <label
                  htmlFor="sig-file-upload"
                  className="cursor-pointer flex flex-col items-center justify-center space-y-2"
                >
                  <Upload className="w-8 h-8 text-amber-400/80 mb-1" />
                  <span className="text-sm font-semibold text-white">Upload Handwritten Signature</span>
                  <span className="text-xs text-white/50">PNG, JPG, or WebP photo of paper signature</span>
                </label>
              </div>

              {/* Uploaded Preview & Transparency Options */}
              {uploadedDataUrl && (
                <div className="space-y-3 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">Preview</span>
                    <button
                      onClick={() => setUploadedDataUrl(null)}
                      className="text-xs text-rose-400 hover:underline"
                    >
                      Remove
                    </button>
                  </div>

                  {/* Checkerboard Background for Transparency check */}
                  <div className="w-full h-28 rounded-xl border border-white/10 flex items-center justify-center bg-[linear-gradient(45deg,#27272a_25%,transparent_25%),linear-gradient(-45deg,#27272a_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#27272a_75%)] bg-[size:16px_16px] bg-[#18181b] p-3 overflow-hidden shadow-inner">
                    <div className="p-2 rounded-lg bg-white shadow-sm flex items-center justify-center max-h-full">
                      <img
                        src={uploadedDataUrl}
                        alt="Signature Preview"
                        className="max-h-20 max-w-full object-contain"
                      />
                    </div>
                  </div>

                  {/* Auto-remove background toggle & Slider */}
                  <div className="space-y-2 pt-2 border-t border-white/10">
                    <label className="flex items-center gap-2 cursor-pointer text-xs">
                      <input
                        type="checkbox"
                        checked={removeBackground}
                        onChange={(e) => {
                          setRemoveBackground(e.target.checked);
                          if (uploadedDataUrl) {
                            processUploadedImage(uploadedDataUrl, e.target.checked, bgThreshold);
                          }
                        }}
                        className="rounded border-white/20 text-amber-400 focus:ring-amber-400"
                      />
                      <span className="text-white/80 font-medium">Auto-remove white background (Transparent PNG)</span>
                    </label>

                    {removeBackground && (
                      <div className="flex items-center gap-3 text-xs text-white/50 pl-5">
                        <Sliders className="w-3.5 h-3.5" />
                        <span>Sensitivity:</span>
                        <input
                          type="range"
                          min="150"
                          max="250"
                          value={bgThreshold}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setBgThreshold(val);
                            if (uploadedDataUrl) {
                              processUploadedImage(uploadedDataUrl, true, val);
                            }
                          }}
                          className="w-32 accent-amber-400"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SAVED SIGNATURES VAULT */}
          {activeTab === 'saved' && (
            <div className="space-y-3">
              {savedSignatures.length === 0 ? (
                <div className="py-12 text-center text-white/40 space-y-2">
                  <BookmarkCheck className="w-8 h-8 mx-auto opacity-30 text-amber-400" />
                  <p className="text-xs">No saved signatures in your local vault yet.</p>
                  <p className="text-[11px] text-white/30">Draw or upload a signature and check "Save to Vault" to reuse it anytime.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
                  {savedSignatures.map((sig) => (
                    <div
                      key={sig.id}
                      onClick={() => handleInsert(sig.dataUrl)}
                      className="group relative p-3 rounded-2xl border border-white/10 hover:border-amber-400/50 bg-white/[0.02] hover:bg-white/[0.05] transition-all cursor-pointer flex flex-col justify-between"
                    >
                      <div className="w-full h-20 rounded-xl bg-white border border-zinc-200/90 shadow-sm flex items-center justify-center p-2 mb-2 relative overflow-hidden">
                        <div className="absolute bottom-2 left-3 right-3 border-b border-dashed border-zinc-200 pointer-events-none" />
                        <img
                          src={sig.dataUrl}
                          alt="Saved Signature"
                          className="max-h-full max-w-full object-contain relative z-10"
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-white/40">
                        <span>Saved on {sig.createdAt}</span>
                        <button
                          onClick={(e) => deleteSavedSignature(sig.id, e)}
                          className="text-white/30 hover:text-rose-400 p-1 transition-colors"
                          title="Delete from Vault"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-white/[0.08] bg-white/[0.02] flex items-center justify-between">
          {activeTab !== 'saved' ? (
            <label className="flex items-center gap-2 cursor-pointer text-xs text-white/60 hover:text-white">
              <input
                type="checkbox"
                checked={saveToVault}
                onChange={(e) => setSaveToVault(e.target.checked)}
                className="rounded border-white/20 text-amber-400 focus:ring-amber-400"
              />
              <span>Save to signature vault for future docs</span>
            </label>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="btn-secondary text-xs px-4 py-2 rounded-full"
            >
              Cancel
            </button>
            <button
              onClick={() => handleInsert()}
              disabled={
                (activeTab === 'draw' && !hasDrawn) ||
                (activeTab === 'upload' && !uploadedDataUrl) ||
                (activeTab === 'saved')
              }
              className="btn-primary text-xs px-5 py-2 rounded-full font-semibold"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Insert Signature</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
