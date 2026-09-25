import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import LogoV3 from '@assets/LogoV3.png';
import { createStyles } from './styles';
import { HTTP_DOMAIN } from '@config/varEnvs';
import { useUserStore } from '@stores/User';
import { backendHttpClient } from '@lib/helpers/httpClient';
import { Address } from '@stores/User/types';
import { useColors } from '@theme/ThemeProvider';
import { checkForNewNotifications } from '@utils/usePushNotifications';
import { FeedbackModal } from '@components/ui/FeedbackModal';
import CodeInput from '@components/ui/CodeInput';

function VerificationScreen() {
  const navigation = useNavigation();
  const {
    verificationEmail: email,
    setVerificationEmail,
    setLoggedInUser,
    lastCodeSentAt,
    recordCodeSent,
    resendCode,
  } = useUserStore();

  const colors = useColors();
  const styles = createStyles(colors);

  // Estado para CodeInput
  const [code, setCode] = useState<string[]>(Array(6).fill(''));
  const [focusedIndex, setFocusedIndex] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const COOLDOWN_SECONDS = 60;

  const calculateRemainingTime = useCallback(() => {
    if (!lastCodeSentAt) return 0;
    const now = Date.now();
    const diffSeconds = Math.floor((now - lastCodeSentAt) / 1000);
    const remaining = COOLDOWN_SECONDS - diffSeconds;
    return remaining > 0 ? remaining : 0;
  }, [lastCodeSentAt]);

  const [timer, setTimer] = useState(calculateRemainingTime());

  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    type: 'info' as 'success' | 'error' | 'info',
    title: '',
    message: '',
    onClose: () => setFeedbackVisible(false),
  });

  useEffect(() => {
    if (!email) {
      navigation.navigate('Register' as never);
      return;
    }

    if (timer <= 0) return;

    const interval = setInterval(() => {
      const remaining = calculateRemainingTime();
      setTimer(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [email, lastCodeSentAt, timer, calculateRemainingTime, navigation]);

  const showFeedback = (
    type: 'success' | 'error',
    title: string,
    message: string,
    action?: () => void,
  ) => {
    setFeedbackData({
      type,
      title,
      message,
      onClose: () => {
        setFeedbackVisible(false);
        if (action) action();
      },
    });
    setFeedbackVisible(true);
  };

  const handleResendCode = async () => {
    if (timer > 0 || !email) return;

    setIsResending(true);

    try {
      await resendCode(email);
      recordCodeSent();
      setTimer(COOLDOWN_SECONDS);

      showFeedback(
        'success',
        'Código Reenviado',
        `Um novo código foi enviado para ${email}.`,
      );

      setCode(Array(6).fill(''));
      setFocusedIndex(0);
    } catch (error: any) {
      console.error('Erro no reenvio:', error);
      if (error.response?.status === 404) {
        showFeedback(
          'error',
          'Sessão Expirada',
          'Seu cadastro temporário expirou.',
          () => navigation.navigate('Register' as never),
        );
      } else {
        showFeedback('error', 'Erro', 'Não foi possível reenviar o código.');
      }
    } finally {
      setIsResending(false);
    }
  };

  const handleVerify = async () => {
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      showFeedback(
        'error',
        'Código Inválido',
        'Por favor, preencha os 6 dígitos.',
      );
      return;
    }

    if (!email) {
      showFeedback(
        'error',
        'Erro',
        'E-mail não encontrado. Reinicie o cadastro.',
      );
      return;
    }

    setIsLoading(true);
    try {
      const response = await backendHttpClient.post(
        `${HTTP_DOMAIN}/auth/verify`,
        {
          email,
          code: fullCode,
        },
      );
      const data = response.data;

      if (response.status === 200) {
        const { token, user } = data;
        if (!token || !user) throw new Error('Resposta inválida.');

        const addressData: Address | null = user.address
          ? {
              id: user.address.id,
              lat: user.address.lat,
              lng: user.address.lng,
              street: user.address.street,
              number: user.address.number,
              complement: user.address.complement,
              neighborhood: user.address.neighborhood,
              city: user.address.city,
              state: user.address.state,
              country_iso: user.address.country_iso,
              postal_code: user.address.postal_code,
            }
          : null;

        setLoggedInUser({
          token,
          user: {
            id: user.id,
            client_id: user.client_id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            cpf: user.cpf,
            avatar_uri: user.avatar_uri,
          },
          address: addressData,
        });

        setVerificationEmail(null);

        // Check notificações em background
        setTimeout(() => {
          checkForNewNotifications(
            user.id.toString(),
            new Date(Date.now() - 60000),
            false,
          ).catch(() => {});
        }, 2000);

        showFeedback(
          'success',
          'Sucesso!',
          'Conta verificada com sucesso.',
          () => navigation.navigate('Home' as never),
        );
      }
    } catch (error: any) {
      console.error('Erro ao verificar:', error);
      const msg =
        error.response?.data?.error || 'Código incorreto ou expirado.';
      showFeedback('error', 'Erro na Verificação', msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => navigation.navigate('Home' as never)}>
          <Image source={LogoV3} style={styles.logo} />
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.title}>Verifique seu E-mail</Text>
          <Text style={styles.subtitle}>
            Enviamos um código para{' '}
            <Text style={styles.emailText}>{email}</Text>.
          </Text>

          {/* CodeInput Reutilizável */}
          <CodeInput
            verificationCode={code}
            setVerificationCode={setCode}
            focusedIndex={focusedIndex}
            setFocusedIndex={setFocusedIndex}
            length={6}
          />

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleVerify}
            disabled={isLoading}
            activeOpacity={0.8}>
            {isLoading ? (
              <ActivityIndicator color={colors.primaryWhite} />
            ) : (
              <Text style={styles.buttonText}>Verificar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resendButton}
            onPress={handleResendCode}
            disabled={timer > 0 || isResending}
            activeOpacity={0.7}>
            <Text
              style={[
                styles.resendText,
                timer > 0 && styles.resendTextDisabled,
              ]}>
              {isResending
                ? 'Reenviando...'
                : timer > 0
                  ? `Reenviar código em ${timer}s`
                  : 'Reenviar código'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <FeedbackModal
        visible={feedbackVisible}
        type={feedbackData.type}
        title={feedbackData.title}
        message={feedbackData.message}
        onClose={feedbackData.onClose}
      />

      <Text style={styles.footer}>
        © DelBicos - {new Date().getFullYear()} – Todos os direitos reservados.
      </Text>
    </View>
  );
}

export default VerificationScreen;
