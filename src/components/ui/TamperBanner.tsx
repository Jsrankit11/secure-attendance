import React from 'react';
import { ShieldAlert, AlertTriangle, ShieldCheck, Info } from 'lucide-react';
import { Button } from './Button';

interface TamperBannerProps {
  title?: string;
  description: string;
  recordId?: string;
  onVerifyAgain?: () => void;
  onAuthorizedFix?: () => void;
  className?: string;
}

export const TamperBanner: React.FC<TamperBannerProps> = ({
  title = 'CRYPTOGRAPHIC TAMPERING DETECTED',
  description,
  recordId,
  onVerifyAgain,
  onAuthorizedFix,
  className = '',
}) => {
  return (
    <div
      className={`relative rounded-xl border border-danger/60 bg-danger/10 backdrop-blur-xl p-4 sm:p-5 shadow-[0_0_30px_rgba(255,77,106,0.18)] ${className}`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-danger/20 text-danger border border-danger/40 shrink-0 mt-0.5">
            <ShieldAlert className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="micro-label text-danger font-bold">SECURITY ALERT</span>
              {recordId && (
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-black/40 text-danger border border-danger/30">
                  {recordId}
                </span>
              )}
            </div>
            <h4 className="text-base font-heading font-bold text-white mt-0.5">
              {title}
            </h4>
            <p className="text-xs sm:text-sm text-text-muted mt-1 leading-relaxed max-w-2xl">
              {description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
          {onVerifyAgain && (
            <Button size="sm" variant="outline" onClick={onVerifyAgain}>
              Re-Verify
            </Button>
          )}
          {onAuthorizedFix && (
            <Button size="sm" variant="danger" onClick={onAuthorizedFix}>
              Authorize & Re-sign
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
