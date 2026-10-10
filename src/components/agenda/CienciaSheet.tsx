import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BottomSheet } from '../ui/BottomSheet';
import { Button } from '../ui/Button';
import { Mascote } from '../ui/Mascote';
import { Notice } from '../ui/Notice';
import { colors, spacing } from '../../theme';

interface CienciaSheetProps {
  visible: boolean;
  loading: boolean;
  error: string | null;
  onConfirm: () => void;
  onClose: () => void;
}

/** Pop-up de confirmação de ciência, aberto ao chegar ao fim da agenda. */
export function CienciaSheet({ visible, loading, error, onConfirm, onClose }: CienciaSheetProps) {
  return (
    <BottomSheet visible={visible} title="Confirmar ciência" onClose={loading ? () => undefined : onClose}>
      <View style={styles.body}>
        <Mascote size={30} segments={3} />
        <Text style={styles.text}>Você leu a agenda de hoje e está ciente das informações do dia?</Text>
      </View>
      {error ? <Notice message={error} /> : null}
      <Button title={error ? 'Tentar novamente' : 'Estou ciente'} onPress={onConfirm} loading={loading} />
      <Button title="Agora não" variant="outline" onPress={onClose} disabled={loading} />
    </BottomSheet>
  );
}

/** Barra fixa no rodapé para agendas curtas, que cabem na tela sem rolar (decisão 11). */
export function CienciaBarra({
  loading,
  error,
  onConfirm,
}: {
  loading: boolean;
  error: string | null;
  onConfirm: () => void;
}) {
  return (
    <View style={styles.barra}>
      {error ? <Notice message={error} /> : null}
      <Button title={error ? 'Tentar novamente' : 'Confirmar ciência'} onPress={onConfirm} loading={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  text: {
    fontSize: 15,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 22,
  },
  barra: {
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
