import React from 'react';
import {
  Calendar,
  Check,
  X,
  ShieldAlert,
  CheckCircle2,
  DollarSign,
  PenTool
} from 'lucide-react';
import type { StampAnnotation } from './types';

interface StampPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStamp: (stamp: Omit<StampAnnotation, 'id' | 'pageNumber' | 'x' | 'y'>) => void;
}

const TODAY_FORMATTED = new Date().toLocaleDateString('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric'
});

export const StampPickerModal: React.FC<StampPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectStamp
}) => {
  if (!isOpen) return null;

  const todayFormatted = TODAY_FORMATTED;

  const STAMPS = [
    {
      stampType: 'date' as const,
      title: 'Current Date Stamp',
      subtitle: todayFormatted,
      text: todayFormatted,
      color: '#09090b',
      icon: <Calendar className="w-4 h-4 text-amber-400" />,
      width: 130,
      height: 32,
      preview: (
        <div className="px-3 py-1 rounded border border-zinc-700 bg-zinc-900 text-xs font-mono font-semibold text-amber-400">
          📅 {todayFormatted}
        </div>
      )
    },
    {
      stampType: 'checkmark' as const,
      title: 'Checkmark Stamp',
      subtitle: 'Form check indicator',
      text: '✓',
      color: '#10b981',
      icon: <Check className="w-4 h-4 text-emerald-400" />,
      width: 36,
      height: 36,
      preview: (
        <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold text-lg">
          ✓
        </div>
      )
    },
    {
      stampType: 'cross' as const,
      title: 'Crossmark Stamp',
      subtitle: 'Form cross indicator',
      text: '✗',
      color: '#ef4444',
      icon: <X className="w-4 h-4 text-rose-400" />,
      width: 36,
      height: 36,
      preview: (
        <div className="w-8 h-8 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center font-bold text-lg">
          ✗
        </div>
      )
    },
    {
      stampType: 'approved' as const,
      title: 'APPROVED',
      subtitle: 'Official approval stamp',
      text: 'APPROVED',
      color: '#10b981',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
      width: 140,
      height: 44,
      preview: (
        <div className="px-3 py-1.5 rounded-lg border-2 border-emerald-500 text-emerald-400 font-extrabold tracking-widest text-xs uppercase bg-emerald-500/10">
          APPROVED
        </div>
      )
    },
    {
      stampType: 'confidential' as const,
      title: 'CONFIDENTIAL',
      subtitle: 'Restricted document tag',
      text: 'CONFIDENTIAL',
      color: '#ef4444',
      icon: <ShieldAlert className="w-4 h-4 text-rose-400" />,
      width: 150,
      height: 44,
      preview: (
        <div className="px-3 py-1.5 rounded-lg border-2 border-rose-500 text-rose-400 font-extrabold tracking-widest text-xs uppercase bg-rose-500/10">
          CONFIDENTIAL
        </div>
      )
    },
    {
      stampType: 'paid' as const,
      title: 'PAID',
      subtitle: 'Invoice receipt stamp',
      text: 'PAID',
      color: '#06b6d4',
      icon: <DollarSign className="w-4 h-4 text-cyan-400" />,
      width: 110,
      height: 44,
      preview: (
        <div className="px-3 py-1.5 rounded-lg border-2 border-cyan-500 text-cyan-400 font-extrabold tracking-widest text-xs uppercase bg-cyan-500/10">
          PAID
        </div>
      )
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-[28px] liquid-glass-card shadow-2xl overflow-hidden flex flex-col text-white">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center">
              <PenTool className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-white">Document Stamps &amp; Badges</h2>
              <p className="text-xs text-white/50">Quick contract dates, approvals, &amp; checkboxes</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.04] hover:bg-white/[0.1] border border-white/5 flex items-center justify-center text-white/50 hover:text-white transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* List of Stamps */}
        <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
          {STAMPS.map((stamp) => (
            <div
              key={stamp.stampType}
              onClick={() => {
                onSelectStamp({
                  type: 'stamp',
                  stampType: stamp.stampType,
                  text: stamp.text,
                  color: stamp.color,
                  width: stamp.width,
                  height: stamp.height
                });
                onClose();
              }}
              className="group p-3 rounded-[18px] border border-white/5 hover:border-amber-400/40 bg-white/[0.02] hover:bg-white/[0.05] transition-all cursor-pointer flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center">
                  {stamp.icon}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                    {stamp.title}
                  </h4>
                  <p className="text-[10px] text-white/40">{stamp.subtitle}</p>
                </div>
              </div>

              <div>{stamp.preview}</div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/[0.08] bg-white/[0.01] flex justify-end">
          <button
            onClick={onClose}
            className="btn-secondary text-xs px-5 py-2 rounded-full"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
