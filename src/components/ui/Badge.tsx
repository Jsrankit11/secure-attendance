import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'emerald' | 'cyan' | 'warning' | 'danger' | 'neutral' | 'demo';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  icon,
  className = '',
}) => {
  const variantStyles = {
    emerald: 'bg-accent-emerald/10 border-accent-emerald/30 text-accent-emerald',
    cyan: 'bg-accent-cyan/10 border-accent-cyan/30 text-accent-cyan',
    warning: 'bg-warning/10 border-warning/30 text-warning',
    danger: 'bg-danger/10 border-danger/30 text-danger',
    neutral: 'bg-white/[0.04] border-border-subtle text-text-muted',
    demo: 'bg-accent-cyan/15 border-accent-cyan/40 text-accent-cyan font-mono font-bold tracking-widest text-[9px] uppercase shadow-[0_0_8px_rgba(53,201,255,0.2)]',
  }[variant];

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 rounded-full',
    md: 'text-[11px] px-2.5 py-1 rounded-full',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 border font-mono font-medium tracking-wide uppercase select-none ${variantStyles} ${sizeStyles} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
};
