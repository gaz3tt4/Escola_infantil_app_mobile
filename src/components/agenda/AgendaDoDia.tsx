import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  aceitacaoLabels,
  evacuacaoLabels,
  refeicaoIcons,
  refeicaoLabels,
  segmentoLabels,
  xixiLabels,
} from './labels';
import { Card } from '../ui/Card';
import { Pill } from '../ui/Pill';
import type { Agenda, RefeicaoAgenda, SonecaAgenda } from '../../services/types';
import { colors, spacing } from '../../theme';

function minutos(hora: string): number | null {
  const [h, m] = hora.split(':').map(Number);
  return Number.isFinite(h) && Number.isFinite(m) ? h * 60 + m : null;
}

/** "1h30" / "45 min"; null se faltar horário ou a soneca atravessar a meia-noite. */
function duracao(dormiu: string | null, acordou: string | null): string | null {
  if (!dormiu || !acordou) return null;
  const inicio = minutos(dormiu);
  const fim = minutos(acordou);
  if (inicio === null || fim === null || fim <= inicio) return null;
  const total = fim - inicio;
  const horas = Math.floor(total / 60);
  const resto = total % 60;
  if (horas === 0) return `${resto} min`;
  return resto === 0 ? `${horas}h` : `${horas}h${String(resto).padStart(2, '0')}`;
}

function Bloco({ icon, titulo, children }: { icon: string; titulo: string; children: React.ReactNode }) {
  return (
    <Card style={styles.bloco}>
      <View style={styles.blocoHeader}>
        <Text style={styles.blocoIcon}>{icon}</Text>
        <Text style={styles.blocoTitulo}>{titulo}</Text>
      </View>
      <View style={styles.itens}>{children}</View>
    </Card>
  );
}

function Linha({ titulo, detalhe, observacao }: { titulo: string; detalhe?: string | null; observacao?: string | null }) {
  return (
    <View style={styles.linha}>
      <View style={styles.linhaTopo}>
        <Text style={styles.linhaTitulo}>{titulo}</Text>
        {detalhe ? <Text style={styles.linhaDetalhe}>{detalhe}</Text> : null}
      </View>
      {observacao ? <Text style={styles.observacao}>{observacao}</Text> : null}
    </View>
  );
}

function Refeicao({ refeicao }: { refeicao: RefeicaoAgenda }) {
  const aceitacao = refeicao.aceitacao ? aceitacaoLabels[refeicao.aceitacao] : undefined;
  const recusou = refeicao.aceitacao === 'recusou';
  return (
    <View style={styles.linha}>
      <View style={styles.linhaTopo}>
        <Text style={styles.linhaTitulo}>
          {refeicaoIcons[refeicao.tipo] ?? '🍽️'} {refeicaoLabels[refeicao.tipo] ?? 'Refeição'}
        </Text>
        {refeicao.horario ? <Text style={styles.linhaDetalhe}>{refeicao.horario}</Text> : null}
      </View>
      {aceitacao ? (
        <Pill
          label={aceitacao}
          bg={recusou ? colors.coralSoft : colors.brandSoft}
          fg={recusou ? '#B23A2C' : colors.brandDark}
        />
      ) : null}
      {recusou && refeicao.alimento_recusado ? (
        <Text style={styles.observacao}>Alimento recusado: {refeicao.alimento_recusado}</Text>
      ) : null}
      {refeicao.observacao ? <Text style={styles.observacao}>{refeicao.observacao}</Text> : null}
    </View>
  );
}

function Soneca({ soneca }: { soneca: SonecaAgenda }) {
  const total = duracao(soneca.dormiu_em, soneca.acordou_em);
  const periodo = soneca.dormiu_em
    ? `Dormiu às ${soneca.dormiu_em}${soneca.acordou_em ? `, acordou às ${soneca.acordou_em}` : ''}`
    : soneca.acordou_em
      ? `Acordou às ${soneca.acordou_em}`
      : 'Sem horário';
  return <Linha titulo={periodo} detalhe={total} />;
}

/** true quando a agenda existe mas não tem nenhum bloco preenchido. */
export function agendaVazia(agenda: Agenda): boolean {
  return (
    agenda.refeicoes.length === 0 &&
    agenda.sonecas.length === 0 &&
    agenda.mamadeiras.length === 0 &&
    !agenda.evacuacao &&
    !agenda.xixi
  );
}

/** Blocos da agenda do dia. Só renderiza o que o backend devolveu (evacuação e xixi vêm só no berçário). */
export function AgendaDoDia({ agenda }: { agenda: Agenda }) {
  return (
    <View style={styles.container}>
      <View style={styles.cabecalho}>
        <Text style={styles.cabecalhoTitulo}>Agenda do dia</Text>
        <Pill label={segmentoLabels[agenda.segmento]} bg={colors.brandSoft} fg={colors.brandDark} />
      </View>

      {agenda.refeicoes.length > 0 ? (
        <Bloco icon="🍽️" titulo="Refeições">
          {agenda.refeicoes.map((refeicao) => (
            <Refeicao key={refeicao.id} refeicao={refeicao} />
          ))}
        </Bloco>
      ) : null}

      {agenda.sonecas.length > 0 ? (
        <Bloco icon="😴" titulo="Sonecas">
          {agenda.sonecas.map((soneca) => (
            <Soneca key={soneca.id} soneca={soneca} />
          ))}
        </Bloco>
      ) : null}

      {agenda.mamadeiras.length > 0 ? (
        <Bloco icon="🍼" titulo="Mamadeiras">
          {agenda.mamadeiras.map((mamadeira) => (
            <Linha key={mamadeira.id} titulo={`${mamadeira.quantidade_ml} ml`} detalhe={mamadeira.horario} />
          ))}
        </Bloco>
      ) : null}

      {agenda.evacuacao ? (
        <Bloco icon="🧷" titulo="Evacuação">
          <Linha
            titulo={evacuacaoLabels[agenda.evacuacao.tipo] ?? agenda.evacuacao.tipo}
            detalhe={agenda.evacuacao.horario}
            observacao={agenda.evacuacao.observacao}
          />
        </Bloco>
      ) : null}

      {agenda.xixi ? (
        <Bloco icon="💧" titulo="Xixi">
          <Linha
            titulo={xixiLabels[agenda.xixi.aspecto] ?? agenda.xixi.aspecto}
            detalhe={agenda.xixi.horario}
            observacao={agenda.xixi.observacao}
          />
        </Bloco>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cabecalhoTitulo: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  bloco: {
    gap: spacing.sm,
  },
  blocoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  blocoIcon: {
    fontSize: 20,
  },
  blocoTitulo: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.brandDark,
  },
  itens: {
    gap: spacing.md,
  },
  linha: {
    gap: spacing.xs,
  },
  linhaTopo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  linhaTitulo: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  linhaDetalhe: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  observacao: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
