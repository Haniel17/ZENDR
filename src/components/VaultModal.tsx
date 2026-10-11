import React, { useState } from 'react';
import { useVault } from '../context/VaultContext';
import { useAuth } from '../context/AuthContext';
import { X, Trash2, Copy, Check, Clock, Database, Maximize2 } from 'lucide-react';

interface VaultModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};

const timeAgo = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export const VaultModal: React.FC<VaultModalProps> = ({ isOpen, onClose }) => {
  const { conversions, deleteFromVault, isLoadingVault } = useVault();
  const { user, dbStatus } = useAuth();
  const [filter, setFilter] = useState<'all' | 'png-to-svg' | 'svg-to-png'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filtered = conversions.filter((c) => {
    if (filter === 'all') return true;
    return c.mode === filter;
  });

  const handleCopyCode = async (id: string, snippet?: string) => {
    if (!snippet) return;
    try {
      await navigator.clipboard.writeText(snippet);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl futuristic-card border border-white/15 bg-[#090a0e]/95 text-left shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Conversion Vault
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-400 font-mono text-[10px]">
                  {conversions.length} saved
                </span>
              </div>
              <p className="text-xs text-white/50">
                Connected as <span className="text-amber-400 font-medium">@{user?.username}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="px-6 py-3 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-1.5 p-1 rounded-xl futuristic-pill text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filter === 'all' ? 'bg-amber-400 text-black font-bold' : 'text-white/60 hover:text-white'
              }`}
            >
              All ({conversions.length})
            </button>
            <button
              onClick={() => setFilter('png-to-svg')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filter === 'png-to-svg' ? 'bg-amber-400 text-black font-bold' : 'text-white/60 hover:text-white'
              }`}
            >
              PNG → SVG
            </button>
            <button
              onClick={() => setFilter('svg-to-png')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filter === 'svg-to-png' ? 'bg-amber-400 text-black font-bold' : 'text-white/60 hover:text-white'
              }`}
            >
              SVG → PNG
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-mono text-white/40">
            <span className={`w-2 h-2 rounded-full ${dbStatus.isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span>{dbStatus.isConnected ? 'MongoDB Synced' : 'Local Synced'}</span>
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {isLoadingVault ? (
            <div className="py-12 text-center text-white/50 space-y-2">
              <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs">Fetching conversions from MongoDB...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center mx-auto text-white/40">
                <Database className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">Your Vault is Empty</h4>
                <p className="text-xs text-white/50 max-w-xs mx-auto">
                  Run an image conversion in ZENDR and tap <span className="text-amber-400 font-semibold">"Save to Vault"</span> to sync it here.
                </p>
              </div>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item._id}
                className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all"
              >
                {/* Left: Info */}
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                      item.mode === 'png-to-svg'
                        ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                        : 'bg-purple-400/20 text-purple-300 border border-purple-400/30'
                    }`}>
                      {item.mode === 'png-to-svg' ? 'PNG → SVG' : 'SVG → PNG'}
                    </span>
                    <h5 className="text-sm font-semibold text-white truncate max-w-xs">
                      {item.fileName}
                    </h5>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-white/50">
                    <span className="flex items-center gap-1">
                      <Maximize2 className="w-3 h-3 text-white/40" />
                      {item.width} × {item.height}
                    </span>
                    <span>•</span>
                    <span>
                      {formatFileSize(item.fileSizeBytes)} → {formatFileSize(item.outputSizeBytes)}
                    </span>
                    {item.pathCount ? (
                      <>
                        <span>•</span>
                        <span className="text-amber-400">{item.pathCount} paths</span>
                      </>
                    ) : null}
                    <span>•</span>
                    <span className="flex items-center gap-1 text-white/40">
                      <Clock className="w-3 h-3" />
                      {timeAgo(item.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  {item.previewSvgSnippet && (
                    <button
                      onClick={() => handleCopyCode(item._id, item.previewSvgSnippet)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/10 text-white text-xs font-medium border border-white/10 transition-colors"
                      title="Copy SVG XML"
                    >
                      {copiedId === item._id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy XML</span>
                        </>
                      )}
                    </button>
                  )}

                  <button
                    onClick={() => deleteFromVault(item._id)}
                    className="p-2 rounded-xl text-white/40 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
