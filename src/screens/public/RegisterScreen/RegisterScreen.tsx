import React, { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { FontAwesome } from '@expo/vector-icons';
import CustomTextInput from '@components/ui/CustomTextInput';
import CpfInput from '@components/ui/CpfInput';
import PhoneInput from '@components/ui/PhoneInput';
import PasswordInput from '@components/ui/PasswordInput';
import {
  AddressForm,
  AddressFormData,
} from '@components/features/AddressForm/AddressForm';
import AuthLayout, {
  AuthAlert,
  createAuthStyles,
} from '@components/layout/AuthLayout';
import { isValidCPF } from '@utils/validators';
import { useUserStore } from '@stores/User';
import { useColors } from '@theme/ThemeProvider';
import { useBreakpoint } from '@lib/hooks/useBreakpoint';
import { register } from '@api/auth';
import { getApiErrorMessage } from '@api/errors';
import { createStyles } from './styles';

type RegisterFormData = {
  name: string;
  surname: string;
  cpf: string;
  email: string;
  phone: string;
  password: string;
  acceptTerms: boolean;
} & AddressFormData;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 6;

/** Criar conta: dados, acesso e endereco; depois confirma o e-mail. */
function RegisterScreen() {
  const navigation = useNavigation<any>();
  const colors = useColors();
  const { isCompact } = useBreakpoint();
  const auth = createAuthStyles(colors);
  const styles = createStyles(colors, isCompact);
  const { setVerificationEmail, recordCodeSent } = useUserStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, submitCount },
  } = useForm<RegisterFormData>({
    mode: 'onTouched',
    defaultValues: {
      name: '',
      surname: '',
      cpf: '',
      email: '',
      phone: '',
      password: '',
      acceptTerms: false,
      cep: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
    },
  });

  const hasErrors = Object.keys(errors).length > 0;

  const onSubmit = async (formData: RegisterFormData) => {
    setIsSubmitting(true);
    setError(null);
    const email = formData.email.trim().toLowerCase();
    try {
      await register({
        name: formData.name.trim(),
        surname: formData.surname.trim(),
        email,
        phone: formData.phone,
        password: formData.password,
        cpf: formData.cpf,
        address: {
          postal_code: formData.cep,
          street: formData.street,
          number: formData.number,
          complement: formData.complement,
          neighborhood: formData.neighborhood,
          city: formData.city,
          state: formData.state,
          country_iso: 'BR',
        },
      });
      setVerificationEmail(email);
      recordCodeSent();
      navigation.navigate('VerificationScreen');
    } catch (err) {
      setError(
        getApiErrorMessage(err, 'Não foi possível criar a conta agora.'),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Criar conta"
      subtitle="Leva só um minuto. Depois é só confirmar o código que enviamos para o seu e-mail."
      maxWidth={640}>
      {/* --- Dados pessoais --- */}
      <Text
        style={styles.sectionTitle}
        accessibilityRole="header"
        {...({ 'aria-level': 2 } as object)}>
        Seus dados
      </Text>
      <View style={styles.row}>
        <View style={styles.col}>
          <Controller
            control={control}
            name="name"
            rules={{ required: 'Informe seu nome.' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <CustomTextInput
                label="Nome"
                placeholder="Seu nome"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.name}
                autoComplete="given-name"
                textContentType="givenName"
              />
            )}
          />
        </View>
        <View style={styles.col}>
          <Controller
            control={control}
            name="surname"
            rules={{ required: 'Informe seu sobrenome.' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <CustomTextInput
                label="Sobrenome"
                placeholder="Seu sobrenome"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.surname}
                autoComplete="family-name"
                textContentType="familyName"
              />
            )}
          />
        </View>
      </View>
      <View style={styles.row}>
        <View style={styles.col}>
          <Controller
            control={control}
            name="cpf"
            rules={{
              required: 'Informe seu CPF.',
              validate: (value) => isValidCPF(value) || 'CPF inválido.',
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <CpfInput
                label="CPF"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.cpf?.message}
              />
            )}
          />
        </View>
        <View style={styles.col}>
          <Controller
            control={control}
            name="phone"
            rules={{
              required: 'Informe seu telefone.',
              minLength: { value: 10, message: 'Telefone incompleto.' },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <PhoneInput
                label="Celular"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.phone?.message}
              />
            )}
          />
        </View>
      </View>

      {/* --- Acesso --- */}
      <Text
        style={styles.sectionTitle}
        accessibilityRole="header"
        {...({ 'aria-level': 2 } as object)}>
        Acesso
      </Text>
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
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        rules={{
          required: 'Crie uma senha.',
          minLength: {
            value: MIN_PASSWORD,
            message: `Use pelo menos ${MIN_PASSWORD} caracteres.`,
          },
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <CustomTextInput label="Senha" error={errors.password}>
            <PasswordInput
              placeholder={`Mínimo de ${MIN_PASSWORD} caracteres`}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              accessibilityLabel="Senha"
              autoComplete="new-password"
              textContentType="newPassword"
              error={!!errors.password}
            />
          </CustomTextInput>
        )}
      />

      {/* --- Endereco --- */}
      <Text
        style={styles.sectionTitle}
        accessibilityRole="header"
        {...({ 'aria-level': 2 } as object)}>
        Endereço
      </Text>
      <Text style={[auth.hint, { marginTop: -4 }]}>
        Usado para mostrar profissionais perto de você e como local padrão dos
        atendimentos. Digite o CEP que preenchemos o resto.
      </Text>
      <View style={styles.address}>
        <AddressForm control={control} errors={errors} setValue={setValue} />
      </View>

      {/* --- Termos --- */}
      <Controller
        control={control}
        name="acceptTerms"
        rules={{
          validate: (value) =>
            value === true || 'Para criar a conta, aceite os termos de uso.',
        }}
        render={({ field: { onChange, value } }) => (
          <View style={styles.termsBlock}>
            <Pressable
              onPress={() => onChange(!value)}
              style={styles.terms}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: value }}>
              <View style={[styles.checkbox, value && styles.checkboxOn]}>
                {value ? (
                  <FontAwesome name="check" size={14} color="#000000" />
                ) : null}
              </View>
              <Text style={styles.termsText}>
                Li e aceito os termos de uso e a política de privacidade do
                DelBicos.
              </Text>
            </Pressable>
            {errors.acceptTerms ? (
              <Text style={styles.errorText}>{errors.acceptTerms.message}</Text>
            ) : null}
          </View>
        )}
      />

      {error ? <AuthAlert>{error}</AuthAlert> : null}
      {submitCount > 0 && hasErrors ? (
        <AuthAlert>Confira os campos destacados acima.</AuthAlert>
      ) : null}

      <Pressable
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
        style={({ pressed }) => [
          auth.primaryButton,
          isSubmitting && auth.primaryButtonDisabled,
          pressed && { opacity: 0.85 },
        ]}
        accessibilityRole="button"
        accessibilityState={{ busy: isSubmitting }}>
        {isSubmitting ? <ActivityIndicator color="#000000" /> : null}
        <Text style={auth.primaryButtonText}>Criar conta</Text>
      </Pressable>

      <View style={auth.alternate}>
        <Text style={auth.alternateText}>Já tem conta?</Text>
        <Pressable
          onPress={() => navigation.navigate('Login')}
          style={auth.linkButton}
          accessibilityRole="link">
          <Text style={auth.linkText}>Entrar</Text>
        </Pressable>
      </View>
    </AuthLayout>
  );
}

export default RegisterScreen;
