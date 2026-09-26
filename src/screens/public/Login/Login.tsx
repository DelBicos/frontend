import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
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

type FormData = {
  email: string;
  password: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Entrar com e-mail e senha. Clientes e profissionais usam a mesma conta. */
function LoginScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const colors = useColors();
  const styles = createAuthStyles(colors);
  const { signInPassword } = useUserStore();
  // Acesso administrativo: /login?admin=1 ou o link no rodape.
  const [isAdmin, setIsAdmin] = useState(
    !!(route.params as { admin?: unknown } | undefined)?.admin,
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const onSubmit = async ({ email, password }: FormData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      if (isAdmin) {
        await useUserStore.getState().signInAdmin(email.trim(), password);
        navigation.reset({ index: 0, routes: [{ name: 'AdminDashboard' }] });
        return;
      }
      await signInPassword(email.trim(), password);
      const user = useUserStore.getState().user;
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
    } catch (err: any) {
      setError(
        err?.message || 'Não foi possível entrar. Confira e-mail e senha.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const submit = handleSubmit(onSubmit);

  return (
    <AuthLayout
      title={isAdmin ? 'Acesso administrativo' : 'Entrar'}
      subtitle={
        isAdmin
          ? 'Use sua conta de administrador.'
          : 'Acesse para agendar, conversar e acompanhar seus serviços.'
      }>
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

      {!isAdmin ? (
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
      ) : null}

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
          <FontAwesome
            name={isAdmin ? 'lock' : 'sign-in'}
            size={18}
            color="#000000"
          />
        )}
        <Text style={styles.primaryButtonText}>Entrar</Text>
      </Pressable>

      {isAdmin ? (
        <View style={styles.alternate}>
          <Pressable
            onPress={() => setIsAdmin(false)}
            style={styles.linkButton}
            accessibilityRole="button">
            <Text style={styles.linkText}>Voltar ao login comum</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <View style={styles.alternate}>
            <Text style={styles.alternateText}>Ainda não tem conta?</Text>
            <Pressable
              onPress={() => navigation.navigate('Register')}
              style={styles.linkButton}
              accessibilityRole="link">
              <Text style={styles.linkText}>Criar conta</Text>
            </Pressable>
          </View>
          <Pressable
            onPress={() => {
              setError(null);
              setIsAdmin(true);
            }}
            style={[styles.linkButton, { alignSelf: 'center', marginTop: 8 }]}
            accessibilityRole="button">
            <Text
              style={[
                styles.alternateText,
                { fontSize: 14, textDecorationLine: 'underline' },
              ]}>
              Acesso administrativo
            </Text>
          </Pressable>
        </>
      )}
    </AuthLayout>
  );
}

export default LoginScreen;
