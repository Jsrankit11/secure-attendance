import React from 'react';
import { CheckCircle2, AlertTriangle, ShieldAlert, ShieldCheck } from 'lucide-react';
import { IntegrityStatus } from '../../types';

interface StatusPillProps {
  status: IntegrityStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  pulsing?: boolean;
  className?: string;
}

export const StatusPill: React.FC<StatusPillProps> = ({
  status,
  size = 'md',
  showIcon = true,
  pulsing = false,
  className = '',
}) => {
  const configs = {
    VERIFIED: {
      text: 'VERIFIED',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-accent-emerald shrink-0" />,
      bg: 'bg-accent-emerald/10',
      border: 'border-accent-emerald/40',
      textColor: 'text-accent-emerald',
      glow: 'shadow-[0_0_12px_rgba(0,245,160,0.25)]',
    },
    WARNING: {
      text: 'WARNING',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-warning shrink-0" />,
      bg: 'bg-warning/10',
      border: 'border-warning/40',
      textColor: 'text-warning',
      glow: 'shadow-[0_0_12px_rgba(255,176,32,0.25)]',
    },
    FAILED: {
      text: 'FAILED',
      icon: <ShieldAlert className="w-3.5 h-3.5 text-danger shrink-0" />,
      bg: 'bg-danger/10',
      border: 'border-danger/40',
      textColor: 'text-danger',
      glow: 'shadow-[0_0_15px_rgba(255,77,106,0.3)] animate-pulse',
    },
  }[status];

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-[11px] px-2.5 py-1 gap-1.5',
    lg: 'text-xs px-3 py-1.5 gap-2 font-bold',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full font-mono font-semibold tracking-wider border backdrop-blur-md ${configs.bg} ${configs.border} ${configs.textColor} ${configs.glow} ${sizeStyles} ${className}`}
    >
      {pulsing && (
        <span className="relative flex h-2 w-2 mr-0.5">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              status === 'VERIFIED' ? 'bg-accent-emerald' : status === 'WARNING' ? 'bg-warning' : 'bg-danger'
            }`}
          />
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              status === 'VERIFIED' ? 'bg-accent-emerald' : status === 'WARNING' ? 'bg-warning' : 'bg-danger'
            }`}
          />
        </span>
      )}
      {showIcon && configs.icon}
      <span>{configs.text}</span>
    </span>
  );
};
