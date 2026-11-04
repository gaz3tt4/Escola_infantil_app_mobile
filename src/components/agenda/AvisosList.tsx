import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { LucideIcon } from 'lucide-react-native';

import { Card } from '../ui/Card';
import { Icon } from '../ui/Icon';
import { CalendarCheck, Megaphone, PartyPopper, Star } from '../ui/icons';
import type { Aviso } from '../../services/types';
import { spacing, useColors, type Palette } from '../../theme';
import { formatDateBR } from '../../utils/format';

interface VisualTipo {
  icon: LucideIcon;
  label: string;
  bg: string;
  fg: string;
}

// Cores do design system; tipo desconhecido cai em `geral`.
function visuais(colors: Palette): { geral: VisualTipo; porTipo: Record<string, VisualTipo> } {
  const geral: VisualTipo = { icon: Megaphone, label: 'Aviso', bg: colors.brandSoft, fg: colors.brandDark };
  return {
    geral,
    porTipo: {
      // O tipo `feriado` segue valendo para avisos antigos que a API ainda devolve.
      feriado: { icon: CalendarCheck, label: 'Feriado', bg: colors.coralSoft, fg: colors.coralStrong },
      aula_extra: { icon: Star, label: 'Aula extra', bg: colors.lavenderSoft, fg: colors.lavenderStrong },
      evento: { icon: PartyPopper, label: 'Evento', bg: colors.skySoft, fg: colors.skyStrong },
      geral,
    },
  };
}

export function visualDoAviso(colors: Palette, tipo: string | undefined): VisualTipo {
  const { geral, porTipo } = visuais(colors);
  return (tipo && porTipo[tipo]) || geral;
}

function periodo(aviso: Aviso): string {
  if (aviso.data_fim && aviso.data_fim !== aviso.data) {
    return `${formatDateBR(aviso.data)} a ${formatDateBR(aviso.data_fim)}`;
  }
  return formatDateBR(aviso.data);
}

/** Avisos da escola (admin, por turma): feriados, aulas extras e comunicados. */
export function AvisosList({ avisos }: { avisos: Aviso[] }) {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  if (avisos.length === 0) return null;

  return (
    <Card>
      <Text style={styles.title}>Avisos da escola</Text>
      <View style={styles.list}>
        {avisos.map((aviso) => {
          const visual = visualDoAviso(colors, aviso.tipo);
          return (
          <View key={aviso.id} style={styles.item}>
            <View style={[styles.iconWrap, { backgroundColor: visual.bg }]}>
              <Icon icon={visual.icon} color={visual.fg} />
            </View>
            <View style={styles.itemBody}>
              <Text style={[styles.periodo, { color: visual.fg }]}>
                {visual.label} · {periodo(aviso)}
              </Text>
              <Text style={styles.itemTitle}>{aviso.titulo}</Text>
              <Text style={styles.itemText}>{aviso.texto}</Text>
            </View>
          </View>
          );
        })}
      </View>
    </Card>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  list: {
    gap: spacing.md,
  },
  item: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemBody: {
    flex: 1,
  },
  periodo: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  itemText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
});
