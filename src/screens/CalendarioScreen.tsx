import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Card } from '../components/ui/Card';
import { CentopeiaLoader } from '../components/ui/CentopeiaLoader';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { Icon } from '../components/ui/Icon';
import { CalendarDays, ChevronLeft, ChevronRight } from '../components/ui/icons';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { useAsyncResource } from '../hooks/useAsyncResource';
import { listarCalendario } from '../services/calendario';
import type { DataCalendario } from '../services/types';
import { radius, spacing, useColors, useTypography, type Palette } from '../theme';
import {
  agruparPorDia,
  corValida,
  DIAS_SEMANA,
  isoDia,
  NOMES_MESES,
  semanasDoMes,
  textoSobre,
} from '../utils/calendario';
import { formatDateBR, todayISO } from '../utils/format';

const SEM_DATAS: DataCalendario[] = [];

export function CalendarioScreen() {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const typography = useTypography();
  const hoje = todayISO();
  const [ano, setAno] = useState(() => Number(hoje.slice(0, 4)));
  const [mes, setMes] = useState(() => Number(hoje.slice(5, 7)) - 1);
  const [selecionado, setSelecionado] = useState<string | null>(null);

  // Uma busca por ano; trocar de mês dentro do ano não volta à API.
  const loader = useCallback(() => listarCalendario(ano), [ano]);
  const { data, error, isLoading, isRefreshing, reload } = useAsyncResource(loader);

  const porDia = useMemo(() => agruparPorDia(data ?? SEM_DATAS), [data]);
  const prefixoMes = isoDia(ano, mes, 1).slice(0, 7);
  const doMes = useMemo(
    () => (data ?? SEM_DATAS).filter((item) => item.data.slice(0, 7) === prefixoMes),
    [data, prefixoMes]
  );

  function mudarMes(delta: number) {
    const total = ano * 12 + mes + delta;
    setAno(Math.floor(total / 12));
    setMes(total % 12);
    setSelecionado(null);
  }

  const detalhes = selecionado ? (porDia.get(selecionado) ?? SEM_DATAS) : doMes;

  return (
    <ScreenContainer edges={[]} refreshing={isRefreshing} onRefresh={reload}>
      <View style={styles.mesNav}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => mudarMes(-1)}
          accessibilityRole="button"
          accessibilityLabel="Mês anterior"
        >
          <Icon icon={ChevronLeft} color="onBrand" />
        </TouchableOpacity>
        <Text style={styles.mesLabel} accessibilityLiveRegion="polite">
          {NOMES_MESES[mes]} {ano}
        </Text>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => mudarMes(1)}
          accessibilityRole="button"
          accessibilityLabel="Próximo mês"
        >
          <Icon icon={ChevronRight} color="onBrand" />
        </TouchableOpacity>
      </View>

      {isLoading ? <CentopeiaLoader label="Carregando calendário..." /> : null}
      {error ? <ErrorState message={error} onRetry={reload} /> : null}

      {data ? (
        <>
          <Card>
            <View style={styles.linha}>
              {DIAS_SEMANA.map((letra, i) => (
                <Text key={i} style={styles.semana} accessible={false}>
                  {letra}
                </Text>
              ))}
            </View>
            {semanasDoMes(ano, mes).map((semana, i) => (
              <View key={i} style={styles.linha}>
                {semana.map((dia, j) => {
                  const iso = dia ? isoDia(ano, mes, dia) : null;
                  return (
                    <Dia
                      key={j}
                      dia={dia}
                      iso={iso}
                      datas={iso ? (porDia.get(iso) ?? SEM_DATAS) : SEM_DATAS}
                      hoje={hoje}
                      selecionado={selecionado}
                      onSelect={setSelecionado}
                    />
                  );
                })}
              </View>
            ))}
          </Card>

          <Text style={typography.sectionTitle}>
            {selecionado ? formatDateBR(selecionado) : `Datas de ${NOMES_MESES[mes].toLowerCase()}`}
          </Text>
          {detalhes.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title={selecionado ? 'Nenhuma data neste dia' : 'Sem datas neste mês'}
              description={selecionado ? undefined : 'A escola não marcou datas para este mês.'}
            />
          ) : (
            detalhes.map((item) => <DataCard key={item.id} item={item} mostrarDia={!selecionado} />)
          )}
        </>
      ) : null}
    </ScreenContainer>
  );
}

interface DiaProps {
  dia: number | null;
  iso: string | null;
  datas: DataCalendario[];
  hoje: string;
  selecionado: string | null;
  onSelect: (iso: string | null) => void;
}

function Dia({ dia, iso, datas, hoje, selecionado, onSelect }: DiaProps) {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  if (!dia || !iso) return <View style={styles.celula} />;

  const fundo = datas.length > 0 ? corValida(datas[0].cor, colors.brand) : undefined;
  const ativo = iso === selecionado;
  const rotulo = datas.length > 0 ? `${formatDateBR(iso)}: ${datas.map((d) => d.titulo).join(', ')}` : formatDateBR(iso);

  return (
    <TouchableOpacity
      style={styles.celula}
      onPress={() => onSelect(ativo ? null : iso)}
      accessibilityRole="button"
      accessibilityState={{ selected: ativo }}
      accessibilityLabel={rotulo}
    >
      <View
        style={[
          styles.dia,
          fundo ? { backgroundColor: fundo } : null,
          iso === hoje && styles.diaHoje,
          ativo && styles.diaAtivo,
        ]}
      >
        <Text style={[styles.diaTexto, fundo ? { color: textoSobre(fundo), fontWeight: '700' } : null]}>{dia}</Text>
      </View>
      <View style={styles.pontos}>
        {datas.slice(1, 4).map((d) => (
          <View key={d.id} style={[styles.ponto, { backgroundColor: corValida(d.cor, colors.brand) }]} />
        ))}
      </View>
    </TouchableOpacity>
  );
}

function DataCard({ item, mostrarDia }: { item: DataCalendario; mostrarDia: boolean }) {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const cor = corValida(item.cor, colors.brand);
  return (
    <Card style={styles.dataCard}>
      <View style={[styles.faixa, { backgroundColor: cor }]} />
      <View style={styles.dataCorpo}>
        {mostrarDia ? <Text style={styles.dataDia}>{formatDateBR(item.data)}</Text> : null}
        <Text style={styles.dataTitulo}>{item.titulo}</Text>
        {item.descricao ? <Text style={styles.dataDescricao}>{item.descricao}</Text> : null}
      </View>
    </Card>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  mesNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  navButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mesLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  linha: {
    flexDirection: 'row',
  },
  semana: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    paddingBottom: spacing.xs,
  },
  celula: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 2,
    minHeight: 48,
  },
  dia: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  diaHoje: {
    borderColor: colors.border,
  },
  diaAtivo: {
    borderColor: colors.brandDark,
  },
  diaTexto: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  pontos: {
    flexDirection: 'row',
    gap: 2,
    height: 6,
    marginTop: 1,
  },
  ponto: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  dataCard: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  faixa: {
    width: 6,
    borderRadius: 3,
  },
  dataCorpo: {
    flex: 1,
    gap: 2,
  },
  dataDia: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  dataTitulo: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  dataDescricao: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
