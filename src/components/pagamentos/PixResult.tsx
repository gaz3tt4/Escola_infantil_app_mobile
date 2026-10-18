import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { CopyButton } from '../ui/CopyButton';
import { Notice } from '../ui/Notice';
import type { ResultadoPagamento } from '../../services/faturas';
import { colors, radius, spacing } from '../../theme';
import { formatDateTimeBR } from '../../utils/format';

type PixData = Extract<ResultadoPagamento, { forma: 'pix' }>;

export function PixResult({ data }: { data: PixData }) {
  if (!data.copiaECola && !data.qrCodeBase64) {
    return <Notice message="O Pix foi gerado, mas o código não veio na resposta. Tente novamente em instantes." />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.hint}>Escaneie o QR code no app do seu banco ou copie o código Pix.</Text>

      {data.qrCodeBase64 ? (
        <View style={styles.qrWrapper}>
          <Image
            source={{ uri: `data:image/png;base64,${data.qrCodeBase64}` }}
            style={styles.qr}
            resizeMode="contain"
            accessibilityLabel="QR code Pix"
          />
        </View>
      ) : null}

      {data.expiracao ? <Text style={styles.expiracao}>Válido até {formatDateTimeBR(data.expiracao)}</Text> : null}

      {data.copiaECola ? (
        <>
          <View style={styles.codeBox}>
            <Text style={styles.code} numberOfLines={3} selectable>
              {data.copiaECola}
            </Text>
          </View>
          <View style={styles.stretch}>
            <CopyButton value={data.copiaECola} label="Copiar código Pix" />
          </View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
    alignItems: 'center',
  },
  hint: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  qrWrapper: {
    width: 200,
    height: 200,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qr: {
    width: 180,
    height: 180,
  },
  expiracao: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.warning,
  },
  codeBox: {
    alignSelf: 'stretch',
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
  },
  code: {
    fontSize: 12,
    color: colors.textPrimary,
  },
  stretch: {
    alignSelf: 'stretch',
  },
});
