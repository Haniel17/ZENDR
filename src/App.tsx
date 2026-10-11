import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChromaticWaves } from './components/ChromaticWaves';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { VaultModal } from './components/VaultModal';
import { ZendrLoadingScreen } from './components/ZendrLoadingScreen';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { VaultProvider } from './context/VaultContext';
import { HomePage } from './pages/HomePage';

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
  <ZendrLoadingScreen
    fullScreen={false}
    message="Loading workspace..."
    size="md"
  />
);

export function AppContent() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const location = useLocation();
  const isPdfEditor = location.pathname.startsWith('/pdf-editor');

  // Smooth initial launch branding experience
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 700);
    return () => clearTimeout(timer);
  }, []);

  // Smooth scroll restoration on page change (except full-height editor)
  useEffect(() => {
    if (!isPdfEditor) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [location.pathname, isPdfEditor]);

  return (
    <div className={`min-h-screen flex flex-col relative text-white selection:bg-amber-400 selection:text-black ${isPdfEditor ? 'h-screen overflow-hidden' : ''}`}>
      {/* Initial Clean Brand Launch Loader */}
      <AnimatePresence>
        {isInitialLoading && (
          <motion.div
            key="initial-app-loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[100] pointer-events-none"
          >
            <ZendrLoadingScreen fullScreen={true} message="Initializing workspace..." />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Flowing Chromatic Aurora Waves Background */}
      <ChromaticWaves />

      {/* Top Navigation with Logo Wordmark & Route Navigation */}
      <Navbar
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenVault={() => setIsVaultOpen(true)}
      />

      {/* Main Routed Content Area with Smooth Page Transition */}
      <div className="flex-1 flex flex-col relative z-10 min-h-0">
        <Suspense fallback={<PageLoader />}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 7 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{
                duration: 0.2,
                ease: [0.16, 1, 0.3, 1]
              }}
              className={`flex-1 flex flex-col min-h-0 ${isPdfEditor ? 'h-full overflow-hidden' : ''}`}
            >
              <Routes location={location}>
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
        </motion.div>
      </AnimatePresence>
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
