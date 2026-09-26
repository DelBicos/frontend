import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { useColors } from '@theme/ThemeProvider';
import { useUserStore } from '@stores/User';
import { requestPasswordReset, resetPassword } from '@api/auth';
import { getApiErrorMessage } from '@api/errors';
import CustomTextInput from '@components/ui/CustomTextInput';
import PasswordInput from '@components/ui/PasswordInput';
import CodeInput from '@components/ui/CodeInput';
import AuthLayout, {
  AuthAlert,
  createAuthStyles,
} from '@components/layout/AuthLayout';
import { leaveAuthFlow } from '@lib/auth/leaveAuthFlow';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 6;
const RESEND_SECONDS = 60;

type ResetForm = { password: string; confirm: string };

/** "Esqueci minha senha": e-mail → codigo + nova senha → entra na conta. */
function ForgotPasswordScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const colors = useColors();
  const styles = createAuthStyles(colors);
  const initialEmail =
    (route.params as { email?: string } | undefined)?.email ?? '';

  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState(initialEmail);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [code, setCode] = useState<string[]>(Array(6).fill(''));
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ResetForm>({
    mode: 'onTouched',
    defaultValues: { password: '', confirm: '' },
  });

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const sendCode = async () => {
    const value = email.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(value)) {
      setEmailError('Digite um e-mail válido.');
      return;
    }
    setEmailError(null);
    setError(null);
    setIsBusy(true);
    try {
      await requestPasswordReset(value);
      setEmail(value);
      setStep('code');
      setCode(Array(6).fill(''));
      setFocusedIndex(0);
      setCooldown(RESEND_SECONDS);
      setNotice(null);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível enviar o código.'));
    } finally {
      setIsBusy(false);
    }
  };

  const resend = async () => {
    if (cooldown > 0) return;
    setIsBusy(true);
    setError(null);
    try {
      await requestPasswordReset(email);
      setCooldown(RESEND_SECONDS);
      setNotice('Enviamos um novo código.');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível reenviar o código.'));
    } finally {
      setIsBusy(false);
    }
  };

  const save = async ({ password }: ResetForm) => {
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      setError('Digite os 6 números do código.');
      return;
    }
    setError(null);
    setNotice(null);
    setIsBusy(true);
    try {
      await resetPassword(email, fullCode, password);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível trocar a senha.'));
      setIsBusy(false);
      return;
    }
    // Senha nova gravada: ja entra na conta.
    try {
      await useUserStore.getState().signInPassword(email, password);
      const user = useUserStore.getState().user;
      leaveAuthFlow(navigation, !!user?.professional_id);
    } catch {
      navigation.navigate('Login');
    } finally {
      setIsBusy(false);
    }
  };

  if (step === 'email') {
    return (
      <AuthLayout
        title="Esqueceu a senha?"
        subtitle="Informe o e-mail da sua conta. Vamos enviar um código para você criar uma nova senha.">
        {error ? <AuthAlert>{error}</AuthAlert> : null}
        <CustomTextInput
          label="E-mail"
          placeholder="seu@email.com"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (emailError) setEmailError(null);
          }}
          error={emailError ?? undefined}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="send"
          onSubmitEditing={sendCode}
        />
        <Pressable
          onPress={sendCode}
          disabled={isBusy}
          style={({ pressed }) => [
            styles.primaryButton,
            isBusy && styles.primaryButtonDisabled,
            pressed && { opacity: 0.85 },
          ]}
          accessibilityRole="button"
          accessibilityState={{ busy: isBusy }}>
          {isBusy ? <ActivityIndicator color="#000000" /> : null}
          <Text style={styles.primaryButtonText}>Enviar código</Text>
        </Pressable>
        <View style={styles.alternate}>
          <Text style={styles.alternateText}>Lembrou a senha?</Text>
          <Pressable
            onPress={() => navigation.navigate('Login')}
            style={styles.linkButton}
            accessibilityRole="link">
            <Text style={styles.linkText}>Entrar</Text>
          </Pressable>
        </View>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Crie uma nova senha"
      onBack={() => {
        setStep('email');
        setError(null);
      }}
      subtitle={
        <>
          Se houver uma conta com <Text style={styles.strong}>{email}</Text>, o
          código chega em instantes. Confira também o spam.
        </>
      }>
      {error ? <AuthAlert>{error}</AuthAlert> : null}
      {notice ? <AuthAlert type="success">{notice}</AuthAlert> : null}

      <Text style={[styles.alternateText, styles.strong, { marginBottom: 8 }]}>
        Código de 6 números
      </Text>
      <CodeInput
        verificationCode={code}
        setVerificationCode={setCode}
        focusedIndex={focusedIndex}
        setFocusedIndex={setFocusedIndex}
        length={6}
      />
      <Pressable
        onPress={resend}
        disabled={cooldown > 0 || isBusy}
        style={[styles.linkButton, { marginBottom: 12 }]}
        accessibilityRole="button"
        accessibilityState={{ disabled: cooldown > 0 }}>
        <Text
          style={
            cooldown > 0
              ? [styles.alternateText, { fontSize: 16 }]
              : styles.linkText
          }>
          {cooldown > 0 ? `Reenviar código em ${cooldown}s` : 'Reenviar código'}
        </Text>
      </Pressable>

      <Controller
        control={control}
        name="password"
        rules={{
          required: 'Crie uma nova senha.',
          minLength: {
            value: MIN_PASSWORD,
            message: `Use pelo menos ${MIN_PASSWORD} caracteres.`,
          },
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <CustomTextInput label="Nova senha" error={errors.password}>
            <PasswordInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder={`Mínimo de ${MIN_PASSWORD} caracteres`}
              accessibilityLabel="Nova senha"
              autoComplete="new-password"
              textContentType="newPassword"
              error={!!errors.password}
            />
          </CustomTextInput>
        )}
      />
      <Controller
        control={control}
        name="confirm"
        rules={{
          required: 'Repita a nova senha.',
          validate: (value) =>
            value === getValues('password') || 'As senhas não são iguais.',
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <CustomTextInput label="Repita a nova senha" error={errors.confirm}>
            <PasswordInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              accessibilityLabel="Repita a nova senha"
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="go"
              onSubmitEditing={handleSubmit(save)}
              error={!!errors.confirm}
            />
          </CustomTextInput>
        )}
      />

      <Pressable
        onPress={handleSubmit(save)}
        disabled={isBusy}
        style={({ pressed }) => [
          styles.primaryButton,
          isBusy && styles.primaryButtonDisabled,
          pressed && { opacity: 0.85 },
        ]}
        accessibilityRole="button"
        accessibilityState={{ busy: isBusy }}>
        {isBusy ? <ActivityIndicator color="#000000" /> : null}
        <Text style={styles.primaryButtonText}>Salvar e entrar</Text>
      </Pressable>
    </AuthLayout>
  );
}

export default ForgotPasswordScreen;
