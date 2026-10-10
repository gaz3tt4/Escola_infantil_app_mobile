import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

import type { ArquivoReceita } from '../services/medicamentos';

const LADO_MAXIMO = 1600;
const ALVO_BYTES = 2 * 1024 * 1024;

async function tamanhoEmBytes(uri: string): Promise<number | null> {
  try {
    const blob = await (await fetch(uri)).blob();
    return blob.size;
  } catch {
    return null;
  }
}

/**
 * Converte a foto da receita (inclusive HEIC do iPhone) em JPEG de até ~2 MB, como combinado
 * com o backend (limite de 10 MB; PDF não é oferecido no app).
 */
export async function prepararReceita(uri: string, largura: number, altura: number): Promise<ArquivoReceita> {
  const maior = Math.max(largura, altura);
  const reduzir = maior > LADO_MAXIMO;
  const acoes = reduzir ? [{ resize: largura >= altura ? { width: LADO_MAXIMO } : { height: LADO_MAXIMO } }] : [];

  let resultado = await manipulateAsync(uri, acoes, { compress: 0.7, format: SaveFormat.JPEG });

  // Foto muito pesada mesmo reduzida: comprime mais uma vez.
  const bytes = await tamanhoEmBytes(resultado.uri);
  if (bytes !== null && bytes > ALVO_BYTES) {
    resultado = await manipulateAsync(
      resultado.uri,
      [{ resize: resultado.width >= resultado.height ? { width: 1280 } : { height: 1280 } }],
      { compress: 0.5, format: SaveFormat.JPEG }
    );
  }

  return { uri: resultado.uri, name: `receita-${Date.now()}.jpg`, type: 'image/jpeg' };
}
