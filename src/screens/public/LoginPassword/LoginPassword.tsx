import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { FontAwesome } from '@expo/vector-icons';

import { useUserStore } from '@stores/User';
import CustomTextInput from '@components/ui/CustomTextInput';
import PasswordInput from '@components/ui/PasswordInput';
import { checkForNewNotifications } from '@utils/usePushNotifications';

import LogoV3 from '@assets/LogoV3.png';
import { createStyles } from './styles';
import { useColors } from '@theme/ThemeProvider';

type FormData = {
  email: string;
  password: string;
};

export const LoginPassword = () => {
  const navigation = useNavigation();
  const { signInPassword } = useUserStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const colors = useColors();
  const styles = createStyles(colors);

  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  type LoginRole = 'user' | 'partner' | 'admin';
  const [selectedRole, setSelectedRole] = useState<LoginRole>('user');

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormData>({
    mode: 'onTouched',
    defaultValues: { email: '', password: '' },
  });

  const onLoginPress = async (data: FormData) => {
    setIsSubmitting(true);
    setErrorModalVisible(false);

    try {
      if (selectedRole === 'admin') {
        // @ts-ignore
        const signInAdminFn = useUserStore.getState().signInAdmin;

        if (signInAdminFn) {
          await signInAdminFn(data.email, data.password);
        } else {
          await signInPassword(data.email, data.password);
        }

        // @ts-ignore
        navigation.navigate('Home');
      } else if (selectedRole === 'partner') {
        await signInPassword(data.email, data.password);
        const user = useUserStore.getState().user;

        if (!user || !user.professional_id) {
          // Desloga para segurança e lança erro se não for parceiro
          useUserStore.getState().signOut();
          throw new Error(
            'Esta conta não possui cadastro de parceiro colaborador.',
          );
        }

        // @ts-ignore
        navigation.navigate('ProfessionalTabs');
      } else {
        await signInPassword(data.email, data.password);

        const userId = useUserStore.getState().user?.id;
        if (userId) {
          setTimeout(() => {
            checkForNewNotifications(
              userId.toString(),
              new Date(Date.now() - 60000),
              false,
            ).catch(() => {});
          }, 1000);
        }

        // @ts-ignore
        navigation.navigate('Home');
      }
    } catch (error: any) {
      console.error('Erro no login:', error);
      setErrorMessage(
        error.message || 'Credenciais inválidas. Verifique e tente novamente.',
      );
      setErrorModalVisible(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Home' as never)}
          activeOpacity={0.8}>
          <Image source={LogoV3} style={styles.logo} />
        </TouchableOpacity>

        <View style={styles.formContainer}>
          {/* Seletor de Tipo de Conta */}
          <View style={styles.roleToggle}>
            <TouchableOpacity
              onPress={() => setSelectedRole('user')}
              style={[
                styles.roleButton,
                selectedRole === 'user' && styles.roleButtonActive,
              ]}
              activeOpacity={0.8}>
              <Text
                style={[
                  styles.roleText,
                  selectedRole === 'user' && styles.roleTextActive,
                ]}>
                Usuário
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSelectedRole('partner')}
              style={[
                styles.roleButton,
                selectedRole === 'partner' && styles.roleButtonActive,
              ]}
              activeOpacity={0.8}>
              <Text
                style={[
                  styles.roleText,
                  selectedRole === 'partner' && styles.roleTextActive,
                ]}>
                Parceiro
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSelectedRole('admin')}
              style={[
                styles.roleButton,
                selectedRole === 'admin' && styles.roleButtonActive,
              ]}
              activeOpacity={0.8}>
              <Text
                style={[
                  styles.roleText,
                  selectedRole === 'admin' && styles.roleTextActive,
                ]}>
                Admin
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>Bem-vindo!</Text>
          <Text style={styles.subtitle}>Acesse sua conta para continuar.</Text>

          <View style={styles.inputWrapper}>
            <Controller
              control={control}
              name="email"
              rules={{
                required: 'O e-mail é obrigatório.',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
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
                />
              )}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Controller
              control={control}
              name="password"
              rules={{ required: 'A senha é obrigatória.' }}
              render={({ field: { onChange, onBlur, value } }) => (
                <CustomTextInput label="Senha" error={errors.password}>
                  <PasswordInput
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder="Sua senha"
                    onSubmitEditing={handleSubmit(onLoginPress)}
                    error={!!errors.password}
                  />
                </CustomTextInput>
              )}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              (!isValid || isSubmitting) && styles.buttonDisabled,
            ]}
            onPress={handleSubmit(onLoginPress)}
            disabled={!isValid || isSubmitting}
            activeOpacity={0.8}>
            {isSubmitting ? (
              <ActivityIndicator color={colors.primaryWhite} />
            ) : (
              <View style={styles.buttonContent}>
                <FontAwesome
                  name={
                    selectedRole === 'admin'
                      ? 'lock'
                      : selectedRole === 'partner'
                        ? 'briefcase'
                        : 'user'
                  }
                  size={18}
                  color={colors.primaryWhite}
                />
                <Text style={styles.buttonText}>Entrar</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Register' as never)}
            style={styles.linkContainer}>
            <Text style={styles.linkText}>Não tem uma conta?</Text>
            <Text style={styles.linkTextBold}>Cadastre-se</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Text style={styles.footer}>
        © DelBicos - {new Date().getFullYear()} – Todos os direitos reservados.
      </Text>

      {/* Modal de Erro */}
      <Modal
        animationType="fade"
        visible={errorModalVisible}
        onRequestClose={() => setErrorModalVisible(false)}
        transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Erro no Login</Text>
            <Text style={styles.modalText}>{errorMessage}</Text>

            <TouchableOpacity
              style={[styles.button, styles.modalButton]}
              onPress={() => setErrorModalVisible(false)}>
              <Text style={styles.buttonText}>Tentar Novamente</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};
