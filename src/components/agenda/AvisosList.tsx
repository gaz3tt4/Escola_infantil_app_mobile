import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { LucideIcon } from 'lucide-react-native';

import { Card } from '../ui/Card';
import { Icon } from '../ui/Icon';
import { CalendarCheck, Megaphone, PartyPopper, Star } from '../ui/icons';
import type { Aviso } from '../../services/types';
import { colors, spacing } from '../../theme';
import { formatDateBR } from '../../utils/format';

interface VisualTipo {
  icon: LucideIcon;
  label: string;
  bg: string;
  fg: string;
}

// Cores do design system; tipo desconhecido cai em `geral`.
const GERAL: VisualTipo = { icon: Megaphone, label: 'Aviso', bg: colors.brandSoft, fg: colors.brandDark };
const VISUAL_POR_TIPO: Record<string, VisualTipo> = {
  feriado: { icon: CalendarCheck, label: 'Feriado', bg: colors.coralSoft, fg: '#B23A2C' },
  aula_extra: { icon: Star, label: 'Aula extra', bg: colors.lavenderSoft, fg: '#5B4FBF' },
  evento: { icon: PartyPopper, label: 'Evento', bg: colors.skySoft, fg: '#1E6FA8' },
  geral: GERAL,
};

export function visualDoAviso(tipo: string | undefined): VisualTipo {
  return (tipo && VISUAL_POR_TIPO[tipo]) || GERAL;
}

function periodo(aviso: Aviso): string {
  if (aviso.data_fim && aviso.data_fim !== aviso.data) {
    return `${formatDateBR(aviso.data)} a ${formatDateBR(aviso.data_fim)}`;
  }
  return formatDateBR(aviso.data);
}

/** Avisos da escola (admin, por turma): feriados, aulas extras e comunicados. */
export function AvisosList({ avisos }: { avisos: Aviso[] }) {
  if (avisos.length === 0) return null;

  return (
    <Card>
      <Text style={styles.title}>Avisos da escola</Text>
      <View style={styles.list}>
        {avisos.map((aviso) => {
          const visual = visualDoAviso(aviso.tipo);
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

const styles = StyleSheet.create({
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
