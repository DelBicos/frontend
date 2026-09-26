import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUserStore } from '@stores/User';
import { verifyCode } from '@api/auth';
import { getApiErrorMessage, getApiErrorStatus } from '@api/errors';
import { useColors } from '@theme/ThemeProvider';
import { checkForNewNotifications } from '@utils/usePushNotifications';
import CodeInput from '@components/ui/CodeInput';
import AuthLayout, {
  AuthAlert,
  createAuthStyles,
} from '@components/layout/AuthLayout';
import { leaveAuthFlow } from '@lib/auth/leaveAuthFlow';

const COOLDOWN_SECONDS = 60;
const CODE_LENGTH = 6;

/** Confirma o e-mail do cadastro com o codigo de 6 numeros. */
function VerificationScreen() {
  const navigation = useNavigation<any>();
  const colors = useColors();
  const styles = createAuthStyles(colors);
  const {
    verificationEmail: email,
    setVerificationEmail,
    setLoggedInUser,
    lastCodeSentAt,
    recordCodeSent,
    resendCode,
  } = useUserStore();

  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);

  const remaining = useCallback(() => {
    if (!lastCodeSentAt) return 0;
    const elapsed = Math.floor((Date.now() - lastCodeSentAt) / 1000);
    return Math.max(0, COOLDOWN_SECONDS - elapsed);
  }, [lastCodeSentAt]);
  const [timer, setTimer] = useState(remaining());

  // Sem cadastro em andamento (ex.: recarregou a pagina), volta ao cadastro.
  useEffect(() => {
    if (!email) navigation.navigate('Register');
  }, [email, navigation]);

  useEffect(() => {
    setTimer(remaining());
    const interval = setInterval(() => {
      const left = remaining();
      setTimer(left);
      if (left <= 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [remaining]);

  const handleVerify = async () => {
    const fullCode = code.join('');
    if (fullCode.length !== CODE_LENGTH) {
      setError(`Digite os ${CODE_LENGTH} números do código.`);
      return;
    }
    if (!email) return;
    setError(null);
    setNotice(null);
    setIsVerifying(true);
    try {
      const session = await verifyCode(email, fullCode);
      setLoggedInUser(session);
      setVerificationEmail(null);
      setTimeout(() => {
        checkForNewNotifications(
          session.user.id.toString(),
          new Date(Date.now() - 60000),
          false,
        ).catch(() => {});
      }, 2000);
      leaveAuthFlow(navigation, !!session.user.professional_id);
    } catch (err) {
      const status = getApiErrorStatus(err);
      if (status === 404 || status === 429) setExpired(true);
      setError(getApiErrorMessage(err, 'Código incorreto ou expirado.'));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0 || !email) return;
    setIsResending(true);
    setError(null);
    try {
      await resendCode(email);
      recordCodeSent();
      setCode(Array(CODE_LENGTH).fill(''));
      setFocusedIndex(0);
      setNotice(`Enviamos um novo código para ${email}.`);
    } catch (err) {
      if (getApiErrorStatus(err) === 404) {
        setExpired(true);
        setError('O cadastro expirou. Preencha os dados de novo.');
      } else {
        setError('Não foi possível reenviar o código. Tente de novo.');
      }
    } finally {
      setIsResending(false);
    }
  };

  const backToRegister = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('Register');
  };

  return (
    <AuthLayout
      title="Confirme seu e-mail"
      onBack={backToRegister}
      subtitle={
        <>
          Enviamos um código de {CODE_LENGTH} números para{' '}
          <Text style={styles.strong}>{email}</Text>. Ele vale por 10 minutos;
          confira também o spam.
        </>
      }>
      {error ? <AuthAlert>{error}</AuthAlert> : null}
      {notice ? <AuthAlert type="success">{notice}</AuthAlert> : null}

      {expired ? (
        <Pressable
          onPress={backToRegister}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && { opacity: 0.85 },
          ]}
          accessibilityRole="button">
          <Text style={styles.primaryButtonText}>Voltar ao cadastro</Text>
        </Pressable>
      ) : (
        <>
          <CodeInput
            verificationCode={code}
            setVerificationCode={setCode}
            focusedIndex={focusedIndex}
            setFocusedIndex={setFocusedIndex}
            length={CODE_LENGTH}
          />
          <Pressable
            onPress={handleVerify}
            disabled={isVerifying}
            style={({ pressed }) => [
              styles.primaryButton,
              isVerifying && styles.primaryButtonDisabled,
              pressed && { opacity: 0.85 },
            ]}
            accessibilityRole="button"
            accessibilityState={{ busy: isVerifying }}>
            {isVerifying ? <ActivityIndicator color="#000000" /> : null}
            <Text style={styles.primaryButtonText}>Confirmar e entrar</Text>
          </Pressable>
          <Pressable
            onPress={handleResend}
            disabled={timer > 0 || isResending}
            style={[styles.linkButton, { alignSelf: 'center', marginTop: 12 }]}
            accessibilityRole="button"
            accessibilityState={{ disabled: timer > 0 }}>
            <Text
              style={
                timer > 0
                  ? [styles.alternateText, { fontSize: 16 }]
                  : styles.linkText
              }>
              {isResending
                ? 'Reenviando…'
                : timer > 0
                  ? `Reenviar código em ${timer}s`
                  : 'Reenviar código'}
            </Text>
          </Pressable>
        </>
      )}

      <Pressable
        onPress={backToRegister}
        style={[styles.linkButton, { alignSelf: 'center' }]}
        accessibilityRole="link">
        <Text style={styles.linkText}>Errou o e-mail? Corrigir cadastro</Text>
      </Pressable>
    </AuthLayout>
  );
}

export default VerificationScreen;
