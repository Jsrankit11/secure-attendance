import React from 'react';

interface SectionHeaderProps {
  number: string; // e.g. "01", "02", "03"
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  badgeText?: string;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  number,
  title,
  subtitle,
  action,
  badgeText,
  className = '',
}) => {
  return (
    <div className={`relative flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-border-subtle ${className}`}>
      {/* Oversized Ghost Number */}
      <span className="absolute -top-6 -left-3 text-7xl md:text-8xl font-mono font-black ghost-number pointer-events-none select-none">
        {number}
      </span>

      <div className="relative z-10 pl-1">
        <div className="flex items-center gap-3 mb-1.5">
          <span className="micro-label text-accent-emerald flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald animate-ping" />
            SECTION {number}
          </span>
          {badgeText && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan">
              {badgeText}
            </span>
          )}
        </div>
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-heading font-extrabold tracking-tight text-text-primary">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm md:text-base text-text-muted mt-1 max-w-2xl">
            {subtitle}
          </p>
        )}
      </div>

      {action && (
        <div className="relative z-10 shrink-0 flex items-center gap-3">
          {action}
        </div>
      )}
    </div>
  );
};
