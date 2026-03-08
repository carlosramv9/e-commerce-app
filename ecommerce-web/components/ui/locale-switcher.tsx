'use client';

import { useLocaleSwitch } from '@/lib/i18n/locale-provider';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Languages } from 'lucide-react';

export function LocaleSwitcher() {
  const { locale, setLocale } = useLocaleSwitch();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 px-2">
          <Languages className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-wide">
            {locale}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[130px]">
        <DropdownMenuItem
          onClick={() => setLocale('es')}
          className={locale === 'es' ? 'font-semibold bg-accent' : ''}
        >
          <span className="mr-2">🇲🇽</span> Español
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLocale('en')}
          className={locale === 'en' ? 'font-semibold bg-accent' : ''}
        >
          <span className="mr-2">🇺🇸</span> English
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
