import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors } from '../../theme';

interface MascoteProps {
  /** Diâmetro da cabeça; o resto do corpo é proporcional. */
  size?: number;
  /** Quantidade de segmentos do corpo. */
  segments?: number;
}

/**
 * Mascote centopeia: cabeça coral com antenas e corpo verde segmentado com perninhas.
 * Desenhado só com Views para não depender de imagem.
 */
export function Mascote({ size = 48, segments = 4 }: MascoteProps) {
  const segment = size * 0.78;
  const overlap = -segment * 0.28;
  const leg = { width: size * 0.08, height: size * 0.22, borderRadius: size * 0.04 };

  return (
    <View style={styles.row} accessibilityRole="image" accessibilityLabel="Mascote centopeia">
      {Array.from({ length: segments }).map((_, index) => {
        const lift = index % 2 === 0 ? 0 : -size * 0.06;
        return (
          <View
            key={index}
            style={{
              marginRight: overlap,
              transform: [{ translateY: lift }],
              alignItems: 'center',
              zIndex: index,
            }}
          >
            <View
              style={[
                styles.segment,
                {
                  width: segment,
                  height: segment,
                  borderRadius: segment / 2,
                  backgroundColor: index % 2 === 0 ? colors.brand : '#96D856',
                },
              ]}
            />
            <View style={[styles.legs, { width: segment * 0.6, marginTop: -size * 0.04 }]}>
              <View style={[styles.leg, leg]} />
              <View style={[styles.leg, leg]} />
            </View>
          </View>
        );
      })}

      <View style={{ zIndex: segments + 1, alignItems: 'center' }}>
        <View style={[styles.antennae, { width: size * 0.7, height: size * 0.3 }]}>
          <View style={[styles.antenna, { height: size * 0.3, transform: [{ rotate: '-25deg' }] }]}>
            <View style={[styles.antennaTip, { width: size * 0.14, height: size * 0.14, borderRadius: size * 0.07 }]} />
          </View>
          <View style={[styles.antenna, { height: size * 0.3, transform: [{ rotate: '25deg' }] }]}>
            <View style={[styles.antennaTip, { width: size * 0.14, height: size * 0.14, borderRadius: size * 0.07 }]} />
          </View>
        </View>
        <View style={[styles.head, { width: size, height: size, borderRadius: size / 2 }]}>
          <View style={[styles.eyes, { gap: size * 0.16 }]}>
            <Eye size={size * 0.24} />
            <Eye size={size * 0.24} />
          </View>
          <View
            style={[
              styles.smile,
              { width: size * 0.34, height: size * 0.17, borderBottomLeftRadius: size * 0.17, borderBottomRightRadius: size * 0.17, borderWidth: Math.max(1.5, size * 0.04) },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

function Eye({ size }: { size: number }) {
  return (
    <View style={[styles.eye, { width: size, height: size, borderRadius: size / 2 }]}>
      <View style={[styles.pupil, { width: size * 0.5, height: size * 0.5, borderRadius: size * 0.25 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  segment: {
    borderWidth: 2,
    borderColor: colors.surface,
  },
  legs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leg: {
    backgroundColor: colors.brandDark,
  },
  antennae: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: -2,
  },
  antenna: {
    width: 2,
    backgroundColor: colors.textPrimary,
    alignItems: 'center',
  },
  antennaTip: {
    backgroundColor: colors.coral,
    marginTop: -4,
  },
  head: {
    backgroundColor: colors.coral,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  eyes: {
    flexDirection: 'row',
  },
  eye: {
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pupil: {
    backgroundColor: colors.textPrimary,
  },
  smile: {
    marginTop: 4,
    borderTopWidth: 0,
    borderColor: colors.textPrimary,
  },
});
