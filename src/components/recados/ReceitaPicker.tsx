import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Image, Platform, StyleSheet, Text, View } from 'react-native';

import { Button } from '../ui/Button';
import { Notice } from '../ui/Notice';
import type { ArquivoReceita } from '../../services/medicamentos';
import { colors, radius, spacing } from '../../theme';
import { prepararReceita } from '../../utils/receita';

interface ReceitaPickerProps {
  value: ArquivoReceita | null;
  onChange: (receita: ArquivoReceita | null) => void;
  error?: string | null;
  disabled?: boolean;
  /** Na edição a receita atual é mantida; trocar é opcional. */
  opcional?: boolean;
}

/** Anexo obrigatório da receita: só câmera ou galeria (sem PDF). */
export function ReceitaPicker({ value, onChange, error, disabled, opcional }: ReceitaPickerProps) {
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function receber(result: ImagePicker.ImagePickerResult) {
    const asset = result.canceled ? null : result.assets?.[0];
    if (!asset) return;
    try {
      onChange(await prepararReceita(asset.uri, asset.width, asset.height));
    } catch {
      setMessage('Não foi possível preparar a foto. Tente outra imagem.');
    }
  }

  async function tirarFoto() {
    setMessage(null);
    setWorking(true);
    try {
      const permissao = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissao.granted) {
        setMessage('Permita o acesso à câmera nas configurações do aparelho para fotografar a receita.');
        return;
      }
      await receber(await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.8 }));
    } catch {
      setMessage('Não foi possível abrir a câmera neste aparelho.');
    } finally {
      setWorking(false);
    }
  }

  async function escolherDaGaleria() {
    setMessage(null);
    setWorking(true);
    try {
      // No iOS a leitura do original exige acesso à biblioteca; no Android o seletor do sistema basta.
      if (Platform.OS === 'ios') {
        const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissao.granted) {
          setMessage('Permita o acesso às fotos nas configurações do aparelho para anexar a receita.');
          return;
        }
      }
      await receber(
        await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8, allowsMultipleSelection: false })
      );
    } catch {
      setMessage('Não foi possível abrir a galeria.');
    } finally {
      setWorking(false);
    }
  }

  const bloqueado = disabled || working;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{opcional ? 'Trocar a receita (opcional)' : 'Receita médica (obrigatória)'}</Text>
      {value ? (
        <View style={styles.preview}>
          <Image source={{ uri: value.uri }} style={styles.image} accessibilityLabel="Foto da receita anexada" />
          <Text style={styles.ok}>Receita anexada</Text>
        </View>
      ) : (
        <Text style={styles.hint}>
          {opcional
            ? 'A receita já enviada será mantida. Tire uma nova foto ou escolha da galeria só se quiser trocá-la.'
            : 'Tire uma foto da receita ou escolha uma imagem da galeria.'}
        </Text>
      )}
      <View style={styles.buttons}>
        <View style={styles.flex}>
          <Button title={value ? 'Refazer foto' : 'Tirar foto'} variant="outline" onPress={tirarFoto} disabled={bloqueado} loading={working} />
        </View>
        <View style={styles.flex}>
          <Button title="Galeria" variant="outline" onPress={escolherDaGaleria} disabled={bloqueado} />
        </View>
      </View>
      {message ? <Notice message={message} /> : null}
      {error ? <Notice message={error} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  hint: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: radius.sm,
    backgroundColor: colors.neutralSoft,
  },
  ok: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.brandDark,
  },
  buttons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  flex: {
    flex: 1,
  },
});
