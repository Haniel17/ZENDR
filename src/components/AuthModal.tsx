import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail, User, Shield, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'login',
}) => {
  const { login, register, dbStatus } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>(defaultMode);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    if (tab === 'register') {
      if (!username.trim() || !email.trim() || !password) {
        setErrorMsg('Please fill in all fields.');
        setIsSubmitting(false);
        return;
      }
      const res = await register(username, email, password);
      if (res.success) {
        setSuccessMsg('Account created! Welcome to ZENDR.');
        setTimeout(() => onClose(), 1200);
      } else {
        setErrorMsg(res.error || 'Registration failed.');
      }
    } else {
      if (!email.trim() || !password) {
        setErrorMsg('Please enter your email and password.');
        setIsSubmitting(false);
        return;
      }
      const res = await login(email, password);
      if (res.success) {
        setSuccessMsg('Logged in successfully!');
        setTimeout(() => onClose(), 1000);
      } else {
        setErrorMsg(res.error || 'Invalid credentials.');
      }
    }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-md rounded-3xl futuristic-card border border-white/15 p-6 sm:p-8 bg-[#090a0e]/90 text-left shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-2 mb-6">
          <img
            src="/Zendr.png"
            alt="ZENDR Logo"
            className="h-8 sm:h-9 w-auto max-w-[180px] object-contain mx-auto drop-shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-opacity opacity-90 hover:opacity-100"
          />
          <p className="text-xs text-white/60 max-w-xs mx-auto leading-relaxed">
            Cloud sync past conversions, store raw SVG code &amp; access your presets anywhere.
          </p>
          <div className="pt-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-400/10 border border-amber-400/20 text-amber-400 font-mono text-[10px]">
              <Shield className="w-3 h-3" />
              <span>100% Optional • No Gatekeeping</span>
            </span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-[#0c0d10] border border-white/[0.08] mb-6">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setErrorMsg(null);
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              tab === 'login'
                ? 'bg-amber-400 text-black shadow-sm'
                : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setErrorMsg(null);
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              tab === 'register'
                ? 'bg-amber-400 text-black shadow-sm'
                : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Feedback Messages */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center gap-2.5 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-2.5 text-emerald-300 text-xs">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === 'register' && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/70 block">
                Creator Username
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  placeholder="e.g. pixel_ninja"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-amber-400 focus:bg-white/[0.07] transition-all"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white/70 block">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="email"
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-amber-400 focus:bg-white/[0.07] transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white/70 block">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-amber-400 focus:bg-white/[0.07] transition-all"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 btn-primary py-2.5 rounded-lg text-xs sm:text-sm font-semibold"
          >
            {isSubmitting
              ? tab === 'login'
                ? 'Signing In...'
                : 'Creating Account...'
              : tab === 'login'
              ? 'Sign In'
              : 'Create Account'}
          </button>
        </form>

        {/* MongoDB Connection Status Footer */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-white/40">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                dbStatus.isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span>
              {dbStatus.isConnected ? 'MongoDB Connected' : 'Local Storage Fallback'}
            </span>
          </div>

          <div className="flex items-center gap-1 text-white/50">
            <Shield className="w-3 h-3 text-emerald-400" />
            <span>Encrypted Auth</span>
          </div>
        </div>
      </div>
    </div>
  );
};
