import { Alert, Linking } from 'react-native';

/** Abre uma URL no navegador do sistema, avisando se não for possível. */
export async function openExternalUrl(url: string): Promise<void> {
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert('Não foi possível abrir o link', 'Tente novamente ou copie o código para pagar no app do seu banco.');
  }
}
