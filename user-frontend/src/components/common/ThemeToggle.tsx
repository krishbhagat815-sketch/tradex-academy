import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Laptop, ChevronDown } from 'lucide-react';
import { useTheme, Theme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

interface ThemeToggleProps {
  variant?: 'button' | 'segmented' | 'dropdown';
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ variant = 'button', className = '' }) => {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  const { dict } = useLanguage();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Variant: Segmented Control (Ideal for mobile menu & settings)
  if (variant === 'segmented') {
    const options: { id: Theme; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
      { id: 'light', label: dict.nav.themeLight, icon: Sun },
      { id: 'dark', label: dict.nav.themeDark, icon: Moon },
      { id: 'system', label: dict.nav.themeSystem, icon: Laptop }
    ];

    return (
      <div className={`flex items-center p-1 bg-slate-100 dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-xs ${className}`}>
        {options.map((opt) => {
          const Icon = opt.icon;
          const isActive = theme === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => setTheme(opt.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-95 cursor-pointer ${
                isActive
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-bold border border-slate-200/60 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title={opt.label}
              aria-pressed={isActive}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? (opt.id === 'light' ? 'text-amber-500' : opt.id === 'dark' ? 'text-indigo-400' : 'text-emerald-500') : ''}`} />
              <span className="truncate">{opt.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // Variant: Dropdown
  if (variant === 'dropdown') {
    return (
      <div ref={dropdownRef} className={`relative ${className}`}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-medium transition-colors"
          title={dict.nav.themeToggle}
          aria-expanded={dropdownOpen}
        >
          {resolvedTheme === 'dark' ? (
            <Moon className="w-3.5 h-3.5 text-indigo-400" />
          ) : (
            <Sun className="w-3.5 h-3.5 text-amber-500" />
          )}
          <span className="capitalize hidden md:inline">{theme}</span>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg p-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
            <button
              onClick={() => {
                setTheme('light');
                setDropdownOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors ${
                theme === 'light'
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 font-bold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Sun className="w-4 h-4 text-amber-500" />
              <span>{dict.nav.themeLight}</span>
            </button>
            <button
              onClick={() => {
                setTheme('dark');
                setDropdownOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors ${
                theme === 'dark'
                  ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-300 font-bold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Moon className="w-4 h-4 text-indigo-400" />
              <span>{dict.nav.themeDark}</span>
            </button>
            <button
              onClick={() => {
                setTheme('system');
                setDropdownOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors ${
                theme === 'system'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 font-bold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Laptop className="w-4 h-4 text-emerald-500" />
              <span>{dict.nav.themeSystem}</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  // Variant: Button (Default sleek toggle for desktop header)
  return (
    <button
      onClick={toggleTheme}
      className={`relative p-2 rounded-full text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700/80 transition-all duration-300 active:scale-90 focus:outline-none focus:ring-2 focus:ring-red-500/40 ${className}`}
      title={resolvedTheme === 'dark' ? dict.nav.themeLight : dict.nav.themeDark}
      aria-label={dict.nav.themeToggle}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {resolvedTheme === 'dark' ? (
          <Moon className="w-4 h-4 text-indigo-400 transition-transform duration-300 rotate-0 scale-100" />
        ) : (
          <Sun className="w-4 h-4 text-amber-500 transition-transform duration-300 rotate-0 scale-100" />
        )}
      </div>
    </button>
  );
};
