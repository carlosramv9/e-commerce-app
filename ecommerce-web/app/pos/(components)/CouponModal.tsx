import couponsApi from '@/lib/api/coupons';
import { AppliedCoupon } from '@/lib/interfaces/appliedCoupon';
import React, { useState } from 'react'
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, Loader2, Tag, X } from 'lucide-react';
import { currencyFormatter } from '@/lib/utils';

const CouponModal = ({
    open,
    onClose,
    appliedCoupons,
    onApplyCoupon,
    onRemoveCoupon,
    subtotal,
    selectedCustomer,
}: {
    open: boolean;
    onClose: () => void;
    appliedCoupons: AppliedCoupon[];
    onApplyCoupon: (coupon: AppliedCoupon) => void;
    onRemoveCoupon: (code: string) => void;
    subtotal: number;
    selectedCustomer: string;
}) => {
    const [code, setCode] = useState('');
    const [validating, setValidating] = useState(false);

    const handleValidate = async () => {
        if (!code.trim()) return;
        const upperCode = code.trim().toUpperCase();

        if (appliedCoupons.some((c) => c.code === upperCode)) {
            toast.error('Este cupón ya fue aplicado');
            return;
        }

        try {
            setValidating(true);
            const response = await couponsApi.validate(
                upperCode,
                selectedCustomer || undefined,
                subtotal
            );

            if (response.data.valid && response.data.coupon) {
                onApplyCoupon(response.data.coupon as AppliedCoupon);
                setCode('');
                toast.success('Cupón aplicado');
            } else {
                throw new Error(response.data.message || 'Cupón inválido');
            }
        } catch (error: any) {
            toast.error(error.message || 'Cupón inválido');
        } finally {
            setValidating(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-sm p-0 gap-0 overflow-hidden">
                <DialogHeader className="px-5 pt-5 pb-4 border-b border-white/40">
                    <DialogTitle className="text-base font-semibold">Cupones de Descuento</DialogTitle>
                </DialogHeader>

                {/* Add coupon */}
                <div className="px-4 py-4 border-b border-white/40">
                    <label className="block text-xs font-medium text-slate-600 dark:text-white/50 mb-2">
                        Agregar código de cupón
                    </label>
                    <div className="flex gap-2">
                        <Input
                            placeholder="CÓDIGO"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            onKeyDown={(e) => e.key === 'Enter' && handleValidate()}
                            className="h-10 font-mono uppercase text-sm border-white/50 bg-white/60 focus:ring-slate-300/60 dark:bg-white/[0.05] dark:border-white/[0.10] dark:text-white dark:placeholder:text-white/30"
                            autoFocus
                        />
                        <Button
                            onClick={handleValidate}
                            disabled={!code.trim() || validating}
                            className="h-10 px-4"
                        >
                            {validating ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Check className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </div>

                {/* Applied coupons list */}
                <div className="px-4 py-3 min-h-[80px]">
                    {appliedCoupons.length === 0 ? (
                        <div className="flex items-center justify-center py-6 text-sm text-slate-400">
                            No hay cupones aplicados
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <p className="text-xs font-medium text-slate-600 dark:text-white/50 mb-2">Cupones aplicados</p>
                            {appliedCoupons.map((coupon) => (
                                <div
                                    key={coupon.code}
                                    className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2.5 dark:bg-emerald-500/[0.10] dark:border-emerald-500/[0.20]"
                                >
                                    <div className="flex items-center gap-2">
                                        <Tag className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                        <span className="font-mono font-semibold text-sm text-emerald-800 dark:text-emerald-300">
                                            {coupon.code}
                                        </span>
                                        <span className="text-xs text-emerald-600 dark:text-emerald-400">
                                            {coupon.type === 'PERCENTAGE'
                                                ? `${coupon.value}% off`
                                                : coupon.type === 'FIXED_AMOUNT'
                                                    ? `${currencyFormatter.format(coupon.value)} off`
                                                    : 'Envío gratis'}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => onRemoveCoupon(coupon.code)}
                                        className="text-emerald-400 hover:text-red-500 transition-colors p-1"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="px-4 pb-4 bg-white/20 backdrop-blur-sm dark:bg-white/[0.03]">
                    <Button variant="outline" className="w-full" onClick={onClose}>
                        Listo
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default CouponModal
