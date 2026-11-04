import type { LucideIcon } from 'lucide-react-native';
import React, { forwardRef, useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputInstance, TextInputProps, TouchableOpacity, View } from 'react-native';

import { Icon } from '../ui/Icon';
import { CircleAlert, Eye, EyeOff } from '../ui/icons';
import { type } from '../../theme/fonts';
import { ds, useTokens } from '../../theme/tokens';

interface AuthTextFieldProps extends TextInputProps {
  label: string;
  icon: LucideIcon;
  error?: string | null;
  /** Campo de senha com botão de mostrar/ocultar. */
  password?: boolean;
}

/**
 * Campo do login: rótulo sempre visível, ícone à esquerda, 48 px de altura, borda `line-strong`,
 * foco com borda `focus` + halo de 3 px (`focus-soft`) e mensagem de erro com ícone.
 */
export const AuthTextField = forwardRef<TextInputInstance, AuthTextFieldProps>(function AuthTextField(
  { label, icon, error, password, onFocus, onBlur, style, ...rest },
  ref
) {
  const t = useTokens();
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);

  const borderColor = error ? t.danger : focused ? t.focus : t.lineStrong;

  return (
    <View style={styles.field}>
      <Text style={[type.bodySm, styles.label, { color: t.ink }]}>{label}</Text>
      <View style={[styles.halo, focused && { backgroundColor: t.focusSoft }]}>
        <View style={[styles.box, { borderColor, backgroundColor: t.surfaceRaised }]}>
          <Icon icon={icon} size="sm" color={t.inkMuted} />
          <TextInput
            ref={ref}
            style={[type.body, styles.input, { color: t.ink }, style]}
            placeholderTextColor={t.inkSubtle}
            secureTextEntry={password && !visible}
            accessibilityLabel={label}
            onFocus={(event) => {
              setFocused(true);
              onFocus?.(event);
            }}
            onBlur={(event) => {
              setFocused(false);
              onBlur?.(event);
            }}
            {...rest}
          />
          {password ? (
            <TouchableOpacity
              onPress={() => setVisible((current) => !current)}
              style={styles.eye}
              accessibilityRole="button"
              accessibilityLabel={visible ? 'Ocultar senha' : 'Mostrar senha'}
            >
              <Icon icon={visible ? EyeOff : Eye} size="sm" color={t.inkMuted} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
      {error ? (
        <View style={styles.errorRow} accessibilityRole="alert">
          <Icon icon={CircleAlert} size="sm" color={t.danger} />
          <Text style={[type.caption, styles.errorText, { color: t.danger }]}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  field: {
    gap: ds.space[1],
  },
  label: {
    fontWeight: '600',
  },
  // Halo de 3 px fora da borda.
  halo: {
    borderRadius: ds.radius.md + 3,
    padding: 3,
    margin: -3,
  },
  box: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: ds.space[2],
    borderWidth: 1.5,
    borderRadius: ds.radius.md,
    paddingHorizontal: ds.space[3],
  },
  input: {
    flex: 1,
    paddingVertical: 0,
    height: '100%',
  },
  eye: {
    width: 44,
    height: 44,
    marginRight: -ds.space[3],
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ds.space[1],
  },
  errorText: {
    flex: 1,
  },
});
