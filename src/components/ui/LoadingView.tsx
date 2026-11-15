import React from 'react';

import { CentopeiaLoader } from './CentopeiaLoader';

/** Mesmo loader do app (mascote girando); mantido por compatibilidade com quem já o usa. */
export function LoadingView({ label }: { label?: string }) {
  return <CentopeiaLoader label={label} />;
}
