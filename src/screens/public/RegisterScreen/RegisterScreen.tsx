import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';

import CustomTextInput from '@components/ui/CustomTextInput';
import CpfInput from '@components/ui/CpfInput';
import DateInput from '@components/ui/DateInput';
import PhoneInput from '@components/ui/PhoneInput';
import PasswordInput from '@components/ui/PasswordInput';
import { FeedbackModal } from '@components/ui/FeedbackModal';

import {
  AddressForm,
  AddressFormData,
} from '@components/features/AddressForm/AddressForm';

import { createStyles } from './styles';
import { isValidCPF } from '@utils/validators';
import { useUserStore } from '@stores/User';
import { useColors } from '@theme/ThemeProvider';
import { register } from '@api/auth';
import { getApiErrorMessage } from '@api/errors';
import LogoV3 from '@assets/LogoV3.png';

type RegisterFormData = {
  name: string;
  surname: string;
  birthDate: string;
  cpf: string;
  email: string;
  phone: string;
  password: string;
  acceptTerms: boolean;
} & AddressFormData;

function RegisterScreen() {
  const navigation = useNavigation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { setVerificationEmail } = useUserStore();

  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    type: 'info' as 'success' | 'error' | 'info',
    title: '',
    message: '',
    onClose: () => setFeedbackVisible(false),
  });

  const colors = useColors();
  const styles = createStyles(colors);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm<RegisterFormData>({
    mode: 'onChange',
    defaultValues: {
      name: '',
      surname: '',
      birthDate: '',
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

  const handleRegister = async (formData: RegisterFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        surname: formData.surname,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        cpf: formData.cpf,
        birthDate: formData.birthDate,
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
      };

      await register(payload);

      setVerificationEmail(formData.email);
      setFeedbackData({
        type: 'success',
        title: 'Quase lá!',
        message: `Enviamos um código de verificação para ${formData.email}. Verifique sua caixa de entrada.`,
        onClose: () => {
          setFeedbackVisible(false);
          // @ts-ignore
          navigation.navigate('VerificationScreen');
        },
      });
      setFeedbackVisible(true);
    } catch (error) {
      setFeedbackData({
        type: 'error',
        title: 'Erro no Cadastro',
        message: getApiErrorMessage(
          error,
          'Ocorreu um problema ao realizar o cadastro.',
        ),
        onClose: () => setFeedbackVisible(false),
      });
      setFeedbackVisible(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => navigation.navigate('Home' as never)}>
          <Image source={LogoV3} style={styles.logo} resizeMode="contain" />
        </TouchableOpacity>

        <View style={styles.formContainer}>
          <Text style={styles.title}>Crie sua conta</Text>
          <Text style={styles.subtitle}>
            Preencha os campos abaixo para começar.
          </Text>

          {/* --- Campos Pessoais (Grid) --- */}
          <View style={styles.row}>
            <View style={styles.col}>
              <Controller
                control={control}
                name="name"
                rules={{ required: 'Nome obrigatório' }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <CustomTextInput
                    label="Nome"
                    placeholder="Seu nome"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    error={errors.name}
                  />
                )}
              />
            </View>
            <View style={styles.col}>
              <Controller
                control={control}
                name="surname"
                rules={{ required: 'Sobrenome obrigatório' }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <CustomTextInput
                    label="Sobrenome"
                    placeholder="Seu sobrenome"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    error={errors.surname}
                  />
                )}
              />
            </View>
          </View>

          <Controller
            control={control}
            name="birthDate"
            rules={{
              required: 'Data de nascimento obrigatória',
              minLength: { value: 10, message: 'Data incompleta' },
            }}
            render={({ field: { onChange, value } }) => (
              <DateInput
                label="Data de Nascimento"
                value={value}
                onChangeText={onChange}
                error={errors.birthDate?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="cpf"
            rules={{
              required: 'CPF obrigatório',
              validate: (value) => isValidCPF(value) || 'CPF inválido',
            }}
            render={({ field: { onChange, value } }) => (
              <CpfInput
                label="CPF"
                value={value}
                onChangeText={onChange}
                error={errors.cpf?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            rules={{
              required: 'E-mail obrigatório',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'E-mail inválido',
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
              />
            )}
          />

          <Controller
            control={control}
            name="phone"
            rules={{
              required: 'Telefone obrigatório',
              minLength: { value: 10, message: 'Telefone inválido' },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <PhoneInput
                label="Telefone"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.phone?.message}
              />
            )}
          />

          <View style={{ zIndex: 100, width: '100%' }}>
            <AddressForm
              control={control}
              errors={errors}
              setValue={setValue}
            />
          </View>

          <Controller
            control={control}
            name="password"
            rules={{
              required: 'Senha obrigatória',
              minLength: { value: 6, message: 'Mínimo 6 caracteres' },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <CustomTextInput label="Senha" error={errors.password}>
                <PasswordInput
                  placeholder="Crie uma senha forte"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={!!errors.password}
                />
              </CustomTextInput>
            )}
          />

          {/* --- Termos --- */}
          <Controller
            control={control}
            name="acceptTerms"
            rules={{
              validate: (value) =>
                value === true || 'Você deve aceitar os termos de uso.',
            }}
            render={({ field: { onChange, value } }) => (
              <View>
                <View style={styles.termsContainer}>
                  <Switch
                    value={value}
                    onValueChange={onChange}
                    trackColor={{
                      false: '#767577',
                      true: colors.primaryOrange,
                    }}
                    thumbColor={colors.primaryWhite}
                  />
                  <Text style={styles.termsText}>
                    Aceito os{' '}
                    <Text style={styles.linkTextBold}>termos de uso</Text> e{' '}
                    <Text style={styles.linkTextBold}>condições</Text>
                  </Text>
                </View>
                {errors.acceptTerms && (
                  <Text
                    style={[
                      styles.errorText,
                      { textAlign: 'center', marginBottom: 10 },
                    ]}>
                    {errors.acceptTerms.message}
                  </Text>
                )}
              </View>
            )}
          />

          <TouchableOpacity
            style={[
              styles.button,
              (!isValid || isSubmitting) && styles.buttonDisabled,
            ]}
            onPress={handleSubmit(handleRegister)}
            disabled={!isValid || isSubmitting}
            activeOpacity={0.8}>
            {isSubmitting ? (
              <ActivityIndicator color={colors.primaryWhite} />
            ) : (
              <Text style={styles.buttonText}>Cadastrar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Login' as never)}>
            <Text style={styles.linkText}>
              Já tem uma conta?{' '}
              <Text style={styles.linkTextBold}>Faça login</Text>
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

export default RegisterScreen;
