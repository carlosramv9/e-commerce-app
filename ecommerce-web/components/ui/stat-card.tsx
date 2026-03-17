import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

// Cada color define: bg del contenedor, ring, box-shadow glow, y color del icono
const glowStyles = {
  cyan: {
    wrap:  'bg-cyan-50    dark:bg-cyan-500/[0.15]  dark:ring-1 dark:ring-cyan-500/25    dark:shadow-[0_0_20px_2px_rgba(6,182,212,0.4)]',
    icon:  'text-cyan-600  dark:text-cyan-300  dark:drop-shadow-[0_0_6px_rgba(6,182,212,0.7)]',
  },
  emerald: {
    wrap:  'bg-emerald-50  dark:bg-emerald-500/[0.15] dark:ring-1 dark:ring-emerald-500/25  dark:shadow-[0_0_20px_2px_rgba(52,211,153,0.4)]',
    icon:  'text-emerald-600 dark:text-emerald-300 dark:drop-shadow-[0_0_6px_rgba(52,211,153,0.7)]',
  },
  violet: {
    wrap:  'bg-violet-50   dark:bg-violet-500/[0.15] dark:ring-1 dark:ring-violet-500/25   dark:shadow-[0_0_20px_2px_rgba(167,139,250,0.4)]',
    icon:  'text-violet-600 dark:text-violet-300 dark:drop-shadow-[0_0_6px_rgba(167,139,250,0.7)]',
  },
  amber: {
    wrap:  'bg-amber-50    dark:bg-amber-500/[0.15]  dark:ring-1 dark:ring-amber-500/25    dark:shadow-[0_0_20px_2px_rgba(251,191,36,0.4)]',
    icon:  'text-amber-600  dark:text-amber-300  dark:drop-shadow-[0_0_6px_rgba(251,191,36,0.7)]',
  },
  indigo: {
    wrap:  'bg-indigo-50   dark:bg-indigo-500/[0.15] dark:ring-1 dark:ring-indigo-500/25   dark:shadow-[0_0_20px_2px_rgba(99,102,241,0.4)]',
    icon:  'text-indigo-600 dark:text-indigo-300 dark:drop-shadow-[0_0_6px_rgba(99,102,241,0.7)]',
  },
} as const;

export type GlowColor = keyof typeof glowStyles;

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  glowColor?: GlowColor;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  glowColor = 'indigo',
}: StatCardProps) {
  const g = glowStyles[glowColor];

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            {/* Título métrica */}
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-white/60">
              {title}
            </p>
            {/* Valor — blanco puro, letter-spacing apretado en dark */}
            <p className="text-2xl font-bold text-slate-800 dark:text-white mt-2 dark:[letter-spacing:-0.02em]">
              {value}
            </p>
            {description && (
              <p className="text-xs text-slate-400 dark:text-white/40 mt-1">{description}</p>
            )}
          </div>

          {/* Contenedor icono con glow real por color */}
          <div className={cn(
            'h-12 w-12 rounded-xl flex items-center justify-center transition-shadow',
            g.wrap,
          )}>
            <Icon className={cn('h-6 w-6', g.icon)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
