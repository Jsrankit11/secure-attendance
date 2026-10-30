import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'relative inline-flex items-center justify-center font-heading font-semibold transition-all duration-200 select-none focus:outline-none focus:ring-2 focus:ring-accent-emerald/40 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 rounded-[8px] gap-1.5',
    md: 'text-sm px-4 py-2 rounded-[10px] gap-2',
    lg: 'text-base px-6 py-3 rounded-[12px] gap-2.5',
  }[size];

  const variantStyles = {
    primary: 'bg-accent-emerald text-[#08090B] hover:bg-[#00F5A0]/90 shadow-[0_0_20px_rgba(0,245,160,0.25)] hover:shadow-[0_0_25px_rgba(0,245,160,0.4)] font-bold',
    ghost: 'text-text-primary hover:bg-white/[0.06] hover:text-accent-emerald',
    outline: 'border border-border-subtle hover:border-accent-emerald/50 bg-bg-surface/50 text-text-primary hover:bg-white/[0.04] backdrop-blur-md',
    danger: 'bg-danger text-white hover:bg-danger/90 shadow-[0_0_18px_rgba(255,77,106,0.3)]',
  }[variant];

  return (
    <button
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        icon && <span className="inline-flex shrink-0">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
};
