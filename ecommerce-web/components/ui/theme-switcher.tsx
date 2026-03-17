'use client';

import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Switch para alternar entre tema claro y oscuro.
 * Usa next-themes; el tema se aplica con la clase .dark en el documento.
 */
export function ThemeSwitcher() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-9 w-16 rounded-full bg-slate-200/80 dark:bg-gray-800/50 animate-pulse" />
    );
  }

  const isDark = resolvedTheme === 'dark';

  const handleToggle = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Usar tema claro' : 'Usar tema oscuro'}
      onClick={handleToggle}
      className={cn(
        'relative inline-flex h-9 w-14 shrink-0 cursor-pointer items-center rounded-full border border-slate-200/80 transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'bg-slate-100 hover:bg-slate-200/80 dark:bg-[#7b7e89] dark:hover:bg-gray-700 dark:border-gray-600/80',
      )}
    >
      <span
        className={cn(
          'pointer-events-none flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm ring-0 transition-transform duration-200',
          'dark:bg-gray-600',
          isDark ? 'translate-x-6' : 'translate-x-1',
        )}
      >
        {isDark ? (
          <Moon className="h-3.5 w-3.5 text-gray-700 dark:text-gray-200" />
        ) : (
          <Sun className="h-3.5 w-3.5 text-amber-600" />
        )}
      </span>
    </button>
  );
}
