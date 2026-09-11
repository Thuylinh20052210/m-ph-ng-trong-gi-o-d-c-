import React, { useMemo } from 'react';
import katex from 'katex';

interface MathFormulaProps {
  math: string;
  displayMode?: boolean;
  className?: string;
}

export const MathFormula: React.FC<MathFormulaProps> = ({
  math,
  displayMode = true,
  className = ''
}) => {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math, {
        displayMode,
        throwOnError: false,
      });
    } catch {
      return math;
    }
  }, [math, displayMode]);

  return (
    <div
      className={`overflow-x-auto select-text font-serif text-slate-900 ${
        displayMode ? 'py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-center' : 'inline-block px-1'
      } ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
