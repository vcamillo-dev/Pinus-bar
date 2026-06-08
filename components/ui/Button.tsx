import { cn } from '@/lib/utils';
import type { ButtonHTMLAttributes } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'gold' | 'forest' | 'ghost' | 'danger';
  size?:    'sm' | 'md' | 'lg';
  loading?: boolean;
}

const VARIANTS = {
  gold:   'bg-gold   text-bark      hover:bg-gold-light  disabled:opacity-50',
  forest: 'bg-forest text-cream     hover:bg-forest-mid  disabled:opacity-50',
  ghost:  'bg-transparent text-forest border border-forest hover:bg-forest/5',
  danger: 'bg-red-600 text-white    hover:bg-red-700     disabled:opacity-50',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3.5 text-base rounded-xl',
};

export default function Button({
  variant = 'gold',
  size    = 'md',
  loading = false,
  className,
  children,
  disabled,
  ...rest
}: Props) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'font-bold transition-all active:scale-95 cursor-pointer',
        VARIANTS[variant],
        SIZES[size],
        (disabled || loading) && 'cursor-not-allowed',
        className
      )}
      {...rest}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z" />
          </svg>
          Aguarde...
        </span>
      ) : children}
    </button>
  );
}
