import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Keyboard,
  KeyboardAvoidingView,
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInputInstance,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthTextField } from '../components/login/AuthTextField';
import { PrimaryButton } from '../components/login/PrimaryButton';
import { AmbienteBadge } from '../components/ui/AmbienteBadge';
import { Icon } from '../components/ui/Icon';
import { Mascote } from '../components/ui/Mascote';
import { ArrowRight, CircleAlert, Lock, Mail } from '../components/ui/icons';
import { useAuth } from '../context/AuthContext';
import { type } from '../theme/fonts';
import { ds, useTokens } from '../theme/tokens';
import { emailValido, mensagemDeLogin } from '../utils/loginErrors';

const DURACAO_MS = 150;

/** true enquanto o teclado está aberto; anima a mudança só se "reduzir movimento" estiver desligado. */
function useTecladoAberto(): boolean {
  const [aberto, setAberto] = useState(false);

  useEffect(() => {
    let reduzir = false;
    AccessibilityInfo.isReduceMotionEnabled().then((valor) => {
      reduzir = valor;
    });
    const mudar = (valor: boolean) => {
      if (!reduzir) {
        LayoutAnimation.configureNext(LayoutAnimation.create(DURACAO_MS, 'easeInEaseOut', 'opacity'));
      }
      setAberto(valor);
    };
    const mostrar = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', () =>
      mudar(true)
    );
    const esconder = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () =>
      mudar(false)
    );
    return () => {
      mostrar.remove();
      esconder.remove();
    };
  }, []);

  return aberto;
}

export function LoginScreen() {
  const t = useTokens();
  const { height } = useWindowDimensions();
  const { login, notice } = useAuth();
  const tecladoAberto = useTecladoAberto();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const passwordRef = useRef<TextInputInstance>(null);

  // Tudo numa tela sem rolar (iPhone SE: 667 pt de altura): o mascote cede espaço em telas baixas
  // e encolhe de vez com o teclado aberto.
  const mascote = tecladoAberto ? 72 : height < 700 ? 112 : 160;

  async function handleSubmit() {
    if (submitting) return;
    const trimmedEmail = email.trim();
    const emailMsg = emailValido(trimmedEmail) ? null : 'Informe um e-mail válido.';
    const passwordMsg = password ? null : 'Informe sua senha.';
    setEmailError(emailMsg);
    setPasswordError(passwordMsg);
    setApiError(null);
    if (emailMsg || passwordMsg) return;

    Keyboard.dismiss();
    setSubmitting(true);
    try {
      await login(trimmedEmail, password);
      // Sucesso: o RootNavigator troca a pilha de login pela Agenda (sem rota para voltar).
    } catch (err) {
      setApiError(mensagemDeLogin(err));
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: t.surface }]}>
      <StatusBar style={t.dark ? 'light' : 'dark'} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Com o teclado fechado tudo cabe e não rola; aberto, pode rolar se faltar espaço. */}
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          scrollEnabled={tecladoAberto}
          bounces={false}
        >
          <View style={styles.brand}>
            <Mascote size={mascote} />
            <View style={styles.brandText}>
              <Text style={[type.display, styles.center, { color: t.ink }]} accessibilityRole="header">
                Centopeia
              </Text>
              <Text style={[type.body, styles.center, { color: t.inkMuted }]}>Escola infantil</Text>
            </View>
            <AmbienteBadge />
          </View>

          <View style={styles.form}>
            <AuthTextField
              label="E-mail"
              icon={Mail}
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                if (emailError) setEmailError(null);
              }}
              error={emailError}
              placeholder="voce@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="username"
              autoComplete="email"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              editable={!submitting}
            />

            <AuthTextField
              ref={passwordRef}
              label="Senha"
              icon={Lock}
              password
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                if (passwordError) setPasswordError(null);
              }}
              error={passwordError}
              placeholder="Sua senha"
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="password"
              autoComplete="current-password"
              returnKeyType="go"
              onSubmitEditing={handleSubmit}
              editable={!submitting}
            />

            {apiError ? (
              <View style={[styles.alert, { backgroundColor: t.dangerSoft }]} accessibilityRole="alert">
                <Icon icon={CircleAlert} size="sm" color={t.danger} />
                <Text style={[type.bodySm, styles.alertText, { color: t.danger }]}>{apiError}</Text>
              </View>
            ) : notice ? (
              <View style={[styles.alert, { backgroundColor: t.warningSoft }]} accessibilityRole="alert">
                <Text style={[type.bodySm, styles.alertText, { color: t.warning }]}>{notice}</Text>
              </View>
            ) : null}

            <PrimaryButton
              title="Entrar"
              loadingTitle="Entrando..."
              icon={ArrowRight}
              loading={submitting}
              onPress={handleSubmit}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: ds.margin,
    paddingVertical: ds.space[4],
    gap: ds.space[6],
  },
  brand: {
    alignItems: 'center',
    gap: ds.space[2],
  },
  brandText: {
    alignItems: 'center',
  },
  center: {
    textAlign: 'center',
  },
  form: {
    gap: ds.space[4],
  },
  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ds.space[2],
    borderRadius: ds.radius.md,
    paddingVertical: ds.space[3],
    paddingHorizontal: ds.space[3],
  },
  alertText: {
    flex: 1,
  },
});
