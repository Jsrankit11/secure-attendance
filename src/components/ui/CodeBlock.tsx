import React from 'react';
import { CopyButton } from './CopyButton';

interface CodeBlockProps {
  code: string;
  language?: string;
  label?: string;
  highlightDiff?: boolean;
  highlightedIndices?: number[];
  className?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = 'text',
  label,
  highlightDiff = false,
  highlightedIndices = [],
  className = '',
}) => {
  return (
    <div className={`relative rounded-xl border border-border-subtle bg-bg-base/90 overflow-hidden font-mono text-xs ${className}`}>
      {(label || language) && (
        <div className="flex items-center justify-between px-3.5 py-2 border-b border-border-subtle bg-bg-elevated/40 text-[11px] text-text-muted">
          <span className="font-semibold tracking-wider uppercase text-accent-cyan flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-accent-cyan/40" />
            {label || language}
          </span>
          <CopyButton value={code} />
        </div>
      )}

      <div className="p-3.5 overflow-x-auto leading-relaxed text-text-primary select-all">
        {highlightDiff && highlightedIndices.length > 0 ? (
          <span>
            {Array.from(code).map((char, index) => {
              const isChanged = highlightedIndices.includes(index);
              return (
                <span
                  key={index}
                  className={
                    isChanged
                      ? 'bg-danger/25 text-danger font-bold px-0.5 rounded border border-danger/40 animate-pulse'
                      : ''
                  }
                >
                  {char}
                </span>
              );
            })}
          </span>
        ) : (
          <code>{code}</code>
        )}
      </div>
    </div>
  );
};
