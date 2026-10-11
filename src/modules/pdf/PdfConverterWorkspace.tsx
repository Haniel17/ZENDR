import React, { useState } from 'react';
import { ThemedSelect } from '../../components/ThemedSelect';
import {
  mergePdfs,
  splitPdfByRange,
  rotatePdfPages,
  compressPdf,
  imagesToPdf,
  pdfToImages
} from './pdfEngine';
import {
  convertPdfToDocx,
  convertDocxToPdf,
  convertPdfToXlsx,
  convertXlsxToPdf,
  convertPdfToPptx,
  convertPdfToTxt,
  convertTxtToPdf,
  convertPptxToPdf
} from './officeEngine';
import {
  convertPdfToEpub,
  convertEpubToPdf,
  convertHeicToPdf
} from './ebookEngine';
import {
  flattenPdf,
  resizePdfPages,
  removePdfPages,
  cropPdfMargins,
  unlockPdf,
  extractImagesFromPdf
} from './pdfExtraEngine';
import { getToolById, ZENDR_TOOLS } from './toolsCatalog';
import { validateFile, formatBytes, triggerFileDownload } from '../../utils/fileValidation';
import {
  Upload,
  Download,
  AlertCircle,
  CheckCircle2,
  Loader2,
  FileText,
  ArrowRight,
  ArrowLeft,
  Info,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface PdfConverterWorkspaceProps {
  toolId: string;
  onSelectTool?: (toolId: string) => void;
}

export const PdfConverterWorkspace: React.FC<PdfConverterWorkspaceProps> = ({
  toolId,
  onSelectTool
}) => {
  const tool = getToolById(toolId) || ZENDR_TOOLS[3]; // default to merge if not found

  // File states
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Converted result
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultFileName, setResultFileName] = useState('');
  const [resultMeta, setResultMeta] = useState<Record<string, any>>({});

  // Tool-specific parameter settings
  const [splitRange, setSplitRange] = useState('1-3');
  const [rotationAngle, setRotationAngle] = useState(90);
  const [imageDpiScale, setImageDpiScale] = useState(2.0);

  // Drag-and-drop state
  const [isDragging, setIsDragging] = useState(false);

  const handleFilesAdded = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setErrorMessage(null);
    setResultBlob(null);

    const validList: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const val = validateFile(f, tool.supportedInputExtensions);
      if (!val.isValid) {
        setErrorMessage(val.error || 'Invalid file.');
        return;
      }
      validList.push(f);
    }

    if (tool.supportsMultipleFiles) {
      setSelectedFiles((prev) => [...prev, ...validList]);
    } else {
      setSelectedFiles([validList[0]]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleExecute = async () => {
    if (selectedFiles.length === 0) {
      setErrorMessage('Please add a file to process.');
      return;
    }

    try {
      setIsProcessing(true);
      setErrorMessage(null);
      setProgressPercent(10);
      setProgressMessage('Preparing conversion engine...');

      const onProgress = (p: number, msg: string) => {
        setProgressPercent(p);
        setProgressMessage(msg);
      };

      const primaryFile = selectedFiles[0];
      const baseName = primaryFile.name.replace(/\.[^/.]+$/, '');

      let outBlob: Blob;
      let outName = `${baseName}_converted.${tool.outputExtension}`;
      let meta: Record<string, any> = {};

      switch (tool.id) {
        case 'merge-pdf':
          if (selectedFiles.length < 2) {
            throw new Error('Please select at least 2 PDF files to merge.');
          }
          outBlob = await mergePdfs(selectedFiles, onProgress);
          outName = `merged_${Date.now()}.pdf`;
          break;

        case 'split-pdf':
          outBlob = await splitPdfByRange(primaryFile, splitRange, onProgress);
          outName = `${baseName}_pages_${splitRange.replace(/[^a-zA-Z0-9-]/g, '_')}.pdf`;
          break;

        case 'extract-pages':
          outBlob = await splitPdfByRange(primaryFile, splitRange, onProgress);
          outName = `${baseName}_extracted.pdf`;
          break;

        case 'rotate-pdf':
          outBlob = await rotatePdfPages(primaryFile, rotationAngle, undefined, onProgress);
          outName = `${baseName}_rotated_${rotationAngle}deg.pdf`;
          break;

        case 'compress-pdf': {
          const comp = await compressPdf(primaryFile, onProgress);
          outBlob = comp.blob;
          outName = `${baseName}_compressed.pdf`;
          meta = {
            originalSize: comp.originalSize,
            newSize: comp.newSize,
            reductionPercent: comp.reductionPercent
          };
          break;
        }

        case 'jpg-to-pdf':
        case 'png-to-pdf':
          outBlob = await imagesToPdf(selectedFiles, onProgress);
          outName = `${baseName}_images.pdf`;
          break;

        case 'pdf-to-jpg':
        case 'pdf-to-png': {
          const format = tool.id === 'pdf-to-jpg' ? 'jpeg' : 'png';
          const imgRes = await pdfToImages(primaryFile, format, imageDpiScale, onProgress);
          outBlob = imgRes.blob;
          outName = imgRes.filename;
          meta = { pageCount: imgRes.count, isZip: imgRes.isZip };
          break;
        }

        // Office conversions
        case 'pdf-to-docx':
          outBlob = await convertPdfToDocx(primaryFile, onProgress);
          outName = `${baseName}.docx`;
          break;

        case 'docx-to-pdf':
          outBlob = await convertDocxToPdf(primaryFile, onProgress);
          outName = `${baseName}.pdf`;
          break;

        case 'pdf-to-xlsx':
          outBlob = await convertPdfToXlsx(primaryFile, onProgress);
          outName = `${baseName}.xlsx`;
          break;

        case 'xlsx-to-pdf':
          outBlob = await convertXlsxToPdf(primaryFile, onProgress);
          outName = `${baseName}.pdf`;
          break;

        case 'pdf-to-pptx':
          outBlob = await convertPdfToPptx(primaryFile, onProgress);
          outName = `${baseName}.pptx`;
          break;

        case 'pptx-to-pdf':
          outBlob = await convertPptxToPdf(primaryFile, onProgress);
          outName = `${baseName}.pdf`;
          break;

        case 'pdf-to-txt':
          outBlob = await convertPdfToTxt(primaryFile, onProgress);
          outName = `${baseName}.txt`;
          break;

        case 'txt-to-pdf':
          outBlob = await convertTxtToPdf(primaryFile, onProgress);
          outName = `${baseName}.pdf`;
          break;

        case 'pdf-to-epub':
          outBlob = await convertPdfToEpub(primaryFile, onProgress);
          outName = `${baseName}.epub`;
          break;

        case 'epub-to-pdf':
          outBlob = await convertEpubToPdf(primaryFile, onProgress);
          outName = `${baseName}.pdf`;
          break;

        case 'heic-to-pdf':
          outBlob = await convertHeicToPdf(primaryFile, onProgress);
          outName = `${baseName}.pdf`;
          break;

        case 'ebook-converter':
          if (primaryFile.name.toLowerCase().endsWith('.epub')) {
            outBlob = await convertEpubToPdf(primaryFile, onProgress);
            outName = `${baseName}.pdf`;
          } else {
            outBlob = await convertPdfToEpub(primaryFile, onProgress);
            outName = `${baseName}.epub`;
          }
          break;

        case 'document-converter': {
          const lowerName = primaryFile.name.toLowerCase();
          if (lowerName.endsWith('.docx')) {
            outBlob = await convertDocxToPdf(primaryFile, onProgress);
            outName = `${baseName}.pdf`;
          } else if (lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls')) {
            outBlob = await convertXlsxToPdf(primaryFile, onProgress);
            outName = `${baseName}.pdf`;
          } else if (lowerName.endsWith('.pdf')) {
            outBlob = await convertPdfToDocx(primaryFile, onProgress);
            outName = `${baseName}.docx`;
          } else {
            const textContent = await primaryFile.text();
            const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
            const pdfDoc = await PDFDocument.create();
            const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const page = pdfDoc.addPage([595.28, 841.89]);
            const lines = textContent.split('\n').slice(0, 50);
            let y = 800;
            for (const line of lines) {
              page.drawText(line.substring(0, 90), { x: 50, y, size: 10, font, color: rgb(0.1, 0.1, 0.1) });
              y -= 14;
              if (y < 50) break;
            }
            const pdfBytes = await pdfDoc.save();
            outBlob = new Blob([new Uint8Array(pdfBytes).buffer as ArrayBuffer], { type: 'application/pdf' });
            outName = `${baseName}.pdf`;
          }
          break;
        }

        case 'pdf-converter': {
          const lower = primaryFile.name.toLowerCase();
          if (lower.endsWith('.pdf')) {
            outBlob = await convertPdfToDocx(primaryFile, onProgress);
            outName = `${baseName}.docx`;
          } else if (lower.endsWith('.docx')) {
            outBlob = await convertDocxToPdf(primaryFile, onProgress);
            outName = `${baseName}.pdf`;
          } else if (lower.endsWith('.epub')) {
            outBlob = await convertEpubToPdf(primaryFile, onProgress);
            outName = `${baseName}.pdf`;
          } else if (lower.endsWith('.heic') || lower.endsWith('.heif')) {
            outBlob = await convertHeicToPdf(primaryFile, onProgress);
            outName = `${baseName}.pdf`;
          } else {
            outBlob = await imagesToPdf(selectedFiles, onProgress);
            outName = `${baseName}.pdf`;
          }
          break;
        }

        case 'flatten-pdf':
          outBlob = await flattenPdf(primaryFile, onProgress);
          outName = `${baseName}_flattened.pdf`;
          break;

        case 'resize-pdf':
          outBlob = await resizePdfPages(primaryFile, 'A4', onProgress);
          outName = `${baseName}_resized_A4.pdf`;
          break;

        case 'unlock-pdf':
          outBlob = await unlockPdf(primaryFile, onProgress);
          outName = `${baseName}_unlocked.pdf`;
          break;

        case 'crop-pdf':
          outBlob = await cropPdfMargins(primaryFile, 36, onProgress);
          outName = `${baseName}_cropped.pdf`;
          break;

        case 'pdf-page-remover':
          outBlob = await removePdfPages(primaryFile, [1], onProgress);
          outName = `${baseName}_page_removed.pdf`;
          break;

        case 'extract-image-from-pdf': {
          const imgRes = await extractImagesFromPdf(primaryFile, onProgress);
          outBlob = imgRes.blob;
          outName = imgRes.zipFileName;
          meta = { imageCount: imgRes.imageCount };
          break;
        }

        default:
          throw new Error(`Tool "${tool.id}" is not supported yet.`);
      }

      setResultBlob(outBlob);
      setResultFileName(outName);
      setResultMeta(meta);
      setProgressPercent(100);
      setProgressMessage('Complete!');
    } catch (err: any) {
      console.error('Conversion failed:', err);
      setErrorMessage(err.message || 'An error occurred during conversion.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (resultBlob) {
      triggerFileDownload(resultBlob, resultFileName);
    }
  };

  const pdfTools = ZENDR_TOOLS.filter((t) => t.section === 'pdf');
  const organizeTools = pdfTools.filter((t) => t.subCategory === 'organize');
  const fromPdfTools = pdfTools.filter((t) => t.subCategory === 'convert-from-pdf');
  const toPdfTools = pdfTools.filter((t) => t.subCategory === 'convert-to-pdf');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 select-none">
      {/* Header & Tool Switcher Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          {/* Back to All PDF Tools */}
          <Link
            to="/pdf-converter"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white/70 hover:text-white text-xs font-mono transition-all mb-3.5 group cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-amber-400 group-hover:-translate-x-1 transition-transform" />
            <span>All PDF Tools Menu</span>
          </Link>

          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-amber-400/10 border border-amber-400/20 text-amber-400">
              {tool.badge || 'PDF Tool'}
            </span>
            <div className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20 font-mono">
              <ShieldCheck className="w-3 h-3" />
              <span>Private &amp; In-Browser</span>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {tool.title}
          </h1>
          <p className="text-xs sm:text-sm text-white/60 max-w-2xl mt-1 leading-relaxed">
            {tool.description}
          </p>
        </div>

        {/* Quick Tool Switcher Select */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/50 font-mono">Switch Tool:</span>
          <ThemedSelect
            value={tool.id}
            onChange={(val) => onSelectTool?.(String(val))}
            align="right"
            options={[
              { value: 'menu', label: '☰ Browse All PDF Tools...' },
              ...organizeTools.map((t) => ({ value: t.id, label: t.title })),
              ...fromPdfTools.map((t) => ({ value: t.id, label: t.title })),
              ...toPdfTools.map((t) => ({ value: t.id, label: t.title }))
            ]}
          />
        </div>
      </div>

      {/* Accuracy & Technical Disclaimer Banner */}
      {tool.accuracyDisclaimer && (
        <div className="p-3.5 rounded-2xl bg-amber-400/[0.06] border border-amber-400/20 flex items-start gap-3 text-xs text-amber-300/90 leading-relaxed backdrop-blur-xl">
          <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-amber-400 font-semibold block mb-0.5">
              Technical Accuracy Notice
            </strong>
            {tool.accuracyDisclaimer}
          </div>
        </div>
      )}

      {/* Main Two-Column Layout: DropZone & Settings / Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Col: Upload Card */}
        <div className="lg:col-span-7 space-y-4">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              handleFilesAdded(e.dataTransfer.files);
            }}
            className={`relative rounded-3xl border-2 border-dashed p-8 transition-all text-center flex flex-col items-center justify-center min-h-[280px] ${
              isDragging
                ? 'border-amber-400 bg-amber-400/[0.08] shadow-[0_0_30px_rgba(245,158,11,0.2)]'
                : 'border-white/10 bg-[#07070a]/60 hover:border-white/20'
            }`}
          >
            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-amber-400 mb-4 drop-shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <Upload className="w-8 h-8" />
            </div>

            <h3 className="text-base font-bold text-white mb-1">
              Drag &amp; drop {tool.supportsMultipleFiles ? 'files' : 'file'} here
            </h3>
            <p className="text-xs text-white/50 max-w-sm mb-4">
              Supported formats: {tool.supportedInputExtensions.map((e) => `.${e.toUpperCase()}`).join(', ')} • Up to 50MB
            </p>

            <label className="px-5 py-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/15 text-xs font-semibold cursor-pointer transition-all hover:border-amber-400/50">
              <span>Browse Files</span>
              <input
                type="file"
                multiple={tool.supportsMultipleFiles}
                accept={tool.supportedInputExtensions.map((e) => `.${e}`).join(',')}
                className="hidden"
                onChange={(e) => handleFilesAdded(e.target.files)}
              />
            </label>
          </div>

          {/* Selected File List */}
          {selectedFiles.length > 0 && (
            <div className="rounded-2xl border border-white/[0.08] bg-[#07070a]/80 p-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-white/60 mb-2 font-mono">
                <span>Selected ({selectedFiles.length})</span>
                <button
                  onClick={() => setSelectedFiles([])}
                  className="text-rose-400 hover:text-rose-300 transition-colors"
                >
                  Clear all
                </button>
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar">
                {selectedFiles.map((f, i) => (
                  <div
                    key={`${f.name}-${i}`}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] text-xs text-white/90"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <FileText className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <span className="truncate font-medium">{f.name}</span>
                      <span className="text-[10px] text-white/40 font-mono">({formatBytes(f.size)})</span>
                    </div>
                    <button
                      onClick={() => handleRemoveFile(i)}
                      className="text-white/40 hover:text-rose-400 p-1"
                      title="Remove"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Settings & Action Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl border border-white/[0.08] bg-[#07070a]/90 backdrop-blur-2xl p-6 space-y-5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Tool Parameters</span>
            </h3>

            {/* Parameter Controls based on Tool */}
            {tool.id === 'split-pdf' || tool.id === 'extract-pages' ? (
              <div className="space-y-2">
                <label className="text-xs text-white/70 block">
                  Page Range (e.g., "1-3, 5, 8-10"):
                </label>
                <input
                  type="text"
                  value={splitRange}
                  onChange={(e) => setSplitRange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                  placeholder="1-3, 5"
                />
                <span className="text-[10px] text-white/40 block">
                  Specify single pages or comma-separated hyphenated ranges.
                </span>
              </div>
            ) : null}

            {tool.id === 'rotate-pdf' ? (
              <div className="space-y-2">
                <label className="text-xs text-white/70 block">Rotation Angle:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[90, 180, 270].map((deg) => (
                    <button
                      key={deg}
                      onClick={() => setRotationAngle(deg)}
                      className={`py-2 rounded-xl text-xs font-mono font-medium border transition-transform transition-colors duration-75 active:scale-95 select-none cursor-pointer ${
                        rotationAngle === deg
                          ? 'border-amber-400 bg-amber-400/15 text-amber-400'
                          : 'border-white/10 text-white/60 hover:text-white'
                      }`}
                    >
                      {deg}° Clockwise
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {tool.id === 'pdf-to-jpg' || tool.id === 'pdf-to-png' ? (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-white/70 block">DPI Resolution Scale:</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Standard (1.5x)', val: 1.5 },
                      { label: 'High (2.0x)', val: 2.0 },
                      { label: 'Ultra (3.0x)', val: 3.0 }
                    ].map((d) => (
                      <button
                        key={d.val}
                        onClick={() => setImageDpiScale(d.val)}
                        className={`py-2 px-1 rounded-xl text-[11px] font-mono border transition-transform transition-colors duration-75 active:scale-95 select-none cursor-pointer ${
                          imageDpiScale === d.val
                            ? 'border-amber-400 bg-amber-400/15 text-amber-400'
                            : 'border-white/10 text-white/60 hover:text-white'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {tool.id === 'compress-pdf' ? (
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs text-white/60 space-y-1">
                <div className="text-amber-400 font-semibold text-xs">Lossless Stream Optimization</div>
                <p className="text-[11px] leading-relaxed">
                  Removes redundant object dictionaries and structural metadata while keeping fonts and vector lines sharp.
                </p>
              </div>
            ) : null}

            {/* Error Message Banner */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Progress Bar */}
            {isProcessing && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs text-amber-400 font-mono">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{progressMessage}</span>
                  </div>
                  <span>{progressPercent}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-amber-400 transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}

            {/* Execute Button */}
            <button
              onClick={handleExecute}
              disabled={isProcessing || selectedFiles.length === 0}
              className="w-full py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-black font-bold text-xs tracking-wide uppercase transition-transform transition-colors duration-75 active:scale-95 shadow-lg shadow-amber-400/25 flex items-center justify-center gap-2 cursor-pointer select-none disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Run {tool.title}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Download Output Card */}
          {resultBlob && (
            <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/[0.06] backdrop-blur-2xl p-6 space-y-4">
              <div className="flex items-center gap-2.5 text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
                <h4 className="text-sm font-bold text-white">Conversion Successful</h4>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1 font-mono text-xs">
                <div className="text-white truncate font-medium">{resultFileName}</div>
                <div className="text-white/50 text-[11px]">
                  Output Size: {formatBytes(resultBlob.size)}
                  {resultMeta.reductionPercent ? (
                    <span className="text-emerald-400 ml-2">
                      ({resultMeta.reductionPercent}% smaller)
                    </span>
                  ) : null}
                </div>
              </div>

              <button
                onClick={handleDownload}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs tracking-wide uppercase transition-transform transition-colors duration-75 active:scale-95 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer select-none"
              >
                <Download className="w-4 h-4" />
                <span>Download Result</span>
              </button>

              {resultFileName.endsWith('.pdf') && (
                <Link
                  to="/pdf-editor"
                  className="w-full py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/80 hover:text-white border border-white/10 text-xs font-medium flex items-center justify-center gap-2 transition-transform transition-colors duration-75 active:scale-95 select-none"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                  <span>Open in PDF Editor</span>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
