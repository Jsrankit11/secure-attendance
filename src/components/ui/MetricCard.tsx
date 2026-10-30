import React from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from './GlassCard';
import { StatusPill } from './StatusPill';
import { Badge } from './Badge';
import { IntegrityStatus } from '../../types';

interface MetricCardProps {
  title: string;
  value: number;
  suffix?: string;
  change?: string;
  isPositive?: boolean;
  status?: IntegrityStatus | 'NEUTRAL';
  description?: string;
  icon?: React.ReactNode;
  showDemoBadge?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  suffix = '',
  change,
  isPositive = true,
  status = 'NEUTRAL',
  description,
  icon,
  showDemoBadge = true,
}) => {
  return (
    <GlassCard
      glow={status === 'VERIFIED' ? 'emerald' : status === 'FAILED' ? 'danger' : 'cyan'}
      tilt={true}
      className="flex flex-col justify-between group"
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="micro-label text-text-muted">{title}</span>
          <div className="flex items-center gap-1.5">
            {showDemoBadge && <Badge variant="demo" size="sm">DEMO DATA</Badge>}
            {icon && <div className="text-text-muted group-hover:text-accent-emerald transition-colors">{icon}</div>}
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="text-3xl lg:text-4xl font-heading font-extrabold tracking-tight text-text-primary"
          >
            {value.toLocaleString()}
          </motion.span>
          {suffix && <span className="font-mono text-base text-accent-cyan font-bold">{suffix}</span>}
        </div>

        {description && (
          <p className="text-xs text-text-muted leading-relaxed line-clamp-2 mb-3">
            {description}
          </p>
        )}
      </div>

      <div className="pt-3 border-t border-border-subtle flex items-center justify-between text-xs">
        {change && (
          <span
            className={`font-mono text-[11px] font-semibold flex items-center gap-1 ${
              isPositive ? 'text-accent-emerald' : 'text-danger'
            }`}
          >
            <span>{isPositive ? '↑' : '↓'}</span>
            <span>{change}</span>
          </span>
        )}
        {status !== 'NEUTRAL' && (
          <StatusPill status={status} size="sm" showIcon={false} />
        )}
      </div>
    </GlassCard>
  );
};
