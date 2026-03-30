import {
  Edit, Trash2, MapPin, Phone, Star, Package,
  ShoppingCart, Users, AlertTriangle, CheckCircle2, XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card, CardHeader, CardTitle, CardDescription,
  CardAction, CardContent, CardFooter,
} from '@/components/ui/card';
import { Branch, BranchStatus } from '@/lib/types';

const STATUS_CONFIG: Record<BranchStatus, { label: string; icon: React.ElementType; cls: string }> = {
  ACTIVE:   { label: 'Activa',   icon: CheckCircle2,  cls: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  INACTIVE: { label: 'Inactiva', icon: AlertTriangle,  cls: 'text-amber-700   bg-amber-50   border-amber-200'  },
  CLOSED:   { label: 'Cerrada',  icon: XCircle,        cls: 'text-slate-500   bg-slate-100  border-slate-200'  },
};

interface BranchCardProps {
  branch: Branch;
  onEdit:    (id: string) => void;
  onInventory: (id: string) => void;
  onSetMain: (branch: Branch) => void;
  onDelete:  (branch: Branch) => void;
}

export function BranchCard({ branch, onEdit, onInventory, onSetMain, onDelete }: BranchCardProps) {
  const status     = STATUS_CONFIG[branch.status] ?? STATUS_CONFIG.ACTIVE;
  const StatusIcon = status.icon;

  return (
    <Card className="overflow-hidden rounded-2xl gap-0 py-0">
      {/* Top accent bar */}
      <div className={`h-1 shrink-0 ${branch.isMain ? 'bg-slate-700' : 'bg-slate-200/80'}`} />

      {/* Header: name + code + status badge */}
      <CardHeader className="px-5 pt-4 pb-0">
        <CardTitle className="flex items-center gap-2 flex-wrap">
          <span className="truncate">{branch.name}</span>
          {branch.isMain && (
            <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-800 dark:bg-[#37393D] dark:text-white shrink-0">
              <Star className="h-2.5 w-2.5" /> Principal
            </span>
          )}
        </CardTitle>
        <CardDescription className="font-mono dark:text-white/50">{branch.code}</CardDescription>
        <CardAction>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border flex items-center gap-1 ${status.cls} dark:border-white/50 dark:text-white dark:bg-[#37393D]/60` }>
            <StatusIcon className="h-3 w-3" />
            {status.label}
          </span>
        </CardAction>
      </CardHeader>

      {/* Contact & manager info */}
      <CardContent className="px-5 py-3 space-y-1">
        {(branch.city || branch.address) && (
          <div className="flex items-start gap-2 text-xs text-slate-500 dark:text-white/50">
            <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5 text-slate-400" />
            <span className="line-clamp-1">
              {[branch.address, branch.city, branch.state].filter(Boolean).join(', ')}
            </span>
          </div>
        )}
        {branch.phone && (
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-white/50">
            <Phone className="h-3.5 w-3.5 text-slate-400" />
            <span>{branch.phone}</span>
          </div>
        )}
        {branch.manager && (
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-white/50">
            <Users className="h-3.5 w-3.5 text-slate-400" />
            <span>{branch.manager.firstName} {branch.manager.lastName}</span>
          </div>
        )}
      </CardContent>

      {/* Stats */}
      {branch._count && (
        <CardContent className="px-5 py-0 pb-3">
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: Users,        label: 'Staff',     val: branch._count.memberships },
              { icon: ShoppingCart, label: 'Ventas',    val: branch._count.orders },
              { icon: Package,      label: 'Productos', val: branch._count.inventory },
            ].map(({ icon: Icon, label, val }) => (
              <div key={label} className="bg-slate-50/60 dark:bg-[#37393D]/60 border border-slate-200/50 dark:border-slate-700/50 rounded-xl px-2 py-2 text-center dark:border-white/50">
                <p className="text-sm font-bold text-[#37393D] dark:text-white">{val}</p>
                <p className="text-[10px] text-slate-400 dark:text-white/50 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      )}

      {/* Actions */}
      <CardFooter className="px-5 pb-4 pt-1 gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 gap-1.5 text-xs"
          onClick={() => onEdit(branch.id)}
        >
          <Edit className="h-3.5 w-3.5" /> Editar
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 gap-1.5 text-xs"
          onClick={() => onInventory(branch.id)}
        >
          <Package className="h-3.5 w-3.5" /> Inventario
        </Button>
        {!branch.isMain && (
          <Button
            variant="ghost"
            size="sm"
            className="px-2 text-slate-400 hover:text-slate-600"
            title="Establecer como principal"
            onClick={() => onSetMain(branch)}
          >
            <Star className="h-3.5 w-3.5" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="px-2 text-slate-400 hover:text-red-600"
          disabled={branch.isMain}
          title={branch.isMain ? 'No se puede eliminar la sucursal principal' : 'Eliminar'}
          onClick={() => onDelete(branch)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </CardFooter>
    </Card>
  );
}
