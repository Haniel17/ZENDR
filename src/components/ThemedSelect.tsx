import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface ThemedSelectOption<T extends string | number = string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  group?: string;
}

interface ThemedSelectProps<T extends string | number = string> {
  value: T;
  onChange: (value: T) => void;
  options: ThemedSelectOption<T>[];
  labelPrefix?: string;
  placeholder?: string;
  className?: string;
  align?: 'left' | 'right';
  size?: 'sm' | 'md';
}

export function ThemedSelect<T extends string | number = string>({
  value,
  onChange,
  options,
  labelPrefix,
  placeholder,
  className = '',
  align = 'left',
  size = 'sm'
}: ThemedSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const sizeStyles = size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-1.5 text-xs sm:text-sm';

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center justify-between gap-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border backdrop-blur-xl transition-all duration-200 active:scale-[0.95] cursor-pointer select-none font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] ${sizeStyles} ${
          isOpen
            ? 'border-amber-400/60 bg-amber-400/[0.1] text-white shadow-[0_2px_12px_rgba(245,158,11,0.2)]'
            : 'border-white/10 text-white/90 hover:border-amber-400/40 hover:text-white'
        }`}
      >
        <span className="flex items-center gap-1.5 truncate">
          {labelPrefix && <span className="text-white/40 font-normal">{labelPrefix}</span>}
          {selectedOption?.icon && <span className="text-amber-400">{selectedOption.icon}</span>}
          <span className="truncate">{selectedOption ? selectedOption.label : placeholder || 'Select...'}</span>
        </span>

        <ChevronDown
          className={`w-3 h-3 text-amber-400/80 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-amber-400' : ''
          }`}
        />
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div
          className={`absolute top-full mt-2 min-w-[190px] w-max max-w-[280px] max-h-[260px] overflow-y-auto rounded-[20px] bg-[#09090e]/95 backdrop-blur-3xl border border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.15)] p-1.5 z-50 ring-1 ring-white/5 custom-scrollbar animate-in fade-in zoom-in-95 duration-100 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          <div className="space-y-0.5">
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={String(option.value)}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-1.5 rounded-full text-xs cursor-pointer select-none text-left transition-all duration-150 ${
                    isSelected
                      ? 'bg-gradient-to-b from-amber-300 to-amber-500 text-black font-semibold shadow-sm'
                      : 'text-white/80 hover:bg-white/[0.08] hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    {option.icon && (
                      <span className={isSelected ? 'text-black' : 'text-amber-400'}>
                        {option.icon}
                      </span>
                    )}
                    <span className="truncate">{option.label}</span>
                  </span>

                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-black shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
