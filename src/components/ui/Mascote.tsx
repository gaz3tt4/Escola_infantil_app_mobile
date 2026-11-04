import React from 'react';
import { Image, StyleSheet } from 'react-native';

// Arte oficial (centopeia-sentada-recorte.png, fundo transparente), sem nenhuma edição: só escala proporcional.
const MASCOTE = require('../../../assets/mascote/centopeia-sentada-recorte.png');
const PROPORCAO = 276 / 279;

interface MascoteProps {
  /**
   * Largura em px. Guia do design system: 96 em cards, 160 em estados vazios, até 240 em login e splash.
   * Uma vez por tela; nunca em erro, cobrança em atraso, falta ou ao lado de fotos das crianças.
   */
  size?: number;
}

/** Mascote oficial da Centopeia. */
export function Mascote({ size = 96 }: MascoteProps) {
  return (
    <Image
      source={MASCOTE}
      style={[styles.image, { width: size, height: size / PROPORCAO }]}
      resizeMode="contain"
      accessibilityRole="image"
      accessibilityLabel="Mascote centopeia"
    />
  );
}

const styles = StyleSheet.create({
  image: {
    alignSelf: 'center',
  },
});
