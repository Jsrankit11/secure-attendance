import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: 'none' | 'emerald' | 'cyan' | 'danger';
  hoverEffect?: boolean;
  onClick?: () => void;
  tilt?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  glow = 'none',
  hoverEffect = true,
  onClick,
  tilt = false,
}) => {
  const glowStyles = {
    none: '',
    emerald: 'hover:shadow-[0_0_28px_rgba(0,245,160,0.15)] hover:border-accent-emerald/40',
    cyan: 'hover:shadow-[0_0_28px_rgba(53,201,255,0.15)] hover:border-accent-cyan/40',
    danger: 'hover:shadow-[0_0_28px_rgba(255,77,106,0.2)] hover:border-danger/40',
  }[glow];

  return (
    <motion.div
      whileHover={
        tilt
          ? {
              rotateX: 2,
              rotateY: -2,
              scale: 1.01,
              transition: { duration: 0.2 },
            }
          : hoverEffect
          ? { y: -2, transition: { duration: 0.2 } }
          : undefined
      }
      onClick={onClick}
      className={`relative rounded-xl border border-border-subtle bg-bg-surface/80 backdrop-blur-xl p-5 overflow-hidden transition-colors ${glowStyles} ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </motion.div>
  );
};
