import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useVault } from '../context/VaultContext';
import {
  Database,
  LogOut,
  User as UserIcon,
  FileText,
  Edit3,
  Braces,
  ChevronDown,
  Merge,
  Scissors,
  FileCheck,
  RotateCw,
  Minimize2,
  ArrowDownUp,
  Table,
  Presentation,
  FileImage,
  Image,
  FileUp,
  ArrowRight,
  ShieldCheck,
  Code,
  FileCode,
  Binary
} from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';

interface NavbarProps {
  onOpenAuth: () => void;
  onOpenVault: () => void;
}

const DATA_DROPDOWN_GROUPS = [
  {
    title: 'JSON & Spreadsheets',
    items: [
      {
        id: 'text-to-json',
        title: 'Text to JSON',
        subtitle: 'Key-values, lists & server logs',
        route: '/text-to-json',
        icon: Braces,
        badge: 'Universal'
      },
      {
        id: 'csv-to-json',
        title: 'CSV to JSON',
        subtitle: 'Tabular spreadsheets to JSON arrays',
        route: '/csv-to-json',
        icon: Table,
        badge: 'Table'
      },
      {
        id: 'json-to-csv',
        title: 'JSON to CSV',
        subtitle: 'Export nested objects to spreadsheet',
        route: '/json-to-csv',
        icon: Table
      }
    ]
  },
  {
    title: 'Configs & Markup',
    items: [
      {
        id: 'yaml-to-json',
        title: 'YAML to JSON',
        subtitle: 'Kubernetes, Docker & CI/CD configs',
        route: '/yaml-to-json',
        icon: FileCode,
        badge: 'DevOps'
      },
      {
        id: 'json-to-yaml',
        title: 'JSON to YAML',
        subtitle: 'Serialize JSON payloads to clean YAML',
        route: '/json-to-yaml',
        icon: FileCode
      },
      {
        id: 'xml-to-json',
        title: 'XML to JSON',
        subtitle: 'Web services, RSS feeds & XML nodes',
        route: '/xml-to-json',
        icon: Code,
        badge: 'XML'
      },
      {
        id: 'json-to-xml',
        title: 'JSON to XML',
        subtitle: 'Generate structured XML trees from JSON',
        route: '/json-to-xml',
        icon: Code
      }
    ]
  },
  {
    title: 'Encodings & Utils',
    items: [
      {
        id: 'base64-converter',
        title: 'Base64 Encoder / Decoder',
        subtitle: 'Two-way UTF-8 & binary string encode',
        route: '/base64-converter',
        icon: Binary,
        badge: 'Two-Way'
      },
      {
        id: 'json-beautifier',
        title: 'JSON Beautifier & Minifier',
        subtitle: 'Custom indenting & syntax formatting',
        route: '/text-to-json',
        icon: Braces
      }
    ]
  }
];

const PDF_DROPDOWN_GROUPS = [
  {
    title: 'Organize & Edit',
    items: [
      {
        id: 'pdf-editor',
        title: 'PDF Visual Editor',
        subtitle: 'Sign, stamp, draw & annotate',
        route: '/pdf-editor',
        icon: Edit3,
        badge: 'Sign'
      },
      {
        id: 'merge-pdf',
        title: 'Merge Multiple PDFs',
        subtitle: 'Combine into single file',
        route: '/pdf-converter/merge-pdf',
        icon: Merge
      },
      {
        id: 'split-pdf',
        title: 'Split by Range',
        subtitle: 'Extract page sets',
        route: '/pdf-converter/split-pdf',
        icon: Scissors
      },
      {
        id: 'extract-pages',
        title: 'Extract Pages',
        subtitle: 'Pull select individual pages',
        route: '/pdf-converter/extract-pages',
        icon: FileCheck
      },
      {
        id: 'rotate-pdf',
        title: 'Rotate Pages',
        subtitle: '90°, 180°, 270° orientation',
        route: '/pdf-converter/rotate-pdf',
        icon: RotateCw
      },
      {
        id: 'compress-pdf',
        title: 'Compress PDF',
        subtitle: 'Shrink file size & optimize',
        route: '/pdf-compressor',
        icon: Minimize2
      },
      {
        id: 'reorder-pdf',
        title: 'Reorder Pages',
        subtitle: 'Rearrange page sequence',
        route: '/pdf-converter/reorder-pdf',
        icon: ArrowDownUp
      }
    ]
  },
  {
    title: 'Convert from PDF',
    items: [
      {
        id: 'pdf-to-docx',
        title: 'PDF to Word',
        subtitle: 'Editable DOCX document',
        route: '/pdf-converter/pdf-to-docx',
        icon: FileText
      },
      {
        id: 'pdf-to-xlsx',
        title: 'PDF to Excel',
        subtitle: 'Extract structured tables',
        route: '/pdf-converter/pdf-to-xlsx',
        icon: Table
      },
      {
        id: 'pdf-to-pptx',
        title: 'PDF to PowerPoint',
        subtitle: 'Editable slide presentation',
        route: '/pdf-converter/pdf-to-pptx',
        icon: Presentation
      },
      {
        id: 'pdf-to-png',
        title: 'PDF to PNG',
        subtitle: 'High-DPI raster images',
        route: '/pdf-converter/pdf-to-png',
        icon: FileImage
      },
      {
        id: 'pdf-to-jpg',
        title: 'PDF to JPG',
        subtitle: 'Sharp image pages',
        route: '/pdf-converter/pdf-to-jpg',
        icon: Image
      }
    ]
  },
  {
    title: 'Convert to PDF',
    items: [
      {
        id: 'docx-to-pdf',
        title: 'Word to PDF',
        subtitle: 'DOCX documents to PDF',
        route: '/pdf-converter/docx-to-pdf',
        icon: FileUp
      },
      {
        id: 'xlsx-to-pdf',
        title: 'Excel to PDF',
        subtitle: 'Spreadsheet tables to PDF',
        route: '/pdf-converter/xlsx-to-pdf',
        icon: Table
      },
      {
        id: 'pptx-to-pdf',
        title: 'PowerPoint to PDF',
        subtitle: 'Presentations to PDF',
        route: '/pdf-converter/pptx-to-pdf',
        icon: Presentation
      },
      {
        id: 'png-to-pdf',
        title: 'PNG to PDF',
        subtitle: 'Lossless graphics to PDF',
        route: '/pdf-converter/png-to-pdf',
        icon: FileImage
      },
      {
        id: 'jpg-to-pdf',
        title: 'JPG to PDF',
        subtitle: 'Photos and scans to PDF',
        route: '/pdf-converter/jpg-to-pdf',
        icon: Image
      }
    ]
  }
];

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAuth,
  onOpenVault,
}) => {
  const { user, logout, dbStatus } = useAuth();
  const { conversions } = useVault();
  const [isPdfDropdownOpen, setIsPdfDropdownOpen] = useState(false);
  const [isDataDropdownOpen, setIsDataDropdownOpen] = useState(false);
  const pdfTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dataTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handlePdfMouseEnter = () => {
    if (pdfTimeoutRef.current) {
      clearTimeout(pdfTimeoutRef.current);
      pdfTimeoutRef.current = null;
    }
    if (dataTimeoutRef.current) {
      clearTimeout(dataTimeoutRef.current);
      dataTimeoutRef.current = null;
    }
    setIsDataDropdownOpen(false);
    setIsPdfDropdownOpen(true);
  };

  const handlePdfMouseLeave = () => {
    pdfTimeoutRef.current = setTimeout(() => {
      setIsPdfDropdownOpen(false);
    }, 180);
  };

  const handleClosePdfDropdown = () => {
    if (pdfTimeoutRef.current) {
      clearTimeout(pdfTimeoutRef.current);
      pdfTimeoutRef.current = null;
    }
    setIsPdfDropdownOpen(false);
  };

  const handleDataMouseEnter = () => {
    if (dataTimeoutRef.current) {
      clearTimeout(dataTimeoutRef.current);
      dataTimeoutRef.current = null;
    }
    if (pdfTimeoutRef.current) {
      clearTimeout(pdfTimeoutRef.current);
      pdfTimeoutRef.current = null;
    }
    setIsPdfDropdownOpen(false);
    setIsDataDropdownOpen(true);
  };

  const handleDataMouseLeave = () => {
    dataTimeoutRef.current = setTimeout(() => {
      setIsDataDropdownOpen(false);
    }, 180);
  };

  const handleCloseDataDropdown = () => {
    if (dataTimeoutRef.current) {
      clearTimeout(dataTimeoutRef.current);
      dataTimeoutRef.current = null;
    }
    setIsDataDropdownOpen(false);
  };

  useEffect(() => {
    return () => {
      if (pdfTimeoutRef.current) clearTimeout(pdfTimeoutRef.current);
      if (dataTimeoutRef.current) clearTimeout(dataTimeoutRef.current);
    };
  }, []);

  return (
    <header 
      className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-[#040406]/90 backdrop-blur-md transition-colors flex-shrink-0"
      style={{ transform: 'translateZ(0)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo with Transparent Zendr.png */}
        <Link to="/" className="flex items-center gap-2.5 group active:scale-95 transition-transform duration-75">
          <img
            src="/Zendr.png"
            alt="ZENDR"
            className="h-6 sm:h-7 w-auto object-contain drop-shadow-[0_0_15px_rgba(245,158,11,0.35)] transition-transform group-hover:scale-105"
          />
          <span className="text-[10px] font-mono tracking-widest text-white/40 uppercase hidden sm:inline self-center pt-0.5">
            STUDIO
          </span>
        </Link>

        {/* Center: Module Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-white/[0.03] p-1 rounded-full border border-white/[0.06] text-xs">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `px-3.5 py-1.5 rounded-full transition-transform transition-colors duration-75 active:scale-95 cursor-pointer select-none font-medium ${
                isActive
                  ? 'bg-amber-400 text-black shadow-sm font-semibold'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`
            }
          >
            Overview
          </NavLink>

          {/* PDF Tools with Hover Mega-Dropdown */}
          <div
            className="relative"
            onMouseEnter={handlePdfMouseEnter}
            onMouseLeave={handlePdfMouseLeave}
          >
            <NavLink
              to="/pdf-converter"
              onClick={handleClosePdfDropdown}
              className={({ isActive }) =>
                `px-3.5 py-1.5 rounded-full transition-transform transition-colors duration-75 active:scale-95 cursor-pointer select-none font-medium flex items-center gap-1.5 ${
                  isActive || isPdfDropdownOpen
                    ? 'bg-amber-400 text-black shadow-sm font-semibold'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <FileText className="w-3 h-3" />
              <span>PDF Tools</span>
              <ChevronDown
                className={`w-3 h-3 transition-transform duration-150 ${
                  isPdfDropdownOpen ? 'rotate-180' : 'text-current/60'
                }`}
              />
            </NavLink>

            {/* Mega-menu Dropdown */}
            {isPdfDropdownOpen && (
              <div
                className="absolute top-full left-1/2 -translate-x-1/2 pt-2.5 z-50 animate-in fade-in duration-100"
                onMouseEnter={handlePdfMouseEnter}
                onMouseLeave={handlePdfMouseLeave}
              >
                <div className="w-[820px] max-w-[95vw] rounded-2xl bg-[#08080c]/98 backdrop-blur-3xl border border-white/10 p-5 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.95),0_0_25px_rgba(245,158,11,0.08)] ring-1 ring-white/5">
                  {/* Top Header */}
                  <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-white/[0.08]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-md bg-amber-400/20 text-amber-400 flex items-center justify-center">
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider text-white">
                        PDF Tools Suite
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-400/10 text-amber-400 border border-amber-400/20">
                        17 Tools • In-Browser
                      </span>
                    </div>
                    <Link
                      to="/pdf-converter"
                      onClick={handleClosePdfDropdown}
                      className="text-[11px] font-medium text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors group cursor-pointer"
                    >
                      <span>View Full Directory</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>

                  {/* 3 Columns Grid */}
                  <div className="grid grid-cols-3 gap-4">
                    {PDF_DROPDOWN_GROUPS.map((group) => (
                      <div key={group.title} className="space-y-1">
                        <h4 className="text-[10px] uppercase font-mono tracking-wider text-white/40 px-2 py-1 font-semibold">
                          {group.title}
                        </h4>
                        <div className="space-y-0.5">
                          {group.items.map((item) => {
                            const Icon = item.icon;
                            return (
                              <Link
                                key={item.id}
                                to={item.route}
                                onClick={handleClosePdfDropdown}
                                className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-white/[0.06] transition-transform transition-colors duration-75 active:scale-95 group text-left cursor-pointer"
                              >
                                <div className="w-6 h-6 rounded-lg bg-white/[0.04] border border-white/5 flex items-center justify-center shrink-0 group-hover:bg-amber-400/15 group-hover:border-amber-400/30 transition-colors">
                                  <Icon className="w-3.5 h-3.5 text-white/70 group-hover:text-amber-400 transition-colors" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-medium text-white/90 group-hover:text-amber-400 transition-colors truncate">
                                      {item.title}
                                    </span>
                                    {item.badge && (
                                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-amber-400/20 text-amber-300 font-semibold">
                                        {item.badge}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-white/40 truncate leading-tight">
                                    {item.subtitle}
                                  </p>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Bottom Banner */}
                  <div className="mt-3.5 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-white/50">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Zero Server Storage • Instant Local Browser Processing</span>
                    </div>
                    <Link
                      to="/pdf-editor"
                      onClick={handleClosePdfDropdown}
                      className="text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>Open Visual Editor</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          <NavLink
            to="/pdf-editor"
            className={({ isActive }) =>
              `px-3.5 py-1.5 rounded-full transition-transform transition-colors duration-75 active:scale-95 cursor-pointer select-none font-medium flex items-center gap-1.5 ${
                isActive
                  ? 'bg-amber-400 text-black shadow-sm font-semibold'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <Edit3 className="w-3 h-3" />
            <span>PDF Editor</span>
          </NavLink>

          <NavLink
            to="/image-converter"
            className={({ isActive }) =>
              `px-3.5 py-1.5 rounded-full transition-transform transition-colors duration-75 active:scale-95 cursor-pointer select-none font-medium flex items-center gap-1.5 ${
                isActive
                  ? 'bg-amber-400 text-black shadow-sm font-semibold'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <Image className="w-3 h-3" />
            <span>Image Tools</span>
          </NavLink>

          {/* Data Tools with Hover Mega-Dropdown */}
          <div
            className="relative"
            onMouseEnter={handleDataMouseEnter}
            onMouseLeave={handleDataMouseLeave}
          >
            <NavLink
              to="/text-to-json"
              onClick={handleCloseDataDropdown}
              className={({ isActive }) =>
                `px-3.5 py-1.5 rounded-full transition-transform transition-colors duration-75 active:scale-95 cursor-pointer select-none font-medium flex items-center gap-1.5 ${
                  isActive || isDataDropdownOpen
                    ? 'bg-amber-400 text-black shadow-sm font-semibold'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <Braces className="w-3 h-3" />
              <span>Data Tools</span>
              <ChevronDown
                className={`w-3 h-3 transition-transform duration-150 ${
                  isDataDropdownOpen ? 'rotate-180' : 'text-current/60'
                }`}
              />
            </NavLink>

            {/* Mega-menu Dropdown */}
            {isDataDropdownOpen && (
              <div
                className="absolute top-full right-0 sm:left-1/2 sm:-translate-x-1/2 pt-2.5 z-50 animate-in fade-in duration-100"
                onMouseEnter={handleDataMouseEnter}
                onMouseLeave={handleDataMouseLeave}
              >
                <div className="w-[820px] max-w-[95vw] rounded-2xl bg-[#08080c]/98 backdrop-blur-3xl border border-white/10 p-5 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.95),0_0_25px_rgba(245,158,11,0.08)] ring-1 ring-white/5">
                  {/* Top Header */}
                  <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-white/[0.08]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-md bg-amber-400/20 text-amber-400 flex items-center justify-center">
                        <Braces className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider text-white">
                        Universal Data &amp; Code Suite
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-400/10 text-amber-400 border border-amber-400/20">
                        8 Formats • Client-Side
                      </span>
                    </div>
                    <Link
                      to="/text-to-json"
                      onClick={handleCloseDataDropdown}
                      className="text-[11px] font-medium text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors group cursor-pointer"
                    >
                      <span>Open Data Converter</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>

                  {/* 3 Columns Grid */}
                  <div className="grid grid-cols-3 gap-4">
                    {DATA_DROPDOWN_GROUPS.map((group) => (
                      <div key={group.title} className="space-y-1">
                        <h4 className="text-[10px] uppercase font-mono tracking-wider text-white/40 px-2 py-1 font-semibold">
                          {group.title}
                        </h4>
                        <div className="space-y-0.5">
                          {group.items.map((item) => {
                            const Icon = item.icon;
                            return (
                              <Link
                                key={item.id}
                                to={item.route}
                                onClick={handleCloseDataDropdown}
                                className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-white/[0.06] transition-transform transition-colors duration-75 active:scale-95 group text-left cursor-pointer"
                              >
                                <div className="w-6 h-6 rounded-lg bg-white/[0.04] border border-white/5 flex items-center justify-center shrink-0 group-hover:bg-amber-400/15 group-hover:border-amber-400/30 transition-colors">
                                  <Icon className="w-3.5 h-3.5 text-white/70 group-hover:text-amber-400 transition-colors" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-medium text-white/90 group-hover:text-amber-400 transition-colors truncate">
                                      {item.title}
                                    </span>
                                    {item.badge && (
                                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-amber-400/20 text-amber-300 font-semibold">
                                        {item.badge}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-white/40 truncate leading-tight">
                                    {item.subtitle}
                                  </p>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Bottom Banner */}
                  <div className="mt-3.5 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-white/50">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Zero Server Storage • Instant Local Browser Processing</span>
                    </div>
                    <Link
                      to="/text-to-json"
                      onClick={handleCloseDataDropdown}
                      className="text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>Launch Multi-Format Studio</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Right Tools & Optional Auth Actions */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* MongoDB Status Indicator */}
          <div 
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-white/70 text-xs font-mono"
            title={dbStatus.isConnected ? 'MongoDB Connected' : 'Local Storage Fallback'}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                dbStatus.isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="text-[11px]">
              {dbStatus.isConnected ? 'MongoDB Active' : 'Local Engine'}
            </span>
          </div>

          {/* User Vault & Profile Controls */}
          {user ? (
            <div className="flex items-center gap-2">
              {/* Vault Button */}
              <button
                onClick={onOpenVault}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full futuristic-pill text-xs font-medium text-white/90 hover:text-white transition-all hover:border-amber-400/40"
              >
                <Database className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Vault</span>
                {conversions.length > 0 && (
                  <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400/20 text-amber-300 font-mono">
                    {conversions.length}
                  </span>
                )}
              </button>

              {/* User Avatar badge */}
              <div className="flex items-center gap-2 pl-1 border-l border-white/10">
                <div className="flex items-center gap-1.5 text-xs text-white/80">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 text-black flex items-center justify-center font-bold text-[10px]">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium hidden md:inline">{user.username}</span>
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 rounded-full text-white/40 hover:text-rose-400 hover:bg-white/5 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-xs font-medium text-white border border-white/10 hover:border-amber-400/40 transition-all cursor-pointer"
              >
                <UserIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>Sign In</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
