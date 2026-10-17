import * as Clipboard from 'expo-clipboard';
import React, { useEffect, useState } from 'react';

import { Button } from './Button';

interface CopyButtonProps {
  value: string;
  label: string;
  variant?: 'primary' | 'outline';
}

/** Copia `value` para a área de transferência e confirma por 2 segundos. */
export function CopyButton({ value, label, variant = 'primary' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  async function handleCopy() {
    await Clipboard.setStringAsync(value);
    setCopied(true);
  }

  return <Button title={copied ? 'Copiado!' : label} variant={variant} onPress={handleCopy} />;
}
