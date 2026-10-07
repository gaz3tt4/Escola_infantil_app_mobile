import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PERIODO_LABEL } from '../../services/alunos';
import type { Aluno } from '../../services/types';
import { colors, spacing } from '../../theme';

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export function alunoMeta(aluno: Aluno): string {
  const idade = `${aluno.idade} ${aluno.idade === 1 ? 'ano' : 'anos'}`;
  const turma = aluno.turma ?? 'Sem turma ativa';
  const periodo = aluno.periodo ? ` · ${PERIODO_LABEL[aluno.periodo]}` : '';
  return `${idade} · ${turma}${periodo}`;
}

export function ChildHeader({ aluno }: { aluno: Aluno }) {
  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarInitials}>{initials(aluno.nome)}</Text>
      </View>
      <View style={styles.texts}>
        <Text style={styles.name}>{aluno.nome}</Text>
        <Text style={styles.meta}>{alunoMeta(aluno)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.onBrand,
  },
  texts: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  meta: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
