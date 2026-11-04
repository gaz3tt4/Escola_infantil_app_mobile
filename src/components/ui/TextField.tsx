import React, { forwardRef, useState, useMemo } from 'react';
import { StyleSheet, Text, TextInput, TextInputInstance, TextInputProps, TouchableOpacity, View } from 'react-native';

import { radius, spacing, useColors, type Palette } from '../../theme';

interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string | null;
  /** Campo de senha com botão de mostrar/ocultar. */
  password?: boolean;
}

export const TextField = forwardRef<TextInputInstance, TextFieldProps>(function TextField(
  { label, error, password, style, ...rest },
  ref
) {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrap, error ? styles.inputWrapError : undefined]}>
        <TextInput
          ref={ref}
          style={[styles.input, style]}
          placeholderTextColor={colors.placeholder}
          secureTextEntry={password && !visible}
          autoCapitalize={password ? 'none' : rest.autoCapitalize}
          autoCorrect={password ? false : rest.autoCorrect}
          accessibilityLabel={label}
          {...rest}
        />
        {password ? (
          <TouchableOpacity
            onPress={() => setVisible((current) => !current)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel={visible ? 'Ocultar senha' : 'Mostrar senha'}
          >
            <Text style={styles.toggle}>{visible ? 'Ocultar' : 'Mostrar'}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
});

const makeStyles = (colors: Palette) => StyleSheet.create({
  field: {
    gap: spacing.xs,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
  },
  inputWrapError: {
    borderColor: colors.danger,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.sm + 4,
    fontSize: 15,
    color: colors.textPrimary,
  },
  toggle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.brandDark,
    marginLeft: spacing.sm,
  },
  error: {
    color: colors.danger,
    fontSize: 12,
  },
});
