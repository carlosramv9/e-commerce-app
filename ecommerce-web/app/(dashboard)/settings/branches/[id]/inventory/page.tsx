'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft, Search, Package, AlertTriangle,
  CheckCircle2, Save, RefreshCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { branchesApi } from '@/lib/api/branches';
import { Branch, BranchInventoryItem } from '@/lib/types';
import { toast } from 'sonner';
import { currencyFormatter } from '@/lib/utils';

export default function BranchInventoryPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [branch, setBranch] = useState<Branch | null>(null);
  const [inventory, setInventory] = useState<BranchInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [edits, setEdits] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [branchRes, invRes] = await Promise.all([
        branchesApi.getOne(id),
        branchesApi.getInventory(id),
      ]);
      setBranch(branchRes.data);
      setInventory(invRes.data);
      setEdits({});
    } catch {
      toast.error('Error al cargar el inventario');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    if (!search) return inventory;
    const q = search.toLowerCase();
    return inventory.filter(
      (item) =>
        item.product.name.toLowerCase().includes(q) ||
        item.product.sku.toLowerCase().includes(q),
    );
  }, [inventory, search]);

  const handleStockChange = (productId: string, val: string) => {
    const num = parseInt(val, 10);
    if (!isNaN(num) && num >= 0) {
      setEdits((prev) => ({ ...prev, [productId]: num }));
    }
  };

  const dirtyCount = Object.keys(edits).length;

  const handleSave = async () => {
    if (!dirtyCount) return;
    try {
      setSaving(true);
      const items = Object.entries(edits).map(([productId, stock]) => ({ productId, stock }));
      await branchesApi.bulkUpdateInventory(id, items);
      toast.success(`${dirtyCount} producto${dirtyCount > 1 ? 's' : ''} actualizado${dirtyCount > 1 ? 's' : ''}`);
      load();
    } catch {
      toast.error('Error al guardar el inventario');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 w-56 bg-slate-200/60 rounded-xl animate-pulse" />
        <div className="h-10 w-full bg-white/60 rounded-xl animate-pulse" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-14 bg-white/60 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2 text-slate-500">
          <ArrowLeft className="h-4 w-4" /> Volver
        </Button>
      </div>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Inventario — {branch?.name}</h1>
          <p className="text-sm text-slate-500 mt-1">
            {inventory.length} producto{inventory.length !== 1 ? 's' : ''} registrado{inventory.length !== 1 ? 's' : ''}
          </p>
        </div>
        {dirtyCount > 0 && (
          <Button onClick={handleSave} disabled={saving} className="gap-2 bg-slate-800 hover:bg-slate-900 rounded-xl">
            {saving ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Guardar {dirtyCount} cambio{dirtyCount > 1 ? 's' : ''}
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Buscar por nombre o SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-white/60 border-slate-200/80 rounded-xl"
        />
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-100/80 border border-slate-200/60 flex items-center justify-center">
            <Package className="h-6 w-6 text-slate-300" />
          </div>
          <p className="text-slate-400 text-sm">Sin productos en esta sucursal</p>
        </div>
      ) : (
        <div className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-xl shadow-slate-900/5 rounded-2xl overflow-hidden">
          {/* Header row */}
          <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-slate-50/60 border-b border-slate-100/80 text-xs font-semibold text-slate-500 uppercase tracking-wide">
            <div className="col-span-5">Producto</div>
            <div className="col-span-2 text-right">Precio</div>
            <div className="col-span-2 text-center">Min. alerta</div>
            <div className="col-span-3 text-center">Stock en sucursal</div>
          </div>

          {filtered.map((item) => {
            const currentStock = edits[item.productId] ?? item.stock;
            const isDirty = edits[item.productId] !== undefined;
            const isLow = currentStock > 0 && currentStock <= item.product.lowStockAlert;
            const isOut = currentStock === 0;

            return (
              <div
                key={item.productId}
                className={`grid grid-cols-12 gap-4 px-5 py-3.5 border-b border-slate-100/60 items-center transition-colors ${
                  isDirty ? 'bg-amber-50/40' : 'hover:bg-white/60'
                }`}
              >
                <div className="col-span-5 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{item.product.name}</p>
                  <p className="text-xs text-slate-400 font-mono">{item.product.sku}</p>
                </div>
                <div className="col-span-2 text-right text-sm text-slate-600 font-mono">
                  {currencyFormatter.format(Number(item.product.price))}
                </div>
                <div className="col-span-2 text-center text-xs text-slate-500">
                  {item.product.lowStockAlert}
                </div>
                <div className="col-span-3 flex items-center justify-center gap-2">
                  {isOut ? (
                    <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                  ) : isLow ? (
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  )}
                  <Input
                    type="number"
                    min={0}
                    value={currentStock}
                    onChange={(e) => handleStockChange(item.productId, e.target.value)}
                    className={`w-20 text-center font-mono text-sm rounded-lg h-8 border-slate-200/80 ${
                      isDirty ? 'bg-amber-50 border-amber-300' : 'bg-white/60'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
