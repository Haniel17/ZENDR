import React, { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { ThumbnailSidebar } from './ThumbnailSidebar';
import { EditorToolbar } from './EditorToolbar';
import { CanvasOverlay } from './CanvasOverlay';
import { SignatureModal } from './SignatureModal';
import { StampPickerModal } from './StampPickerModal';
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal';
import { initializeEditorDocument, exportEditedPdf } from './editorEngine';
import { extractPages, mergePdfs } from '../pdf/pdfEngine';
import { flattenPdf } from '../pdf/pdfExtraEngine';
import { triggerFileDownload } from '../../utils/fileValidation';
import type {
  EditorTool,
  EditorPageState,
  AnnotationItem,
  EditorHistoryEntry,
  SignatureAnnotation,
  StampAnnotation
} from './types';
import { AlertCircle, CheckCircle2, Loader2, Upload } from 'lucide-react';

interface PdfEditorWorkspaceProps {
  initialFile?: File | null;
}

export const PdfEditorWorkspace: React.FC<PdfEditorWorkspaceProps> = ({
  initialFile
}) => {
  const [file, setFile] = useState<File | null>(initialFile || null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Document Pages State
  const [pages, setPages] = useState<EditorPageState[]>([]);
  const [currentPageNumber, setCurrentPageNumber] = useState<number>(1);
  const [annotationsMap, setAnnotationsMap] = useState<Record<number, AnnotationItem[]>>({});

  // History for Undo / Redo
  const [historyStack, setHistoryStack] = useState<EditorHistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // View & Tool States
  const [currentTool, setCurrentTool] = useState<EditorTool>('select');
  const [currentColor, setCurrentColor] = useState<string>('#f59e0b');
  const [strokeWidth, setStrokeWidth] = useState<number>(2);
  const [fontSize, setFontSize] = useState<number>(18);
  const [zoomScale, setZoomScale] = useState<number>(1.0);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isReaderMode, setIsReaderMode] = useState<boolean>(false);

  // Signature & Stamp Modals
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState<boolean>(false);
  const [isStampModalOpen, setIsStampModalOpen] = useState<boolean>(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState<boolean>(false);

  // Selected element & temporary spacebar pan mode
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);
  const [isSpacePanning, setIsSpacePanning] = useState<boolean>(false);
  const [isPanningState, setIsPanningState] = useState<boolean>(false);

  // Viewport Pan References & Handlers
  const isPanningRef = useRef(false);
  const panStartRef = useRef<{ x: number; y: number; scrollLeft: number; scrollTop: number }>({
    x: 0,
    y: 0,
    scrollLeft: 0,
    scrollTop: 0
  });

  const handleViewportMouseDown = (e: React.MouseEvent) => {
    if (currentTool === 'hand' || isSpacePanning) {
      if (!containerRef.current) return;
      isPanningRef.current = true;
      setIsPanningState(true);
      panStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        scrollLeft: containerRef.current.scrollLeft,
        scrollTop: containerRef.current.scrollTop
      };
      e.preventDefault();
    }
  };

  const handleViewportMouseMove = (e: React.MouseEvent) => {
    if (isPanningRef.current && containerRef.current) {
      const dx = e.clientX - panStartRef.current.x;
      const dy = e.clientY - panStartRef.current.y;
      containerRef.current.scrollLeft = panStartRef.current.scrollLeft - dx;
      containerRef.current.scrollTop = panStartRef.current.scrollTop - dy;
    }
  };

  const handleViewportMouseUp = () => {
    isPanningRef.current = false;
    setIsPanningState(false);
  };

  // Canvas refs for rendering the underlying PDF page
  const pageCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfDocRef = useRef<any>(null);

  // Save current state snapshot to undo history
  const pushHistory = (description: string, newPages = pages, newAnnotations = annotationsMap) => {
    const entry: EditorHistoryEntry = {
      pages: JSON.parse(JSON.stringify(newPages)),
      annotations: JSON.parse(JSON.stringify(newAnnotations)),
      description
    };
    const nextStack = historyStack.slice(0, historyIndex + 1);
    nextStack.push(entry);
    setHistoryStack(nextStack);
    setHistoryIndex(nextStack.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = historyStack[historyIndex - 1];
      setPages(prev.pages);
      setAnnotationsMap(prev.annotations);
      setHistoryIndex(historyIndex - 1);
    }
  };

  const handleRedo = () => {
    if (historyIndex < historyStack.length - 1) {
      const next = historyStack[historyIndex + 1];
      setPages(next.pages);
      setAnnotationsMap(next.annotations);
      setHistoryIndex(historyIndex + 1);
    }
  };



  // Contextual human-readable tool guidance for clarity
  const getToolGuide = () => {
    if (selectedAnnotationId) {
      return {
        title: 'Element Selected',
        hint: 'Drag to reposition, pull corner handle to resize, or press Delete / Backspace to remove.',
        badge: 'Del to delete • Esc to deselect'
      };
    }

    switch (currentTool) {
      case 'select':
        return {
          title: 'Select Mode (V)',
          hint: 'Click signatures, text, or shapes to drag & resize. Press Delete to remove selected element.',
          badge: 'Shortcuts: V for Select • H for Hand'
        };
      case 'hand':
        return {
          title: 'Hand / Pan Mode (H)',
          hint: 'Click and drag anywhere to pan smoothly across the document. You can also hold Spacebar anytime.',
          badge: 'H or Spacebar to pan'
        };
      case 'text':
        return {
          title: 'Text Annotation (T)',
          hint: 'Click anywhere on the document canvas to insert text. Adjust font size and color in the toolbar.',
          badge: 'T for Text • Enter to apply'
        };
      case 'draw':
        return {
          title: 'Freehand Pen (P)',
          hint: 'Click and drag freehand to draw vector ink. Switch stroke width and colors in the toolbar above.',
          badge: 'P or D for Pen'
        };
      case 'highlight':
        return {
          title: 'Highlighter (E)',
          hint: 'Click and drag over lines to highlight important text with translucent amber ink.',
          badge: 'E for Highlighter'
        };
      case 'rectangle':
        return {
          title: 'Rectangle Shape (R)',
          hint: 'Click and drag diagonally to draw a clean rectangular box.',
          badge: 'R for Box'
        };
      case 'circle':
        return {
          title: 'Circle Shape (O)',
          hint: 'Click and drag to create circular callouts and annotations.',
          badge: 'O or C for Circle'
        };
      case 'arrow':
        return {
          title: 'Arrow Pointer (A)',
          hint: 'Click at start and drag to destination to draw a direction arrow.',
          badge: 'A for Arrow'
        };
      case 'line':
        return {
          title: 'Straight Line (L)',
          hint: 'Click and drag to draw a clean divider line across sections.',
          badge: 'L for Line'
        };
      default:
        return {
          title: 'Editor Workspace',
          hint: 'Select a tool from the toolbar or press any keyboard shortcut to start annotating.',
          badge: 'Press ? for all shortcuts'
        };
    }
  };

  // Load document when file is selected
  useEffect(() => {
    if (!file) return;

    let isMounted = true;
    const loadDoc = async () => {
      try {
        setIsLoading(true);
        setLoadingMessage('Initializing PDF structure & rendering page thumbnails...');
        setErrorMessage(null);

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        if (!isMounted) return;
        pdfDocRef.current = pdf;

        const { pages: loadedPages } = await initializeEditorDocument(file);
        if (!isMounted) return;

        setPages(loadedPages);
        setCurrentPageNumber(1);
        setAnnotationsMap({});

        // Initialize history
        const initialEntry: EditorHistoryEntry = {
          pages: loadedPages,
          annotations: {},
          description: 'Document Opened'
        };
        setHistoryStack([initialEntry]);
        setHistoryIndex(0);
      } catch (err: any) {
        if (!isMounted) return;
        setErrorMessage(`Failed to load PDF: ${err.message || err}`);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadDoc();
    return () => {
      isMounted = false;
    };
  }, [file]);

  // Render active page onto canvas whenever currentPageNumber, rotation, or zoomScale changes
  useEffect(() => {
    if (!pdfDocRef.current || pages.length === 0) return;

    const activePage = pages.find((p) => p.pageNumber === currentPageNumber);
    if (!activePage || activePage.isDeleted) return;

    let renderTask: any = null;

    const renderPage = async () => {
      try {
        const page = await pdfDocRef.current.getPage(currentPageNumber);
        const totalRotation = (page.rotate + activePage.customRotation) % 360;

        const viewport = page.getViewport({
          scale: zoomScale,
          rotation: totalRotation
        });

        const canvas = pageCanvasRef.current;
        if (!canvas) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        renderTask = page.render({
          canvasContext: ctx,
          viewport
        } as any);

        await renderTask.promise;
      } catch (err: any) {
        if (err.name !== 'RenderingCancelledException') {
          console.error('Page render error:', err);
        }
      }
    };

    renderPage();

    return () => {
      if (renderTask) {
        renderTask.cancel();
      }
    };
  }, [currentPageNumber, pages, zoomScale]);

  // Reset viewport scroll to top when switching pages so page is immediately visible
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [currentPageNumber]);

  // Page operation handlers
  const handleRotatePage = (pageNum: number) => {
    const updated = pages.map((p) =>
      p.pageNumber === pageNum
        ? { ...p, customRotation: (p.customRotation + 90) % 360 }
        : p
    );
    setPages(updated);
    pushHistory('Rotate Page', updated, annotationsMap);
  };

  const handleMovePage = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= pages.length) return;

    const copy = [...pages];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, moved);

    setPages(copy);
    pushHistory(`Move Page ${direction}`, copy, annotationsMap);
  };

  const handleDeletePage = (pageNum: number) => {
    const activeRemaining = pages.filter((p) => !p.isDeleted && p.pageNumber !== pageNum);
    if (activeRemaining.length === 0) {
      setErrorMessage('A PDF document must contain at least one page.');
      return;
    }

    const updated = pages.map((p) =>
      p.pageNumber === pageNum ? { ...p, isDeleted: true } : p
    );
    setPages(updated);

    // Switch current page if active was deleted
    if (pageNum === currentPageNumber) {
      setCurrentPageNumber(activeRemaining[0].pageNumber);
    }

    pushHistory('Delete Page', updated, annotationsMap);
  };

  const handleExtractPage = async (pageNum: number) => {
    if (!file) return;
    try {
      setIsLoading(true);
      setLoadingMessage(`Extracting Page ${pageNum}...`);
      const extractedBlob = await extractPages(file, [pageNum]);
      triggerFileDownload(
        extractedBlob,
        `${file.name.replace(/\.[^/.]+$/, '')}_page_${pageNum}.pdf`
      );
      setSuccessMessage(`Page ${pageNum} extracted and downloaded successfully!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(`Failed to extract page: ${err.message || err}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMergePdf = async (secondFile: File) => {
    if (!file) return;
    try {
      setIsLoading(true);
      setLoadingMessage(`Merging pages from "${secondFile.name}"...`);
      const mergedBlob = await mergePdfs([file, secondFile]);
      const mergedFile = new File([mergedBlob], file.name, { type: 'application/pdf' });
      setFile(mergedFile);
      setSuccessMessage(`Appended pages from "${secondFile.name}" successfully!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(`Failed to append PDF: ${err.message || err}`);
      setIsLoading(false);
    }
  };

  // Annotation handlers
  const handleAddAnnotation = (ann: AnnotationItem) => {
    const list = annotationsMap[currentPageNumber] || [];
    const updatedList = [...list, { ...ann, pageNumber: currentPageNumber }];
    const newMap = { ...annotationsMap, [currentPageNumber]: updatedList };

    setAnnotationsMap(newMap);
    pushHistory('Add Annotation', pages, newMap);
  };

  const handleUpdateAnnotation = (id: string, updates: Partial<AnnotationItem>) => {
    const list = annotationsMap[currentPageNumber] || [];
    const updatedList: AnnotationItem[] = list.map((a) => (a.id === id ? ({ ...a, ...updates } as AnnotationItem) : a));
    const newMap: Record<number, AnnotationItem[]> = { ...annotationsMap, [currentPageNumber]: updatedList };
    setAnnotationsMap(newMap);
  };

  const handleRemoveAnnotation = (id: string) => {
    const list = annotationsMap[currentPageNumber] || [];
    const updatedList = list.filter((a) => a.id !== id);
    const newMap = { ...annotationsMap, [currentPageNumber]: updatedList };

    setAnnotationsMap(newMap);
    pushHistory('Delete Annotation', pages, newMap);
  };

  const handleClearPageAnnotations = () => {
    const newMap = { ...annotationsMap, [currentPageNumber]: [] };
    setAnnotationsMap(newMap);
    pushHistory('Clear Annotations', pages, newMap);
  };

  // Insert Digital Signature
  const handleInsertSignature = (dataUrl: string, width = 180, height = 70) => {
    const activePage = pages.find((p) => p.pageNumber === currentPageNumber);
    const pageWidth = activePage?.width || 600;
    const pageHeight = activePage?.height || 800;

    const initialX = Math.round((pageWidth - width) / 2);
    const initialY = Math.round(pageHeight * 0.7);

    const newSignature: SignatureAnnotation = {
      id: `sig_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      pageNumber: currentPageNumber,
      type: 'signature',
      dataUrl,
      x: Math.max(20, initialX),
      y: Math.max(20, initialY),
      width,
      height,
      color: '#000000'
    };

    handleAddAnnotation(newSignature);
    setCurrentTool('select');
    setSuccessMessage('Signature placed! Click and drag to move or resize.');
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  // Insert Document Stamp / Badge
  const handleSelectStamp = (stamp: Omit<StampAnnotation, 'id' | 'pageNumber' | 'x' | 'y'>) => {
    const activePage = pages.find((p) => p.pageNumber === currentPageNumber);
    const pageWidth = activePage?.width || 600;
    const pageHeight = activePage?.height || 800;

    const initialX = Math.round((pageWidth - stamp.width) / 2);
    const initialY = Math.round(pageHeight * 0.45);

    const newStamp: StampAnnotation = {
      ...stamp,
      id: `stamp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      pageNumber: currentPageNumber,
      x: Math.max(20, initialX),
      y: Math.max(20, initialY)
    };

    handleAddAnnotation(newStamp);
    setCurrentTool('select');
    setSuccessMessage('Stamp placed! Click and drag to position.');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Zoom helpers
  const handleFitWidth = () => {
    if (!containerRef.current || pages.length === 0) return;
    const activePage = pages.find((p) => p.pageNumber === currentPageNumber);
    if (!activePage) return;

    const availableWidth = containerRef.current.clientWidth - 80;
    const scale = availableWidth / activePage.width;
    setZoomScale(Math.max(0.4, Math.min(2.5, scale)));
  };

  const handleFitPage = () => {
    if (!containerRef.current || pages.length === 0) return;
    const activePage = pages.find((p) => p.pageNumber === currentPageNumber);
    if (!activePage) return;

    const availableHeight = containerRef.current.clientHeight - 80;
    const scale = availableHeight / activePage.height;
    setZoomScale(Math.max(0.4, Math.min(2.5, scale)));
  };

  // Export & Download PDF
  const handleExportPdf = async () => {
    if (!file) return;
    try {
      setIsExporting(true);
      const exportedBlob = await exportEditedPdf(file, pages, annotationsMap);
      const baseName = file.name.replace(/\.[^/.]+$/, '');
      triggerFileDownload(exportedBlob, `${baseName}_edited.pdf`);
      setSuccessMessage('Edited PDF exported and downloaded successfully!');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(`Export failed: ${err.message || err}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Flatten & Download PDF
  const handleFlattenPdf = async () => {
    if (!file) return;
    try {
      setIsExporting(true);
      setLoadingMessage('Baking vector layers and flattening document...');
      const exportedBlob = await exportEditedPdf(file, pages, annotationsMap);
      const editedFile = new File([exportedBlob], file.name, { type: 'application/pdf' });
      const flattenedBlob = await flattenPdf(editedFile, (percent, msg) => {
        setLoadingMessage(`${msg} (${percent}%)`);
      });
      const baseName = file.name.replace(/\.[^/.]+$/, '');
      triggerFileDownload(flattenedBlob, `${baseName}_flattened.pdf`);
      setSuccessMessage('PDF flattened permanently and downloaded!');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(`Flatten failed: ${err.message || err}`);
    } finally {
      setIsExporting(false);
      setLoadingMessage('');
    }
  };

  // ========================================================
  // Synchronized Global Keyboard Controls
  // ========================================================
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcut keys when the user is typing in a text field
      const activeEl = document.activeElement;
      const isTyping =
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          (activeEl as HTMLElement).isContentEditable);

      if (isTyping) {
        if (e.key === 'Escape') {
          (activeEl as HTMLElement).blur();
        }
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const isCmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // 1. Save Document: Cmd+S or Ctrl+S
      if (isCmdOrCtrl && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleExportPdf();
        return;
      }

      // 2. Undo / Redo
      if (isCmdOrCtrl && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
        return;
      }
      if (isCmdOrCtrl && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
        return;
      }

      // 3. Zoom Controls: Cmd+=, Cmd+-, Cmd+0, +, -, 0
      if ((isCmdOrCtrl && (e.key === '=' || e.key === '+')) || (!isCmdOrCtrl && (e.key === '=' || e.key === '+'))) {
        if (isCmdOrCtrl) e.preventDefault();
        setZoomScale((z) => Math.min(2.5, z + 0.15));
        return;
      }
      if ((isCmdOrCtrl && (e.key === '-' || e.key === '_')) || (!isCmdOrCtrl && (e.key === '-' || e.key === '_'))) {
        if (isCmdOrCtrl) e.preventDefault();
        setZoomScale((z) => Math.max(0.4, z - 0.15));
        return;
      }
      if (isCmdOrCtrl && e.key === '0') {
        e.preventDefault();
        handleFitWidth();
        return;
      }

      // 4. Delete / Backspace: Delete selected element
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedAnnotationId) {
          e.preventDefault();
          handleRemoveAnnotation(selectedAnnotationId);
          setSelectedAnnotationId(null);
          setSuccessMessage('Element removed');
          setTimeout(() => setSuccessMessage(null), 2000);
        }
        return;
      }

      // 5. Escape: Dismiss modals or deselect
      if (e.key === 'Escape') {
        if (isShortcutsModalOpen) {
          setIsShortcutsModalOpen(false);
          return;
        }
        if (isSignatureModalOpen) {
          setIsSignatureModalOpen(false);
          return;
        }
        if (isStampModalOpen) {
          setIsStampModalOpen(false);
          return;
        }
        if (selectedAnnotationId) {
          setSelectedAnnotationId(null);
          return;
        }
        if (currentTool !== 'select') {
          setCurrentTool('select');
          return;
        }
      }

      // 6. Hold Spacebar for temporary pan
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        setIsSpacePanning(true);
        return;
      }

      // If modifiers are held, do not interpret standard letter keys
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      // 7. Page Navigation: [ or ] or ArrowLeft or ArrowRight
      const activePages = pages.filter((p) => !p.isDeleted);
      if (e.key === '[' || e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        setCurrentPageNumber((p) => Math.max(1, p - 1));
        return;
      }
      if (e.key === ']' || e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        setCurrentPageNumber((p) => Math.min(activePages.length || 1, p + 1));
        return;
      }

      // 8. Rotate Current Page: Shift + R
      if (e.shiftKey && e.key.toUpperCase() === 'R') {
        e.preventDefault();
        handleRotatePage(currentPageNumber);
        return;
      }

      // 9. Shortcuts Guide Cheatsheet: ?
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setIsShortcutsModalOpen((prev) => !prev);
        return;
      }

      // 10. Single Key Tool Switching
      switch (e.key.toLowerCase()) {
        case 'v':
          setCurrentTool('select');
          break;
        case 'h':
          setCurrentTool('hand');
          break;
        case 't':
          setCurrentTool('text');
          break;
        case 'p':
        case 'd':
          setCurrentTool('draw');
          break;
        case 'e':
          setCurrentTool('highlight');
          break;
        case 's':
          setIsSignatureModalOpen(true);
          break;
        case 'm':
          setIsStampModalOpen(true);
          break;
        case 'r':
          setCurrentTool('rectangle');
          break;
        case 'o':
        case 'c':
          setCurrentTool('circle');
          break;
        case 'a':
          setCurrentTool('arrow');
          break;
        case 'l':
          setCurrentTool('line');
          break;
        case '0':
          handleFitWidth();
          break;
        default:
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePanning(false);
        isPanningRef.current = false;
        setIsPanningState(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [
    selectedAnnotationId,
    isShortcutsModalOpen,
    isSignatureModalOpen,
    isStampModalOpen,
    currentTool,
    currentPageNumber,
    pages,
    historyIndex,
    historyStack.length,
    file,
    annotationsMap
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ]);

  const activePage = pages.find((p) => p.pageNumber === currentPageNumber);
  const activePages = pages.filter((p) => !p.isDeleted);

  // Drop zone if no file is loaded yet
  if (!file) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="max-w-md w-full p-8 rounded-3xl bg-[#09090d]/80 border border-white/10 backdrop-blur-2xl shadow-2xl flex flex-col items-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center drop-shadow-[0_0_20px_rgba(245,158,11,0.25)]">
            <Upload className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-extrabold text-white">Open PDF in Editor</h2>
          <p className="text-xs text-white/60 leading-relaxed">
            Reorder pages, rotate, delete, insert text stamps, draw highlights, and extract pages. 100% in-browser and private.
          </p>

          <label className="w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-semibold text-sm cursor-pointer shadow-lg shadow-amber-400/20 transition-all flex items-center justify-center gap-2">
            <Upload className="w-4 h-4" />
            <span>Select PDF File</span>
            <input
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setFile(f);
              }}
            />
          </label>
        </div>
      </div>
    );
  }

  const toolGuide = getToolGuide();

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] max-h-[calc(100vh-4rem)] min-h-0 bg-[#040406] overflow-hidden select-none">
      {/* Top Editor Toolbar */}
      <EditorToolbar
        currentTool={currentTool}
        onSelectTool={setCurrentTool}
        currentColor={currentColor}
        onSelectColor={setCurrentColor}
        strokeWidth={strokeWidth}
        onSelectStrokeWidth={setStrokeWidth}
        fontSize={fontSize}
        onSelectFontSize={setFontSize}
        zoomScale={zoomScale}
        onZoomChange={setZoomScale}
        onFitWidth={handleFitWidth}
        onFitPage={handleFitPage}
        currentPage={currentPageNumber}
        totalPages={activePages.length}
        onPageChange={(p) => setCurrentPageNumber(p)}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < historyStack.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onClearPageAnnotations={handleClearPageAnnotations}
        hasSelectedAnnotation={Boolean(selectedAnnotationId)}
        onDeleteSelectedAnnotation={() => {
          if (selectedAnnotationId) {
            handleRemoveAnnotation(selectedAnnotationId);
            setSelectedAnnotationId(null);
            setSuccessMessage('Element removed');
            setTimeout(() => setSuccessMessage(null), 2000);
          }
        }}
        onExportPdf={handleExportPdf}
        isExporting={isExporting}
        onOpenSignatureModal={() => setIsSignatureModalOpen(true)}
        onOpenStampModal={() => setIsStampModalOpen(true)}
        onOpenShortcutsModal={() => setIsShortcutsModalOpen(true)}
        onRotateCurrentPage={() => handleRotatePage(currentPageNumber)}
        onFlattenPdf={handleFlattenPdf}
        isReaderMode={isReaderMode}
        onToggleReaderMode={() => setIsReaderMode(!isReaderMode)}
      />

      {/* Contextual Intuitive Guidance & Shortcuts Indicator Bar */}
      <div className="px-4 py-1.5 bg-[#08080c] border-b border-white/[0.06] flex items-center justify-between text-xs gap-3 flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
          <span className="font-bold text-white text-[11px] whitespace-nowrap">
            {toolGuide.title}:
          </span>
          <span className="text-white/60 text-[11px] truncate hidden sm:inline">
            {toolGuide.hint}
          </span>
          <span className="text-amber-400/90 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full font-mono text-[10px] hidden md:inline whitespace-nowrap">
            {toolGuide.badge}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="font-mono text-[10px] text-white/30 hidden lg:inline">
            {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
          </span>
          <button
            onClick={() => setIsShortcutsModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/10 transition-colors text-[10px] font-mono cursor-pointer"
            title="View All Keyboard Shortcuts (Shortcut: ?)"
          >
            <span>Shortcuts</span>
            <kbd className="px-1 rounded bg-amber-400/20 text-amber-300 text-[9px] font-bold">?</kbd>
          </button>
        </div>
      </div>

      {/* Status Notifications & Notices */}
      {errorMessage && (
        <div className="px-4 py-2 bg-rose-500/10 border-b border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-white">✕</button>
        </div>
      )}

      {successMessage && (
        <div className="px-4 py-2 bg-emerald-500/10 border-b border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden relative min-h-0 min-w-0">
        {/* Left Thumbnails Sidebar */}
        {!isReaderMode && (
          <ThumbnailSidebar
            pages={pages}
            currentPageNumber={currentPageNumber}
            onSelectPage={setCurrentPageNumber}
            onRotatePage={handleRotatePage}
            onMovePage={handleMovePage}
            onDeletePage={handleDeletePage}
            onExtractPage={handleExtractPage}
            onMergePdf={handleMergePdf}
          />
        )}

        {/* Central Document Canvas Scroll Viewport */}
        <main
          ref={containerRef}
          onMouseDown={handleViewportMouseDown}
          onMouseMove={handleViewportMouseMove}
          onMouseUp={handleViewportMouseUp}
          onMouseLeave={handleViewportMouseUp}
          className={`flex-1 min-w-0 min-h-0 h-full overflow-auto bg-[#09090c]/70 p-6 flex relative custom-scrollbar ${
            currentTool === 'hand' || isSpacePanning
              ? isPanningState
                ? 'cursor-grabbing select-none'
                : 'cursor-grab'
              : ''
          }`}
        >
          {isLoading && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
              <span className="text-xs text-white/80 font-mono">{loadingMessage}</span>
            </div>
          )}

          {activePage && (
            <div
              className="m-auto relative shadow-2xl rounded-sm border border-white/10 bg-white flex-shrink-0"
              style={{
                width: activePage.width * zoomScale,
                height: activePage.height * zoomScale
              }}
            >
              {/* Underlying Rendered PDF Canvas */}
              <canvas
                ref={pageCanvasRef}
                className="block w-full h-full pointer-events-none"
              />

              {/* Interactive Vector Annotation Overlay */}
              <CanvasOverlay
                pageWidth={activePage.width}
                pageHeight={activePage.height}
                zoomScale={zoomScale}
                currentTool={isSpacePanning ? 'hand' : currentTool}
                currentColor={currentColor}
                strokeWidth={strokeWidth}
                fontSize={fontSize}
                annotations={annotationsMap[currentPageNumber] || []}
                onAddAnnotation={handleAddAnnotation}
                onRemoveAnnotation={handleRemoveAnnotation}
                onUpdateAnnotation={handleUpdateAnnotation}
                selectedId={selectedAnnotationId}
                onSelectId={setSelectedAnnotationId}
              />
            </div>
          )}
        </main>
      </div>

      {/* Digital Signature Studio Modal */}
      <SignatureModal
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        onInsertSignature={handleInsertSignature}
      />

      {/* Document Stamp / Badges Picker Modal */}
      <StampPickerModal
        isOpen={isStampModalOpen}
        onClose={() => setIsStampModalOpen(false)}
        onSelectStamp={handleSelectStamp}
      />

      {/* Keyboard Shortcuts Cheatsheet Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />
    </div>
  );
};
