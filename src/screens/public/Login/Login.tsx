import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useForm, Controller } from 'react-hook-form';
import { FontAwesome } from '@expo/vector-icons';
import { useUserStore } from '@stores/User';
import { useColors } from '@theme/ThemeProvider';
import CustomTextInput from '@components/ui/CustomTextInput';
import PasswordInput from '@components/ui/PasswordInput';
import AuthLayout, {
  AuthAlert,
  createAuthStyles,
} from '@components/layout/AuthLayout';
import { leaveAuthFlow } from '@lib/auth/leaveAuthFlow';
import { checkForNewNotifications } from '@utils/usePushNotifications';
import CodeEntry from '@components/ui/CodeEntry';
import { resendMfaLogin, type MfaChallenge } from '@api/mfa';
import { getApiErrorMessage } from '@api/errors';

import { errorMessage } from '@utils/errors';
import { useNavigation } from '@react-navigation/native';
import type { AppNavigation } from '@screens/types';
type FormData = {
  email: string;
  password: string;
};

const MFA_CODE_LENGTH = 6;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Entrar com e-mail e senha. Clientes e profissionais usam a mesma conta. */
function LoginScreen() {
  const navigation = useNavigation<AppNavigation>();
  const colors = useColors();
  const styles = createAuthStyles(colors);
  const { signInPassword } = useUserStore();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Segunda etapa: codigo enviado ao e-mail quando a conta usa verificacao em duas etapas.
  const [challenge, setChallenge] = useState<MfaChallenge | null>(null);
  const [code, setCode] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const passwordRef = React.useRef<TextInput>(null);

  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<FormData>({
    mode: 'onTouched',
    defaultValues: { email: '', password: '' },
  });

  const finishLogin = () => {
    const user = useUserStore.getState().user;
    // Administradores entram direto no painel.
    if (user?.admin) {
      navigation.reset({ index: 0, routes: [{ name: 'AdminDashboard' }] });
      return;
    }
    if (user?.id) {
      setTimeout(() => {
        checkForNewNotifications(
          user.id.toString(),
          new Date(Date.now() - 60000),
          false,
        ).catch(() => {});
      }, 1000);
    }
    leaveAuthFlow(navigation, !!user?.professional_id);
  };

  const confirmCode = async () => {
    if (!challenge) return;
    if (code.length !== MFA_CODE_LENGTH) {
      setError(`Digite os ${MFA_CODE_LENGTH} números do código.`);
      return;
    }
    setIsSubmitting(true);
    setError(null);
    setNotice(null);
    try {
      await useUserStore.getState().completeMfaSignIn(challenge.mfaToken, code);
      finishLogin();
    } catch (err) {
      setError(errorMessage(err, 'Código incorreto ou expirado.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const resendCode = async () => {
    if (!challenge) return;
    setError(null);
    try {
      await resendMfaLogin(challenge.mfaToken);
      setCode('');
      setNotice('Enviamos um novo código.');
    } catch (err) {
      setError(
        getApiErrorMessage(err, 'Não foi possível reenviar. Entre de novo.'),
      );
    }
  };

  const onSubmit = async ({ email, password }: FormData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const pending = await signInPassword(email.trim(), password);
      if (pending) {
        setChallenge(pending);
        setCode('');
        return;
      }
      finishLogin();
    } catch (err) {
      setError(
        errorMessage(err, 'Não foi possível entrar. Confira e-mail e senha.'),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const submit = handleSubmit(onSubmit);

  if (challenge) {
    return (
      <AuthLayout
        title="Confirme que é você"
        onBack={() => {
          setChallenge(null);
          setError(null);
          setNotice(null);
        }}
        subtitle={`Enviamos um código de ${MFA_CODE_LENGTH} números para ${challenge.emailHint}. Ele vale por 10 minutos; confira também o spam.`}>
        {error ? <AuthAlert>{error}</AuthAlert> : null}
        {notice ? <AuthAlert type="success">{notice}</AuthAlert> : null}
        <CodeEntry value={code} onChange={setCode} length={MFA_CODE_LENGTH} />
        <Pressable
          onPress={confirmCode}
          disabled={isSubmitting}
          style={({ pressed }) => [
            styles.primaryButton,
            isSubmitting && styles.primaryButtonDisabled,
            pressed && { opacity: 0.85 },
          ]}
          accessibilityRole="button"
          accessibilityState={{ busy: isSubmitting }}>
          {isSubmitting ? (
            <ActivityIndicator color="#000000" />
          ) : (
            <FontAwesome name="shield" size={18} color="#000000" />
          )}
          <Text style={styles.primaryButtonText}>Confirmar</Text>
        </Pressable>
        <Pressable
          onPress={resendCode}
          style={[styles.linkButton, { alignSelf: 'center', marginTop: 12 }]}
          accessibilityRole="button">
          <Text style={styles.linkText}>Reenviar código</Text>
        </Pressable>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Entrar"
      subtitle="Acesse para agendar, conversar e acompanhar seus serviços.">
      {error ? <AuthAlert>{error}</AuthAlert> : null}

      <Controller
        control={control}
        name="email"
        rules={{
          required: 'Informe seu e-mail.',
          pattern: {
            value: EMAIL_PATTERN,
            message: 'Digite um e-mail válido.',
          },
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <CustomTextInput
            label="E-mail"
            placeholder="seu@email.com"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        rules={{ required: 'Informe sua senha.' }}
        render={({ field: { onChange, onBlur, value } }) => (
          <CustomTextInput label="Senha" error={errors.password}>
            <PasswordInput
              ref={passwordRef}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder="Sua senha"
              accessibilityLabel="Senha"
              autoComplete="current-password"
              textContentType="password"
              returnKeyType="go"
              onSubmitEditing={submit}
              error={!!errors.password}
            />
          </CustomTextInput>
        )}
      />

      <Pressable
        onPress={() =>
          navigation.navigate('ForgotPassword', {
            email: getValues('email').trim() || undefined,
          })
        }
        style={[styles.linkButton, { marginTop: -8, marginBottom: 12 }]}
        accessibilityRole="link">
        <Text style={styles.linkText}>Esqueci minha senha</Text>
      </Pressable>

      <Pressable
        onPress={submit}
        disabled={isSubmitting}
        style={({ pressed }) => [
          styles.primaryButton,
          isSubmitting && styles.primaryButtonDisabled,
          pressed && { opacity: 0.85 },
        ]}
        accessibilityRole="button"
        accessibilityState={{ busy: isSubmitting }}>
        {isSubmitting ? (
          <ActivityIndicator color="#000000" />
        ) : (
          <FontAwesome name="sign-in" size={18} color="#000000" />
        )}
        <Text style={styles.primaryButtonText}>Entrar</Text>
      </Pressable>

      <View style={styles.alternate}>
        <Text style={styles.alternateText}>Ainda não tem conta?</Text>
        <Pressable
          onPress={() => navigation.navigate('Register')}
          style={styles.linkButton}
          accessibilityRole="link">
          <Text style={styles.linkText}>Criar conta</Text>
        </Pressable>
      </View>
    </AuthLayout>
  );
}

export default LoginScreen;
