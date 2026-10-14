import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  aceitacaoLabels,
  evacuacaoLabels,
  ordemRefeicoes,
  refeicaoIcons,
  refeicaoLabels,
  segmentoLabels,
  xixiLabels,
} from './labels';
import { Card } from '../ui/Card';
import { Pill } from '../ui/Pill';
import { RecadoItem } from '../recados/RecadoItem';
import { temCardapio } from '../../services/agenda';
import type { Agenda, Cardapio, Recado, RefeicaoAgenda, SonecaAgenda, TipoRefeicao } from '../../services/types';
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

/** Uma refeição: o que o professor registrou (se já registrou) e o cardápio do dia. */
function Refeicao({ tipo, refeicao, cardapio }: { tipo: TipoRefeicao; refeicao?: RefeicaoAgenda; cardapio: string[] }) {
  const aceitacao = refeicao?.aceitacao ? aceitacaoLabels[refeicao.aceitacao] : undefined;
  const recusou = refeicao?.aceitacao === 'recusou';
  return (
    <View style={styles.linha}>
      <View style={styles.linhaTopo}>
        <Text style={styles.linhaTitulo}>
          {refeicaoIcons[tipo] ?? '🍽️'} {refeicaoLabels[tipo] ?? 'Refeição'}
        </Text>
        {refeicao?.horario ? <Text style={styles.linhaDetalhe}>{refeicao.horario}</Text> : null}
      </View>
      {cardapio.length > 0 ? (
        <Text style={styles.cardapio}>
          <Text style={styles.cardapioRotulo}>Cardápio: </Text>
          {cardapio.join(', ')}
        </Text>
      ) : null}
      {aceitacao ? (
        <Pill
          label={aceitacao}
          bg={recusou ? colors.coralSoft : colors.brandSoft}
          fg={recusou ? '#B23A2C' : colors.brandDark}
        />
      ) : null}
      {recusou && refeicao?.alimento_recusado ? (
        <Text style={styles.observacao}>Alimento recusado: {refeicao.alimento_recusado}</Text>
      ) : null}
      {refeicao?.observacao ? <Text style={styles.observacao}>{refeicao.observacao}</Text> : null}
    </View>
  );
}

/**
 * Refeições do dia: cada uma com o cardápio e o registro do professor. A refeição que está no
 * cardápio mas ainda não foi registrada aparece mesmo assim, só com o cardápio.
 */
export function RefeicoesBloco({ refeicoes, cardapio }: { refeicoes: RefeicaoAgenda[]; cardapio: Cardapio }) {
  const tipos = ordemRefeicoes.filter((tipo) => cardapio[tipo].length > 0 || refeicoes.some((r) => r.tipo === tipo));
  const outras = refeicoes.filter((r) => !ordemRefeicoes.includes(r.tipo));
  if (tipos.length === 0 && outras.length === 0) return null;

  return (
    <Bloco icon="🍽️" titulo="Refeições">
      {tipos.flatMap((tipo) => {
        const registradas = refeicoes.filter((r) => r.tipo === tipo);
        return registradas.length > 0
          ? registradas.map((r) => <Refeicao key={r.id} tipo={tipo} refeicao={r} cardapio={cardapio[tipo]} />)
          : [<Refeicao key={tipo} tipo={tipo} cardapio={cardapio[tipo]} />];
      })}
      {outras.map((r) => (
        <Refeicao key={r.id} tipo={r.tipo} refeicao={r} cardapio={[]} />
      ))}
    </Bloco>
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

/** true quando a agenda não tem nenhum bloco (refeições, sonecas, mamadeiras, evacuação, xixi). */
export function agendaSemBlocos(agenda: Agenda): boolean {
  return (
    agenda.refeicoes.length === 0 &&
    agenda.sonecas.length === 0 &&
    agenda.mamadeiras.length === 0 &&
    !agenda.evacuacao &&
    !agenda.xixi
  );
}

/** true quando não há nada para mostrar: nem blocos, nem atividades, nem recados, nem cardápio. */
export function agendaSemConteudo(agenda: Agenda, cardapio: Cardapio): boolean {
  return agendaSemBlocos(agenda) && !agenda.atividades && agenda.recados.length === 0 && !temCardapio(cardapio);
}

/** Blocos da agenda do dia. Só renderiza o que o backend devolveu (evacuação e xixi vêm só no berçário). */
interface AgendaDoDiaProps {
  agenda: Agenda;
  cardapio: Cardapio;
  onEditRecado?: (recado: Recado) => void;
  onDeleteRecado?: (recado: Recado) => void;
  busy?: boolean;
}

export function AgendaDoDia({ agenda, cardapio, onEditRecado, onDeleteRecado, busy }: AgendaDoDiaProps) {
  const semBlocos = agendaSemBlocos(agenda);
  return (
    <View style={styles.container}>
      <View style={styles.cabecalho}>
        <Text style={styles.cabecalhoTitulo}>Agenda do dia</Text>
        {semBlocos ? null : <Pill label={segmentoLabels[agenda.segmento]} bg={colors.brandSoft} fg={colors.brandDark} />}
      </View>

      {semBlocos ? <Text style={styles.legenda}>O relatório do dia (refeições, sonecas) ainda não foi lançado.</Text> : null}

      {agenda.atividades ? (
        <Bloco icon="🎨" titulo="Atividades do dia">
          <Text style={styles.atividades}>{agenda.atividades}</Text>
        </Bloco>
      ) : null}

      <RefeicoesBloco refeicoes={agenda.refeicoes} cardapio={cardapio} />

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

      {agenda.recados.length > 0 ? (
        <View style={styles.recados}>
          <Text style={styles.cabecalhoTitulo}>Recados do dia</Text>
          {agenda.recados.map((recado) => (
            <RecadoItem key={recado.id} recado={recado} busy={busy} onEdit={onEditRecado} onDelete={onDeleteRecado} />
          ))}
        </View>
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
  legenda: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  cardapio: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  cardapioRotulo: {
    fontWeight: '700',
    color: colors.brandDark,
  },
  atividades: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  recados: {
    gap: spacing.sm,
  },
  observacao: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
