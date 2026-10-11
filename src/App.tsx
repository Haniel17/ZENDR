import { useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ChromaticWaves } from './components/ChromaticWaves';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { VaultModal } from './components/VaultModal';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { VaultProvider } from './context/VaultContext';
import { HomePage } from './pages/HomePage';
import { Loader2 } from 'lucide-react';

const ImageWorkspacePage = lazy(() =>
  import('./pages/ImageWorkspacePage').then((m) => ({ default: m.ImageWorkspacePage }))
);
const PdfConverterPage = lazy(() =>
  import('./pages/PdfConverterPage').then((m) => ({ default: m.PdfConverterPage }))
);
const PdfEditorPage = lazy(() =>
  import('./pages/PdfEditorPage').then((m) => ({ default: m.PdfEditorPage }))
);
const DocumentConverterPage = lazy(() =>
  import('./pages/DocumentConverterPage').then((m) => ({ default: m.DocumentConverterPage }))
);
const CompressorWorkspacePage = lazy(() =>
  import('./pages/CompressorWorkspacePage').then((m) => ({ default: m.CompressorWorkspacePage }))
);
const ImageEditorPage = lazy(() =>
  import('./pages/ImageEditorPage').then((m) => ({ default: m.ImageEditorPage }))
);
const DataConverterPage = lazy(() =>
  import('./pages/DataConverterPage').then((m) => ({ default: m.DataConverterPage }))
);

const PageLoader = () => (
  <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-3">
    <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
    <span className="text-xs font-mono text-white/50">Loading workspace engine...</span>
  </div>
);

export function AppContent() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const location = useLocation();
  const isPdfEditor = location.pathname.startsWith('/pdf-editor');

  return (
    <div className={`min-h-screen flex flex-col relative text-white selection:bg-amber-400 selection:text-black ${isPdfEditor ? 'h-screen overflow-hidden' : ''}`}>
      {/* Flowing Chromatic Aurora Waves Background */}
      <ChromaticWaves />

      {/* Top Navigation with Logo Wordmark & Route Navigation */}
      <Navbar
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenVault={() => setIsVaultOpen(true)}
      />

      {/* Main Routed Content Area */}
      <div className="flex-1 flex flex-col relative z-10 min-h-0">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route
              path="/image-converter"
              element={<ImageWorkspacePage onOpenAuth={() => setIsAuthOpen(true)} />}
            />
            <Route
              path="/image-converter/:mode"
              element={<ImageWorkspacePage onOpenAuth={() => setIsAuthOpen(true)} />}
            />
            <Route path="/pdf-converter" element={<PdfConverterPage />} />
            <Route path="/pdf-converter/:toolId" element={<PdfConverterPage />} />
            <Route path="/pdf-editor" element={<PdfEditorPage />} />
            <Route path="/document-converter" element={<DocumentConverterPage />} />
            <Route path="/document-converter/:toolId" element={<DocumentConverterPage />} />
            <Route path="/compress/:toolId" element={<CompressorWorkspacePage />} />
            <Route path="/image-compressor" element={<CompressorWorkspacePage initialMode="image-compressor" />} />
            <Route path="/jpeg-compressor" element={<CompressorWorkspacePage initialMode="jpeg-compressor" />} />
            <Route path="/png-compressor" element={<CompressorWorkspacePage initialMode="png-compressor" />} />
            <Route path="/pdf-compressor" element={<CompressorWorkspacePage initialMode="pdf-compressor" />} />
            <Route path="/image-editor" element={<ImageEditorPage />} />
            <Route path="/image-editor/:toolId" element={<ImageEditorPage />} />
            <Route path="/gif-maker" element={<ImageEditorPage />} />
            <Route path="/resize-image" element={<ImageEditorPage />} />
            <Route path="/crop-image" element={<ImageEditorPage />} />
            <Route path="/color-picker" element={<ImageEditorPage />} />
            <Route path="/rotate-image" element={<ImageEditorPage />} />
            <Route path="/flip-image" element={<ImageEditorPage />} />
            <Route path="/image-enlarger" element={<ImageEditorPage />} />
            <Route path="/data-converter" element={<DataConverterPage />} />
            <Route path="/data-converter/:toolId" element={<DataConverterPage />} />
            <Route path="/text-to-json" element={<DataConverterPage />} />
            <Route path="/csv-to-json" element={<DataConverterPage />} />
            <Route path="/json-to-csv" element={<DataConverterPage />} />
            <Route path="/yaml-to-json" element={<DataConverterPage />} />
            <Route path="/xml-to-json" element={<DataConverterPage />} />
            <Route path="/json-to-yaml" element={<DataConverterPage />} />
            <Route path="/json-to-xml" element={<DataConverterPage />} />
            <Route path="/base64-converter" element={<DataConverterPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </div>

      {/* Single Clean Footer with Navigation Links (hidden in studio workspaces) */}
      {!isPdfEditor && <Footer onSelectMode={() => {}} />}

      {/* 100% Optional MongoDB Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      {/* MongoDB Vault History Drawer/Modal */}
      <VaultModal
        isOpen={isVaultOpen}
        onClose={() => setIsVaultOpen(false)}
      />
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <VaultProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </VaultProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
