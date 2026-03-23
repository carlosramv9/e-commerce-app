'use client';

import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import { currencyFormatter } from '@/lib/utils';
import { Customer } from '@/lib/types';

const PAYMENT_LABELS: Record<string, string> = {
  CASH: 'Efectivo',
  CARD: 'Tarjeta',
  TRANSFER: 'Transferencia',
};

const PAYMENT_EMOJIS: Record<string, string> = {
  CASH: '💵',
  CARD: '💳',
  TRANSFER: '🏦',
};

const PARTICLES = [
  { color: '#34d399', tx: -65, ty: -75, delay: 0.05, size: 10 },
  { color: '#60a5fa', tx: 65, ty: -65, delay: 0.1, size: 7 },
  { color: '#f59e0b', tx: -85, ty: 15, delay: 0.15, size: 9 },
  { color: '#f472b6', tx: 85, ty: 5, delay: 0.08, size: 8 },
  { color: '#a78bfa', tx: -45, ty: 85, delay: 0.2, size: 11 },
  { color: '#34d399', tx: 45, ty: 90, delay: 0.12, size: 6 },
  { color: '#60a5fa', tx: 105, ty: -35, delay: 0.25, size: 8 },
  { color: '#fbbf24', tx: -105, ty: -25, delay: 0.18, size: 7 },
  { color: '#f472b6', tx: 0, ty: -95, delay: 0.07, size: 9 },
  { color: '#818cf8', tx: 0, ty: 100, delay: 0.22, size: 6 },
];

// r=44 → circumference ≈ 276.46
const RING_R = 44;
const RING_CIRC = 2 * Math.PI * RING_R;

const SALE_SUCCESS_KEYFRAMES = `
  @keyframes saleCirclePop {
    0%   { transform: scale(0);    opacity: 0; }
    55%  { transform: scale(1.18); opacity: 1; }
    75%  { transform: scale(0.93);             }
    100% { transform: scale(1);    opacity: 1; }
  }
  @keyframes saleCheckDraw {
    from { stroke-dashoffset: 90; }
    to   { stroke-dashoffset: 0;  }
  }
  @keyframes salePulseRing {
    0%   { transform: scale(1);   opacity: 0.5; }
    100% { transform: scale(1.6); opacity: 0;   }
  }
  @keyframes saleParticle {
    0%   { transform: translate(0,0) scale(1) rotate(0deg);   opacity: 1; }
    100% { transform: translate(var(--tx),var(--ty)) scale(0) rotate(180deg); opacity: 0; }
  }
  @keyframes saleSlideUp {
    from { transform: translateY(18px); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
  }
  @keyframes saleFadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  .sale-circle-pop { animation: saleCirclePop  0.55s cubic-bezier(0.34,1.56,0.64,1) forwards; }
  .sale-check-draw { stroke-dasharray: 90; stroke-dashoffset: 90;
                     animation: saleCheckDraw 0.45s ease-out 0.45s forwards; }
  .sale-pulse-ring { animation: salePulseRing 1.4s ease-out infinite; }
  .sale-particle   { animation: saleParticle  0.9s ease-out forwards; }
  .sale-slide-up   { animation: saleSlideUp   0.4s ease-out forwards; }
  .sale-fade-in    { opacity: 0; animation: saleFadeIn 0.35s ease-out forwards; }
`;

interface SaleSuccessModalProps {
  open: boolean;
  orderNumber: string;
  total: number;
  paymentMethod: string;
  customer?: Customer;
  /** Seconds before auto-close. Default: 5 */
  autoCloseSecs?: number;
  onClose: () => void;
}

export default function SaleSuccessModal({
  open,
  orderNumber,
  total,
  paymentMethod,
  customer,
  autoCloseSecs = 5,
  onClose,
}: SaleSuccessModalProps) {
  const [phase, setPhase] = useState<'idle' | 'circle' | 'content'>('idle');
  const [remaining, setRemaining] = useState(() => autoCloseSecs);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onCloseEvent = useEffectEvent(onClose);

  // Animation sequencing (defer setState to avoid synchronous updates in effect)
  useEffect(() => {
    if (open) {
      const t0 = setTimeout(() => {
        setPhase('idle');
        setRemaining(autoCloseSecs);
      }, 0);
      const t1 = setTimeout(() => setPhase('circle'), 80);
      const t2 = setTimeout(() => setPhase('content'), 700);
      return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t2); };
    } else {
      const t0 = setTimeout(() => setPhase('idle'), 0);
      return () => clearTimeout(t0);
    }
  }, [open, autoCloseSecs]);

  // Countdown + auto-close (onClose via useEffectEvent to avoid effect re-runs)
  useEffect(() => {
    if (!open) return;
    const t0 = setTimeout(() => setRemaining(autoCloseSecs), 0);
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setTimeout(() => onCloseEvent(), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearTimeout(t0);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [open, autoCloseSecs]);

  const showCircle = phase === 'circle' || phase === 'content';
  const showContent = phase === 'content';

  // Drain: 0 = full green ring, RING_CIRC = empty
  const ringOffset = ((autoCloseSecs - remaining) / autoCloseSecs) * RING_CIRC;

  return (
    <>
      <style>{SALE_SUCCESS_KEYFRAMES}</style>

      <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
        <DialogContent
          className="max-w-sm p-0 gap-0 border-0 shadow-2xl overflow-hidden rounded-2xl [&>button:last-child]:hidden"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogTitle className="sr-only">Venta completada</DialogTitle>

          {/* ── Hero (gradient top) ───────────────────────────────────────── */}
          <div className="relative bg-linear-to-b from-emerald-50 via-emerald-50/60 to-white pt-12 pb-8 flex flex-col items-center dark:from-emerald-900/[0.30] dark:via-emerald-900/[0.15] dark:to-[#020617]">

            {/* Confetti particles */}
            <div className="absolute inset-0 flex items-start justify-center pointer-events-none overflow-hidden pt-12">
              {showCircle && PARTICLES.map((p, i) => (
                <div
                  key={i}
                  className="absolute rounded-full sale-particle"
                  style={{
                    width: p.size, height: p.size,
                    backgroundColor: p.color,
                    '--tx': `${p.tx}px`,
                    '--ty': `${p.ty}px`,
                    animationDelay: `${p.delay}s`,
                  } as React.CSSProperties}
                />
              ))}
            </div>

            {/* Checkmark + countdown ring */}
            <div className="relative z-10 flex items-center justify-center">
              {showCircle && (
                <div className="absolute w-28 h-28 rounded-full bg-emerald-100 dark:bg-emerald-500/[0.15] sale-pulse-ring" />
              )}

              {showCircle && (
                <div className="w-24 h-24 sale-circle-pop">
                  <svg viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Track ring (grey) */}
                    <circle
                      cx="48" cy="48" r={RING_R}
                      fill="#d1fae5"
                      stroke="#e5e7eb"
                      strokeWidth="3.5"
                    />
                    {/* Draining countdown ring (green → empties) */}
                    {showContent && (
                      <circle
                        cx="48" cy="48" r={RING_R}
                        stroke="#10b981"
                        strokeWidth="3.5"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={RING_CIRC}
                        strokeDashoffset={ringOffset}
                        style={{
                          transform: 'rotate(-90deg)',
                          transformOrigin: 'center',
                          transition: `stroke-dashoffset ${remaining === autoCloseSecs ? '0s' : '0.95s'} linear`,
                        }}
                      />
                    )}
                    {/* Inner fill circle */}
                    <circle cx="48" cy="48" r="34" fill="#ecfdf5" stroke="#a7f3d0" strokeWidth="1.5" />
                    {/* Checkmark */}
                    <polyline
                      points="28,50 41,63 68,34"
                      stroke="#059669"
                      strokeWidth="5.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                      className="sale-check-draw"
                    />
                  </svg>
                </div>
              )}

              {/* Remaining seconds badge */}
              {showContent && (
                <span
                  className="absolute -bottom-7 text-xs font-mono font-bold tabular-nums text-neutral-400"
                  aria-live="polite"
                >
                  {remaining}s
                </span>
              )}
            </div>

            {/* Title */}
            {showContent && (
              <div className="text-center mt-10 z-10 sale-slide-up">
                <p className="text-xs font-semibold tracking-widest text-emerald-600 uppercase mb-1">
                  Pago confirmado
                </p>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
                  ¡Venta completada!
                </h2>
                <p className="text-sm text-neutral-400 dark:text-white/40 mt-1 font-mono">{orderNumber}</p>
              </div>
            )}
          </div>

          {/* ── Body ─────────────────────────────────────────────────────── */}
          {showContent && (
            <div
              className="px-6 pb-7 space-y-4 sale-fade-in"
              style={{ animationDelay: '0.08s' }}
            >
              {/* Total */}
              <div className="relative overflow-hidden rounded-2xl bg-neutral-900 px-6 py-5 text-center">
                <div className="absolute inset-0 bg-linear-to-br from-neutral-800 to-neutral-950 opacity-80" />
                <p className="relative text-xs font-medium text-neutral-400 mb-1 tracking-wide uppercase">
                  Total cobrado
                </p>
                <p className="relative text-4xl font-bold font-mono text-white tracking-tight">
                  {currencyFormatter.format(total)}
                </p>
              </div>

              {/* Payment + Customer */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col items-center gap-1.5 rounded-xl border border-white/40 bg-neutral-50 px-3 py-3.5 dark:bg-white/[0.05] dark:border-white/[0.08]">
                  <span className="text-2xl leading-none">{PAYMENT_EMOJIS[paymentMethod] ?? '💳'}</span>
                  <span className="text-xs text-neutral-500 dark:text-white/40">Método</span>
                  <span className="text-sm font-semibold text-neutral-800 dark:text-white">
                    {PAYMENT_LABELS[paymentMethod] ?? paymentMethod}
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1.5 rounded-xl border border-white/40 bg-neutral-50 px-3 py-3.5 dark:bg-white/[0.05] dark:border-white/[0.08]">
                  <span className="text-2xl leading-none">{customer ? '👤' : '🛒'}</span>
                  <span className="text-xs text-neutral-500 dark:text-white/40">Cliente</span>
                  <span className="text-sm font-semibold text-neutral-800 dark:text-white text-center leading-tight line-clamp-2">
                    {customer
                      ? `${customer.firstName} ${customer.lastName}`
                      : 'Público general'}
                  </span>
                </div>
              </div>

              {/* Manual close */}
              <Button
                variant="outline"
                className="w-full h-11 border-neutral-200 hover:bg-neutral-50"
                onClick={onClose}
              >
                <RotateCcw className="h-4 w-4 mr-2 text-neutral-500" />
                Nueva venta
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
