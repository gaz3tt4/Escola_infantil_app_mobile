import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '../../theme/colors';
import { calculateAge } from '../../utils/format';
import type { Child } from '../../types';

function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export function ChildHeader({ child }: { child: Child }) {
  return (
    <View style={styles.container}>
      {child.foto_url ? (
        <Image source={{ uri: child.foto_url }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarFallback]}>
          <Text style={styles.avatarInitials}>{initials(child.nome)}</Text>
        </View>
      )}
      <View>
        <Text style={styles.name}>{child.nome}</Text>
        <Text style={styles.meta}>
          {calculateAge(child.data_nascimento)} anos · {child.turma.nome}
        </Text>
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
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarFallback: {
    backgroundColor: colors.schoolGreenSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.schoolGreenDark,
  },
  name: {
    fontSize: 19,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  meta: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
