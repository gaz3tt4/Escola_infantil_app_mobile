import React, { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { ReceitaPicker } from './ReceitaPicker';
import { BottomSheet } from '../ui/BottomSheet';
import { Button } from '../ui/Button';
import { ChipSelector } from '../ui/ChipSelector';
import { Notice } from '../ui/Notice';
import { TextField } from '../ui/TextField';
import { toApiError } from '../../services/errors';
import { atualizarMedicamento, criarMedicamento, type ArquivoReceita } from '../../services/medicamentos';
import { enviarRecado, TEXTO_RECADO_MAX } from '../../services/recados';
import type { Aluno, Medicamento } from '../../services/types';
import { colors } from '../../theme';
import { formatDateBR, maskDateBR, parseDateBR, todayISO } from '../../utils/format';

type Aba = 'recado' | 'medicamento';

interface NovoItemSheetProps {
  visible: boolean;
  aluno: Aluno;
  /** Medicamento em edição; use `key` para reiniciar o formulário ao trocar. */
  medicamento?: Medicamento | null;
  onClose: () => void;
  /** Chamado depois de enviar com sucesso (para recarregar as listas). */
  onSent: () => void;
}

type CampoMedicamento = 'nome' | 'dose' | 'horario' | 'data' | 'receita';
type Erros = Partial<Record<CampoMedicamento, string>>;

function maskHora(input: string): string {
  const digits = input.replace(/\D/g, '').slice(0, 4);
  return digits.length <= 2 ? digits : `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

function hoje(): string {
  const [ano, mes, dia] = todayISO().split('-');
  return `${dia}/${mes}/${ano}`;
}

/** Bottom sheet com duas abas: recado ao professor e medicamento (com receita obrigatória). */
export function NovoItemSheet({ visible, aluno, medicamento, onClose, onSent }: NovoItemSheetProps) {
  const edicao = medicamento ?? null;
  const [aba, setAba] = useState<Aba>(edicao ? 'medicamento' : 'recado');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [texto, setTexto] = useState('');
  const [erroTexto, setErroTexto] = useState<string | null>(null);

  const [nome, setNome] = useState(edicao?.nome ?? '');
  const [dose, setDose] = useState(edicao?.dose ?? '');
  const [horario, setHorario] = useState(edicao?.horario.slice(0, 5) ?? '');
  const [dataTexto, setDataTexto] = useState(() => (edicao ? formatDateBR(edicao.data_administracao) : hoje()));
  const [receita, setReceita] = useState<ArquivoReceita | null>(null);
  const [erros, setErros] = useState<Erros>({});

  function resetar() {
    setTexto('');
    setErroTexto(null);
    setNome('');
    setDose('');
    setHorario('');
    setDataTexto(hoje());
    setReceita(null);
    setErros({});
    setFormError(null);
  }

  function fechar() {
    if (submitting) return;
    onClose();
  }

  async function enviarTexto() {
    const limpo = texto.trim();
    if (!limpo) {
      setErroTexto('Escreva o recado.');
      return;
    }
    setErroTexto(null);
    setFormError(null);
    setSubmitting(true);
    try {
      await enviarRecado(aluno.id, limpo);
      resetar();
      onSent();
    } catch (error) {
      const apiError = toApiError(error);
      setErroTexto(apiError.fieldErrors.texto ?? null);
      if (!apiError.fieldErrors.texto) setFormError(apiError.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function enviarMedicamento() {
    const novos: Erros = {};
    const data = parseDateBR(dataTexto);
    if (!nome.trim()) novos.nome = 'Informe o nome do medicamento.';
    if (!dose.trim()) novos.dose = 'Informe a dose.';
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(horario)) novos.horario = 'Use o formato HH:mm (ex.: 14:30).';
    if (!data) novos.data = 'Informe uma data válida (dd/mm/aaaa).';
    else if (data < todayISO()) novos.data = 'A data não pode estar no passado.';
    // Sem receita não há envio (decisão do cliente); o backend também recusa. Na edição a atual é mantida.
    if (!edicao && !receita) novos.receita = 'Anexe a foto da receita para enviar.';
    setErros(novos);
    setFormError(null);
    if (Object.keys(novos).length > 0 || !data) return;

    setSubmitting(true);
    try {
      const dados = { nome: nome.trim(), dose: dose.trim(), horario, data_administracao: data };
      if (edicao) {
        await atualizarMedicamento(edicao.id, dados, receita);
      } else if (receita) {
        await criarMedicamento(aluno.id, dados, receita);
      }
      resetar();
      onSent();
    } catch (error) {
      const apiError = toApiError(error);
      const doServidor: Erros = {
        nome: apiError.fieldErrors.nome,
        dose: apiError.fieldErrors.dose,
        horario: apiError.fieldErrors.horario,
        data: apiError.fieldErrors.data_administracao,
        receita: apiError.fieldErrors.receita,
      };
      const temCampo = Object.values(doServidor).some(Boolean);
      setErros(doServidor);
      // 403/422 sem campo (fora do prazo, já administrado, sem permissão): mostra a mensagem do backend.
      if (!temCampo) setFormError(apiError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <BottomSheet
      visible={visible}
      title={edicao ? 'Editar medicamento' : 'Enviar à escola'}
      subtitle={edicao ? 'Só é possível alterar no dia da administração, antes de administrado' : `Para a turma de ${aluno.nome.split(' ')[0]}`}
      onClose={fechar}
    >
      {edicao ? null : (
      <ChipSelector<Aba>
        scroll={false}
        options={[
          { value: 'recado', label: 'Recado' },
          { value: 'medicamento', label: 'Medicamento' },
        ]}
        value={aba}
        onChange={(valor) => {
          setAba(valor);
          setFormError(null);
        }}
      />
      )}

      {aba === 'recado' ? (
        <>
          <TextField
            label="Recado para o professor"
            value={texto}
            onChangeText={setTexto}
            error={erroTexto}
            multiline
            maxLength={TEXTO_RECADO_MAX}
            placeholder="Escreva aqui..."
            style={styles.multiline}
            editable={!submitting}
          />
          <Text style={styles.contador}>
            {texto.length}/{TEXTO_RECADO_MAX}
          </Text>
          {formError ? <Notice message={formError} /> : null}
          <Button title="Enviar recado" onPress={enviarTexto} loading={submitting} />
        </>
      ) : (
        <>
          <TextField label="Medicamento" value={nome} onChangeText={setNome} error={erros.nome} editable={!submitting} />
          <TextField
            label="Dose"
            value={dose}
            onChangeText={setDose}
            error={erros.dose}
            placeholder="Ex.: 5 ml"
            editable={!submitting}
          />
          <TextField
            label="Horário"
            value={horario}
            onChangeText={(valor) => setHorario(maskHora(valor))}
            error={erros.horario}
            keyboardType="number-pad"
            placeholder="14:30"
            editable={!submitting}
          />
          <TextField
            label="Data da administração"
            value={dataTexto}
            onChangeText={(valor) => setDataTexto(maskDateBR(valor))}
            error={erros.data}
            keyboardType="number-pad"
            placeholder="dd/mm/aaaa"
            editable={!submitting}
          />
          <ReceitaPicker value={receita} onChange={setReceita} error={erros.receita} disabled={submitting} opcional={!!edicao} />
          {formError ? <Notice message={formError} /> : null}
          <Button
            title={edicao ? 'Salvar alterações' : 'Enviar medicamento'}
            onPress={enviarMedicamento}
            loading={submitting}
            disabled={!edicao && !receita}
          />
        </>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  multiline: {
    minHeight: 110,
    textAlignVertical: 'top',
  },
  contador: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'right',
  },
});
