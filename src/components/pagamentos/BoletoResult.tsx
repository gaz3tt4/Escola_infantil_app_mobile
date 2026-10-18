import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../ui/Button';
import { CopyButton } from '../ui/CopyButton';
import { Notice } from '../ui/Notice';
import type { ResultadoPagamento } from '../../services/faturas';
import { colors, radius, spacing } from '../../theme';
import { openExternalUrl } from '../../utils/links';

type BoletoData = Extract<ResultadoPagamento, { forma: 'boleto' }>;

export function BoletoResult({ data }: { data: BoletoData }) {
  if (!data.linhaDigitavel && !data.urlPdf) {
    return <Notice message="O boleto foi gerado, mas os dados não vieram na resposta. Tente novamente em instantes." />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.hint}>Pague com a linha digitável no app do seu banco ou abra o boleto em PDF.</Text>

      {data.linhaDigitavel ? (
        <>
          <View style={styles.codeBox}>
            <Text style={styles.code} selectable>
              {data.linhaDigitavel}
            </Text>
          </View>
          <CopyButton value={data.linhaDigitavel} label="Copiar linha digitável" />
        </>
      ) : null}

      {data.urlPdf ? (
        <Button title="Abrir boleto em PDF" variant="outline" onPress={() => openExternalUrl(data.urlPdf ?? '')} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  hint: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  codeBox: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
  },
  code: {
    fontSize: 14,
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
  },
});
