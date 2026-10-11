import React from 'react';
import { X, Command, Keyboard } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUT_GROUPS = [
  {
    category: 'Creation & Tools',
    shortcuts: [
      { key: 'V', desc: 'Select / Move / Resize Tool' },
      { key: 'H', desc: 'Hand / Pan Document View' },
      { key: 'Space', desc: 'Hold Spacebar to Pan smoothly' },
      { key: 'S', desc: 'Open Digital Signature Studio' },
      { key: 'T', desc: 'Edit PDF Text / Insert Text' },
      { key: 'W', desc: 'Whiteout / Mask Eraser Tool' },
      { key: 'P / D', desc: 'Freehand Draw / Pen' },
      { key: 'E', desc: 'Document Highlighter' },
      { key: 'M', desc: 'Document Stamp & Status Badges' },
      { key: 'R', desc: 'Rectangle Shape' },
      { key: 'O / C', desc: 'Circle / Oval Shape' },
      { key: 'A', desc: 'Arrow Pointer' },
      { key: 'L', desc: 'Straight Line' }
    ]
  },
  {
    category: 'Editing & Selection',
    shortcuts: [
      { key: 'Double-Click', desc: 'Edit any PDF text or annotation in-place' },
      { key: '⌘Z / Ctrl+Z', desc: 'Undo last stroke or action' },
      { key: '⌘⇧Z / Ctrl+Y', desc: 'Redo previously undone action' },
      { key: 'Delete / ⌫', desc: 'Delete currently selected element' },
      { key: 'Esc', desc: 'Deselect element or dismiss editor' }
    ]
  },
  {
    category: 'View & Navigation',
    shortcuts: [
      { key: '[  /  ←', desc: 'Go to Previous Page' },
      { key: ']  /  →', desc: 'Go to Next Page' },
      { key: '+  /  =', desc: 'Zoom In (+15%)' },
      { key: '-  /  _', desc: 'Zoom Out (-15%)' },
      { key: '0', desc: 'Fit Document to Window Width' },
      { key: '⇧R', desc: 'Rotate Active Page (+90°)' }
    ]
  },
  {
    category: 'File & Document',
    shortcuts: [
      { key: '⌘S / Ctrl+S', desc: 'Export and download edited PDF' },
      { key: '?', desc: 'Toggle this Shortcuts Guide' }
    ]
  }
];

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150 select-none">
      <div
        className="w-full max-w-2xl bg-[#09090e]/95 border border-white/10 rounded-[28px] liquid-glass-card shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Keyboard Shortcuts
              </h3>
              <p className="text-[11px] font-mono text-white/50">
                Speed up your document workflow with synced keyboard controls
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-white/60 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar text-xs">
          {SHORTCUT_GROUPS.map((group) => (
            <div key={group.category} className="space-y-2.5">
              <h4 className="text-[11px] font-mono uppercase tracking-wider text-amber-400/90 font-semibold">
                {group.category}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {group.shortcuts.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/10 transition-colors"
                  >
                    <span className="text-white/70 text-[11px]">{item.desc}</span>
                    <kbd className="px-2 py-0.5 rounded-full bg-white/[0.08] border border-white/10 font-mono text-[10px] font-semibold text-amber-300 shadow-sm flex items-center gap-1">
                      {item.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/[0.08] bg-white/[0.01] flex items-center justify-between text-[11px] font-mono text-white/40">
          <span className="flex items-center gap-1.5">
            <Command className="w-3 h-3 text-amber-400" />
            <span>Shortcuts are active across the canvas</span>
          </span>
          <button
            onClick={onClose}
            className="btn-secondary text-xs px-5 py-2 rounded-full"
          >
            Got it (Esc)
          </button>
        </div>
      </div>
    </div>
  );
};
