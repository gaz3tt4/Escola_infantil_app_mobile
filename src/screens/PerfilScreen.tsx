import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { getChildProfile, getRecados } from '../api/profile';
import { ChildHeader } from '../components/perfil/ChildHeader';
import { RecadoCard } from '../components/perfil/RecadoCard';
import { StatGrid } from '../components/perfil/StatGrid';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingView } from '../components/ui/LoadingView';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { useChildren } from '../context/ChildContext';
import { colors, spacing } from '../theme/colors';
import type { ChildProfile, Recado } from '../types';

export function PerfilScreen() {
  const { selectedChild } = useChildren();
  const [profile, setProfile] = useState<ChildProfile | null>(null);
  const [recados, setRecados] = useState<Recado[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(
    async (showSpinner = true) => {
      if (!selectedChild) return;
      if (showSpinner) setIsLoading(true);
      try {
        const [profileData, recadosData] = await Promise.all([
          getChildProfile(selectedChild.id),
          getRecados(selectedChild.id),
        ]);
        setProfile(profileData);
        setRecados(recadosData);
      } finally {
        setIsLoading(false);
        setRefreshing(false);
      }
    },
    [selectedChild]
  );

  useEffect(() => {
    load();
  }, [load]);

  if (!selectedChild) {
    return <LoadingView label="Carregando..." />;
  }

  return (
    <ScreenContainer
      refreshing={refreshing}
      onRefresh={() => {
        setRefreshing(true);
        load(false);
      }}
    >
      <ChildHeader child={selectedChild} />

      {isLoading ? (
        <LoadingView label="Carregando perfil..." />
      ) : (
        <>
          {profile ? <StatGrid profile={profile} /> : null}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recados</Text>
            {recados.length === 0 ? (
              <EmptyState icon="💌" title="Nenhum recado por aqui" description="Quando a escola enviar um recado, ele aparece nesta lista." />
            ) : (
              <View style={styles.recadosList}>
                {recados.map((recado) => (
                  <RecadoCard key={recado.id} recado={recado} />
                ))}
              </View>
            )}
          </View>
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  recadosList: {
    gap: spacing.sm,
  },
});
