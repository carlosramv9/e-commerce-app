'use client';

import { useEffect, useState } from 'react';
import { MapPin, ChevronDown, Loader2 } from 'lucide-react';
import { branchesApi } from '@/lib/api/branches';
import { useBranchStore } from '@/lib/store/branch-store';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function BranchSelector() {
  const { currentBranch, branches, setCurrentBranch, setBranches } = useBranchStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await branchesApi.getAll();
        setBranches(res.data);
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

  const activeBranches = branches.filter((b) => b.status === 'ACTIVE');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="group flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <MapPin className="h-3.5 w-3.5 text-slate-500 shrink-0" />
          <span className="text-[16px] text-slate-600 truncate">
            {currentBranch?.name ?? 'Sin sucursal'}
          </span>
          {activeBranches.length > 1 && (
            <ChevronDown className="h-3 w-3 text-slate-500 shrink-0 group-data-[state=open]:rotate-180 transition-transform" />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={6}
        collisionPadding={12}
        className="w-52 bg-[#1a1d23] border-white/8 rounded-xl shadow-2xl p-0 overflow-hidden"
      >
        <DropdownMenuLabel className="px-3 py-2 border-b border-white/5 text-[10px] text-white/25 font-semibold uppercase tracking-widest">
          Sucursales
        </DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={currentBranch?.id ?? ''}
          onValueChange={(id) => {
            const branch = activeBranches.find((b) => b.id === id);
            if (branch) setCurrentBranch(branch);
          }}
        >
          {activeBranches.map((branch) => (
            <DropdownMenuRadioItem
              key={branch.id}
              value={branch.id}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 cursor-pointer',
                'focus:bg-white/[0.07] data-[state=checked]:bg-white/[0.07]',
                'text-white/50 data-[state=checked]:text-white/80',
              )}
            >
              <MapPin className="h-3.5 w-3.5 text-white/30 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[12px] truncate">{branch.name}</p>
                <p className="text-[10px] text-white/25 font-mono">{branch.code}</p>
              </div>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
