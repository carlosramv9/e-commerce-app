'use client';

import { useEffect, useState } from 'react';
import { MapPin, ChevronDown, Check, Loader2 } from 'lucide-react';
import { branchesApi } from '@/lib/api/branches';
import { useBranchStore } from '@/lib/store/branch-store';
import { Branch } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function BranchSelector() {
  const { currentBranch, branches, setCurrentBranch, setBranches } = useBranchStore();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await branchesApi.getAll();
        setBranches(res.data);
        // Auto-select main branch if none selected
        if (!currentBranch && res.data.length > 0) {
          const main = res.data.find((b) => b.isMain) ?? res.data[0];
          setCurrentBranch(main);
        }
      } catch {
        // If branches not available (non-PLUS plan), silently ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5">
        <Loader2 className="h-3.5 w-3.5 animate-spin text-white/40" />
        <span className="text-[12px] text-white/30">Cargando...</span>
      </div>
    );
  }

  if (branches.length <= 1 && !currentBranch) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-white/[0.06] transition-colors"
      >
        <MapPin className="h-3.5 w-3.5 text-white/40 shrink-0" />
        <span className="text-[12px] text-white/60 max-w-[120px] truncate">
          {currentBranch?.name ?? 'Sin sucursal'}
        </span>
        {branches.length > 1 && (
          <ChevronDown className={cn('h-3 w-3 text-white/30 transition-transform', open && 'rotate-180')} />
        )}
      </button>

      {open && branches.length > 1 && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 z-40 w-52 bg-[#1a1d23] border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden">
            <div className="px-3 py-2 border-b border-white/[0.05]">
              <p className="text-[10px] text-white/25 font-semibold uppercase tracking-widest">Sucursales</p>
            </div>
            {branches
              .filter((b) => b.status === 'ACTIVE')
              .map((branch) => {
                const isSelected = branch.id === currentBranch?.id;
                return (
                  <button
                    key={branch.id}
                    onClick={() => { setCurrentBranch(branch); setOpen(false); }}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors',
                      isSelected ? 'bg-white/[0.07]' : 'hover:bg-white/[0.04]',
                    )}
                  >
                    <MapPin className="h-3.5 w-3.5 text-white/30 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-[12px] truncate', isSelected ? 'text-white/80' : 'text-white/50')}>
                        {branch.name}
                      </p>
                      <p className="text-[10px] text-white/25 font-mono">{branch.code}</p>
                    </div>
                    {isSelected && <Check className="h-3.5 w-3.5 text-white/40 shrink-0" />}
                  </button>
                );
              })}
          </div>
        </>
      )}
    </div>
  );
}
