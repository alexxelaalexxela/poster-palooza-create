import { useState, useEffect } from 'react';
import { usePosterStore } from '@/store/usePosterStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface PromoCodeProps {
  compact?: boolean;
  variant?: 'light' | 'dark';
}

const PromoCode = ({ compact = false, variant = 'light' }: PromoCodeProps) => {
  const { toast } = useToast();
  const {
    promoCode,
    promoApplied,
    promoPercent,
    price,
    applyPromoCode,
    clearPromoCode,
  } = usePosterStore();

  const [value, setValue] = useState<string>(promoCode ?? '');

  useEffect(() => {
    setValue(promoCode ?? '');
  }, [promoCode]);

  const onApply = () => {
    const ok = applyPromoCode(value);
    if (!ok) {
      toast({ title: 'Code invalide', description: 'Le code promo est incorrect ou expiré.', variant: 'destructive' });
    } else {
      toast({ title: 'Code appliqué', description: `Réduction de ${promoPercent || 25}% activée.` });
    }
  };

  if (promoApplied) {
    const percent = Number(promoPercent || 0);
    const savedAmount = percent > 0 ? Number(((price * (percent / 100)) / (1 - percent / 100)).toFixed(2)) : 0;
    const fmt = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });

    const savedText = variant === 'dark' ? 'text-green-300' : 'text-green-700';
    const removeBtn = variant === 'dark'
      ? 'border-white/20 text-white hover:bg-white/10'
      : 'border-neutral-300 text-neutral-800 hover:bg-neutral-100';

    const badgeClass =
      variant === 'dark'
        ? 'border-green-400/40 text-green-200 bg-green-500/10'
        : 'border-green-500/40 text-green-700 bg-green-50';

    return (
      <div className="flex items-center justify-between gap-3">
        <Badge variant="outline" className={badgeClass}>
          Code {(promoCode || '').toUpperCase()} appliqué −{percent}%
        </Badge>
        <div className="flex items-center gap-2">
          {savedAmount > 0 && (
            <span className={`text-sm font-medium ${savedText}`}>−{fmt.format(savedAmount)}</span>
          )}
          <Button
            onClick={clearPromoCode}
            size="sm"
            variant="outline"
            className={`h-7 rounded-full px-3 ${removeBtn}`}
          >
            Retirer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={compact ? 'flex items-center gap-2' : 'space-y-2'}>
      {!compact && (
        <p className={variant === 'dark' ? 'text-white/80 text-sm' : 'text-neutral-900 text-sm'}>
          
        </p>
      )}
      <div className="flex items-center gap-2">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Code promo (si applicable) "
          className={
            variant === 'dark'
              ? 'bg-white/10 border-white/20 text-white placeholder:text-white/60'
              : 'bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-500'
          }
        />
        <Button
          onClick={onApply}
          variant="outline"
          size="sm"
          className={
            variant === 'dark'
              ? 'bg-transparent border-white/20 text-white hover:bg-white/10'
              : 'border-neutral-300 text-neutral-900 hover:bg-neutral-100'
          }
        >
          Appliquer
        </Button>
      </div>
    </div>
  );
};

export default PromoCode;


