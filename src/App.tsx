import { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ModeSelector } from './components/ModeSelector';
import { DropZone } from './components/DropZone';
import { PngToSvgSettings } from './components/PngToSvgSettings';
import { SvgToPngSettings } from './components/SvgToPngSettings';
import { PreviewWorkspace } from './components/PreviewWorkspace';
import { HowItWorks } from './components/HowItWorks';
import { ComparisonSection } from './components/ComparisonSection';
import { Faq } from './components/Faq';
import { Footer } from './components/Footer';
import { ThemeProvider } from './context/ThemeContext';
import { vectorizePng } from './utils/pngToSvg';
import type { PngToSvgOptions, VectorizationResult } from './utils/pngToSvg';
import { convertSvgToPng, parseSvgDimensions } from './utils/svgToPng';
import type { SvgToPngOptions, SvgDimensions } from './utils/svgToPng';
import { AlertCircle, RefreshCw } from 'lucide-react';

export function AppContent() {
  const [mode, setMode] = useState<'png-to-svg' | 'svg-to-png'>('png-to-svg');
  const [file, setFile] = useState<File | null>(null);
  const [originalSrc, setOriginalSrc] = useState<string>('');
  const [rawSvgText, setRawSvgText] = useState<string>(''); // For SVG -> PNG input
  
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
    removeBackground: false,
  });

  // Settings for SVG -> PNG
  const [svgNativeDim, setSvgNativeDim] = useState<SvgDimensions>({
    width: 800,
    height: 800,
    aspectRatio: 1,
  });
  const [svgOptions, setSvgOptions] = useState<SvgToPngOptions>({
    width: 800,
    height: 800,
    backgroundColor: 'transparent',
  });

  const workspaceRef = useRef<HTMLDivElement>(null);

  const scrollToWorkspace = () => {
    workspaceRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Clean up object URLs when file changes
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

  // Mode Switch Handler
  const handleSelectMode = (newMode: 'png-to-svg' | 'svg-to-png') => {
    if (newMode === mode) return;
    setMode(newMode);
    // Reset file if current file type is incompatible
    if (file) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (newMode === 'png-to-svg' && ext === 'svg') {
        handleClear();
      } else if (newMode === 'svg-to-png' && ext !== 'svg') {
        handleClear();
      }
    }
  };

  // File Upload Handler
  const handleFileSelected = async (selectedFile: File) => {
    setErrorMessage(null);
    setFile(selectedFile);

    // Create preview URL
    const objectUrl = URL.createObjectURL(selectedFile);
    setOriginalSrc(objectUrl);

    if (mode === 'png-to-svg') {
      await runPngToSvg(selectedFile, pngOptions);
    } else {
      // SVG -> PNG
      try {
        const svgContent = await selectedFile.text();
        setRawSvgText(svgContent);
        const dims = parseSvgDimensions(svgContent);
        setSvgNativeDim(dims);
        const initialSvgOptions: SvgToPngOptions = {
          width: dims.width,
          height: dims.height,
          backgroundColor: 'transparent',
        };
        setSvgOptions(initialSvgOptions);
        await runSvgToPng(svgContent, initialSvgOptions);
      } catch (err: any) {
        setErrorMessage(`Failed to read SVG file: ${err.message || 'Unknown error'}`);
      }
    }
  };

  // Execute PNG -> SVG Vectorization
  const runPngToSvg = async (sourceFile: File, options: PngToSvgOptions) => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const result: VectorizationResult = await vectorizePng(sourceFile, options);

      // Create SVG blob URL for crisp rendering
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
      console.error('PNG to SVG vectorization failed:', err);
      setErrorMessage(
        err.message || 'Vectorization failed. Please check your image or try adjusting the settings.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Execute SVG -> PNG Rasterization
  const runSvgToPng = async (svgString: string, options: SvgToPngOptions) => {
    setIsProcessing(true);
    setErrorMessage(null);
    const startTime = performance.now();

    try {
      const result = await convertSvgToPng(svgString, options);
      const endTime = performance.now();

      setConvertedSrc(result.dataUrl);
      setConvertedBlob(result.blob);
      setConvertedSizeBytes(result.sizeBytes);
      setOutputWidth(options.width);
      setOutputHeight(options.height);
      setPathCount(undefined);
      setExecutionTimeMs(Math.round(endTime - startTime));
    } catch (err: any) {
      console.error('SVG to PNG conversion failed:', err);
      setErrorMessage(
        err.message || 'SVG rasterization failed. Please verify that the SVG is valid XML.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Trigger Re-conversion
  const handleReconvert = () => {
    if (!file) return;
    if (mode === 'png-to-svg') {
      runPngToSvg(file, pngOptions);
    } else if (rawSvgText) {
      runSvgToPng(rawSvgText, svgOptions);
    }
  };

  // Reset / Clear Workspace
  const handleClear = () => {
    setFile(null);
    setOriginalSrc('');
    setRawSvgText('');
    setConvertedSrc('');
    setConvertedSvgString('');
    setConvertedBlob(null);
    setConvertedSizeBytes(0);
    setPathCount(undefined);
    setExecutionTimeMs(undefined);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#09090B] dark:bg-[#09090B] light:bg-[#F8FAFC] text-[#FAFAFA] dark:text-[#FAFAFA] light:text-[#0F172A] selection:bg-[#00D1FF]/30 selection:text-white transition-colors duration-200">
      {/* Navbar */}
      <Navbar activeMode={mode} onSelectMode={handleSelectMode} />

      {/* Hero Section */}
      <Hero
        activeMode={mode}
        onSelectMode={handleSelectMode}
        onScrollToWorkspace={scrollToWorkspace}
      />

      {/* Main Conversion Workspace Section */}
      <main ref={workspaceRef} id="workspace" className="flex-1 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Mode Switcher Bar */}
          <div className="max-w-4xl mx-auto">
            <ModeSelector activeMode={mode} onSelectMode={handleSelectMode} />
          </div>

          {/* Conditional Layout: Upload Zone or Active Workspace */}
          {!file ? (
            <div className="max-w-3xl mx-auto">
              <DropZone
                mode={mode}
                onFileSelected={handleFileSelected}
                isLoading={isProcessing}
              />
            </div>
          ) : (
            <div className="space-y-8">
              {/* Error banner if conversion failed */}
              {errorMessage && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between gap-4 text-rose-400 text-sm">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
                    <span>{errorMessage}</span>
                  </div>
                  <button
                    onClick={handleReconvert}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-semibold text-xs transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Retry</span>
                  </button>
                </div>
              )}

              {/* Main Workspace Split: Settings on Left, Preview on Right (Desktop) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Settings Panel */}
                <div className="lg:col-span-4 space-y-6">
                  {mode === 'png-to-svg' ? (
                    <PngToSvgSettings
                      options={pngOptions}
                      onChange={setPngOptions}
                      onVectorize={handleReconvert}
                      isProcessing={isProcessing}
                    />
                  ) : (
                    <SvgToPngSettings
                      options={svgOptions}
                      nativeDimensions={svgNativeDim}
                      onChange={setSvgOptions}
                      onRender={handleReconvert}
                      isProcessing={isProcessing}
                    />
                  )}
                </div>

                {/* Right Column: Visual Preview & Download */}
                <div className="lg:col-span-8">
                  <PreviewWorkspace
                    mode={mode}
                    originalFileName={file.name}
                    originalFileSize={file.size}
                    originalSrc={originalSrc}
                    convertedSrc={convertedSrc}
                    convertedSvgString={convertedSvgString}
                    convertedBlob={convertedBlob || undefined}
                    convertedSizeBytes={convertedSizeBytes}
                    width={outputWidth}
                    height={outputHeight}
                    pathCount={pathCount}
                    executionTimeMs={executionTimeMs}
                    onClear={handleClear}
                    onReconvert={handleReconvert}
                    isProcessing={isProcessing}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* How It Works Section */}
      <HowItWorks />

      {/* True Vectorization vs Fake Base64 Comparison */}
      <ComparisonSection />

      {/* FAQ Section */}
      <Faq />

      {/* Footer */}
      <Footer onSelectMode={handleSelectMode} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
