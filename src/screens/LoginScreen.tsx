import Constants from 'expo-constants';
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
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthTextField } from '../components/login/AuthTextField';
import { BrandPanel } from '../components/login/BrandPanel';
import { PrimaryButton } from '../components/login/PrimaryButton';
import { Icon } from '../components/ui/Icon';
import { ArrowRight, CircleAlert, Lock, Mail, ShieldCheck } from '../components/ui/icons';
import { useAuth } from '../context/AuthContext';
import { font, type } from '../theme/fonts';
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
  const insets = useSafeAreaInsets();
  const { login, notice } = useAuth();
  const tecladoAberto = useTecladoAberto();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const passwordRef = useRef<TextInputInstance>(null);

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

  const version = Constants.expoConfig?.version;

  return (
    <View style={[styles.flex, { backgroundColor: t.surface }]}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <BrandPanel compact={tecladoAberto} topInset={insets.top} />

          <View
            style={[
              styles.sheet,
              { backgroundColor: t.surfaceRaised, paddingBottom: ds.space[5] + insets.bottom },
              !t.dark && styles.sheetShadow,
            ]}
          >
            <View style={[styles.badge, { backgroundColor: t.primarySoft }]}>
              <Icon icon={ShieldCheck} size="sm" color={t.primaryStrong} />
              <Text style={[type.caption, { color: t.primaryStrong }]}>Acesso para responsáveis</Text>
            </View>

            <View style={styles.heading}>
              <Text style={[type.heading1, { color: t.ink }]} accessibilityRole="header">
                Entrar no app
              </Text>
              <Text style={[type.body, { color: t.inkMuted }]}>
                Use o e-mail cadastrado na escola para continuar.
              </Text>
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

            <View style={[styles.help, { backgroundColor: t.warningSoft }]}>
              <Text style={[type.bodySm, { color: t.warning }]}>
                <Text style={styles.helpStrong}>Sem acesso? </Text>
                Solicite sua credencial à secretaria da escola.
              </Text>
            </View>

            <Text style={[type.caption, styles.footer, { color: t.inkMuted }]}>
              © {new Date().getFullYear()} Escola Centopeia{version ? ` · v${version}` : ''}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
  },
  sheet: {
    flexGrow: 1,
    // Sobe ~24 px sobre o painel de marca.
    marginTop: -24,
    borderTopLeftRadius: ds.radius.xl,
    borderTopRightRadius: ds.radius.xl,
    padding: ds.margin,
    gap: ds.space[5],
  },
  sheetShadow: {
    shadowColor: '#1c274c',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: ds.space[1],
    paddingVertical: ds.space[1],
    paddingHorizontal: ds.space[3],
    borderRadius: ds.radius.full,
  },
  heading: {
    gap: ds.space[1],
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
  help: {
    borderRadius: ds.radius.lg,
    padding: ds.space[4],
  },
  helpStrong: {
    fontFamily: font.semibold,
  },
  footer: {
    textAlign: 'center',
  },
});
