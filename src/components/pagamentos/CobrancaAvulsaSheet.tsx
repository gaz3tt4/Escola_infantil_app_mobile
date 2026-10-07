import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PaymentMethodPicker } from './PaymentMethodPicker';
import { BottomSheet } from '../ui/BottomSheet';
import { Button } from '../ui/Button';
import { ChipSelector } from '../ui/ChipSelector';
import { Notice } from '../ui/Notice';
import { TextField } from '../ui/TextField';
import { toApiError } from '../../services/errors';
import { gerarCobrancaAvulsa, TIPO_LABEL, type FormaPagamento } from '../../services/faturas';
import type { Aluno, Fatura, TipoFatura } from '../../services/types';
import { colors, spacing } from '../../theme';
import { maskDateBR, parseDateBR, todayISO } from '../../utils/format';

interface CobrancaAvulsaSheetProps {
  visible: boolean;
  alunos: Aluno[];
  /** Aluno pré-selecionado (filtro atual da lista). */
  alunoInicialId: number | null;
  onClose: () => void;
  onCreated: (fatura: Fatura, aluno: Aluno) => void;
}

type FieldErrors = Partial<Record<'vencimento' | 'tipo' | 'forma', string>>;

/** POST /alunos/{id}/faturas/avulsa: adiantar mensalidade ou gerar a cobrança da matrícula. */
export function CobrancaAvulsaSheet({ visible, alunos, alunoInicialId, onClose, onCreated }: CobrancaAvulsaSheetProps) {
  const [alunoId, setAlunoId] = useState<number | null>(alunoInicialId);
  const [tipo, setTipo] = useState<TipoFatura>('mensalidade');
  const [forma, setForma] = useState<FormaPagamento>('pix');
  const [vencimento, setVencimento] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const aluno = alunos.find((item) => item.id === (alunoId ?? alunoInicialId)) ?? alunos[0];

  function reset() {
    setAlunoId(null);
    setTipo('mensalidade');
    setForma('pix');
    setVencimento('');
    setFieldErrors({});
    setFormError(null);
  }

  function handleClose() {
    if (submitting) return;
    reset();
    onClose();
  }

  async function handleSubmit() {
    if (!aluno) return;
    setFormError(null);

    let vencimentoISO: string | undefined;
    if (vencimento.trim()) {
      const parsed = parseDateBR(vencimento);
      if (!parsed) {
        setFieldErrors({ vencimento: 'Informe a data no formato dd/mm/aaaa.' });
        return;
      }
      if (parsed < todayISO()) {
        setFieldErrors({ vencimento: 'A data de vencimento não pode estar no passado.' });
        return;
      }
      vencimentoISO = parsed;
    }
    setFieldErrors({});

    setSubmitting(true);
    try {
      const fatura = await gerarCobrancaAvulsa(aluno.id, { tipo, forma, vencimento: vencimentoISO });
      reset();
      onCreated(fatura, aluno);
    } catch (error) {
      const apiError = toApiError(error);
      const errors: FieldErrors = {
        vencimento: apiError.fieldErrors.vencimento,
        tipo: apiError.fieldErrors.tipo,
        forma: apiError.fieldErrors.forma_pagamento,
      };
      const hasFieldError = Object.values(errors).some(Boolean);
      setFieldErrors(errors);
      // 422 sem campo: antecipação acima de 2 meses, mensalidade inexistente, cobrança já existente, falha no Asaas.
      if (!hasFieldError) setFormError(apiError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <BottomSheet visible={visible} title="Gerar cobrança" subtitle="Adiante uma mensalidade ou gere a matrícula" onClose={handleClose}>
      {alunos.length > 1 ? (
        <View style={styles.group}>
          <Text style={styles.label}>Aluno</Text>
          <ChipSelector
            options={alunos.map((item) => ({ value: item.id, label: item.nome }))}
            value={aluno?.id ?? 0}
            onChange={setAlunoId}
          />
        </View>
      ) : null}

      <View style={styles.group}>
        <Text style={styles.label}>Tipo de cobrança</Text>
        <ChipSelector
          scroll={false}
          options={(['mensalidade', 'matricula'] as const).map((value) => ({ value, label: TIPO_LABEL[value] }))}
          value={tipo}
          onChange={setTipo}
        />
        {fieldErrors.tipo ? <Text style={styles.error}>{fieldErrors.tipo}</Text> : null}
      </View>

      <View style={styles.group}>
        <Text style={styles.label}>Forma de pagamento</Text>
        <PaymentMethodPicker selected={forma} onSelect={setForma} disabled={submitting} />
        {fieldErrors.forma ? <Text style={styles.error}>{fieldErrors.forma}</Text> : null}
      </View>

      <View style={styles.group}>
        <TextField
          label="Vencimento (opcional)"
          value={vencimento}
          onChangeText={(text) => setVencimento(maskDateBR(text))}
          placeholder="dd/mm/aaaa"
          keyboardType="number-pad"
          maxLength={10}
          error={fieldErrors.vencimento}
          editable={!submitting}
        />
        <Text style={styles.hint}>
          {tipo === 'mensalidade'
            ? 'Na mensalidade, a data escolhe o mês a adiantar (até 2 meses à frente). Sem data, usa o mês atual.'
            : 'Sem data, vale o prazo de vencimento padrão da escola.'}
        </Text>
      </View>

      {formError ? <Notice message={formError} /> : null}

      <Button title="Gerar cobrança" onPress={handleSubmit} loading={submitting} disabled={!aluno} />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: spacing.sm,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  hint: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 17,
  },
  error: {
    color: colors.danger,
    fontSize: 12,
  },
});
