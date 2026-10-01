import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  useWindowDimensions,
  Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useUserStore } from '@stores/User';
import CustomTextInput from '@components/ui/CustomTextInput';
import PasswordInput from '@components/ui/PasswordInput';
import { createStyles } from './styles';
import { useColors } from '@theme/ThemeProvider';
import { useThemeStore } from '@stores/Theme';
import { ThemeMode } from '@stores/Theme/types';
import { FontAwesome } from '@expo/vector-icons';

type MessageType = 'success' | 'error' | null;

const TrocarSenhaForm: React.FC = () => {
  const [message, setMessage] = useState<{
    type: MessageType;
    text: string;
  } | null>(null);

  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      senhaAtual: '',
      novaSenha: '',
      confirmarSenha: '',
    },
  });

  const novaSenha = watch('novaSenha');
  const { user, changePassword, acceptLocationConsent, revokeLocationConsent } = useUserStore();
  const { theme } = useThemeStore();
  const isHighContrast = theme === ThemeMode.LIGHT_HI_CONTRAST;
  const colors = useColors();
  const styles = createStyles(colors);

  const responsiveStyles = useMemo(
    () =>
      StyleSheet.create({
        formRow: {
          flexDirection: isDesktop ? 'row' : 'column',
          gap: 16,
          marginBottom: 16,
        },
        inputHalf: {
          flex: isDesktop ? 1 : undefined,
          width: isDesktop ? undefined : '100%',
        },
      }),
    [isDesktop],
  );

  const handleSalvar = async (data: any) => {
    setMessage(null);

    if (data.novaSenha !== data.confirmarSenha) {
      setMessage({ type: 'error', text: 'As senhas não coincidem.' });
      return;
    }

    try {
      await changePassword(data.senhaAtual, data.novaSenha);
      setMessage({
        type: 'success',
        text: 'Sua senha foi alterada com sucesso!',
      });
      reset();
      setTimeout(() => setMessage(null), 5000);
    } catch (error: any) {
      setMessage({
        type: 'error',
        text:
          error?.message ||
          'Erro ao alterar a senha. Verifique sua senha atual.',
      });
      setTimeout(() => setMessage(null), 7000);
    }
  };

  const PasswordRequirement = ({
    regex,
    text,
  }: {
    regex: RegExp;
    text: string;
  }) => {
    const isMet = regex.test(novaSenha || '');
    const iconColor = isMet ? colors.successText : colors.textTertiary;
    const textColor = isMet ? colors.textSecondary : colors.textTertiary;

    return (
      <View style={styles.reqItem}>
        <FontAwesome
          name={isMet ? 'check-circle' : 'circle-o'}
          size={14}
          color={iconColor}
        />
        <Text style={[styles.reqText, { color: textColor }]}>{text}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Segurança & Privacidade</Text>

      {/* Banner de Mensagem */}
      {message && (
        <View
          style={[
            styles.messageBanner,
            message.type === 'success'
              ? styles.successBanner
              : styles.errorBanner,
          ]}>
          <FontAwesome
            name={
              message.type === 'success' ? 'check-circle' : 'exclamation-circle'
            }
            size={20}
            color={
              message.type === 'success' ? colors.successText : colors.errorText
            }
            style={{ marginRight: 12 }}
          />
          <Text
            style={[
              styles.messageText,
              message.type === 'success'
                ? styles.successText
                : styles.errorText,
            ]}>
            {message.text}
          </Text>
        </View>
      )}

      <View
        style={[
          styles.card,
          isHighContrast && {
            borderWidth: 2,
            borderColor: colors.primaryBlack,
          },
        ]}>
        <View style={styles.formContainer}>
          {/* Senha Atual */}
          <Controller
            control={control}
            name="senhaAtual"
            rules={{ required: 'A senha atual é obrigatória.' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <CustomTextInput label="Senha Atual" error={errors.senhaAtual}>
                <PasswordInput
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={!!errors.senhaAtual}
                  placeholder="Digite sua senha atual"
                />
              </CustomTextInput>
            )}
          />

          <View style={responsiveStyles.formRow}>
            {/* Nova Senha */}
            <View style={responsiveStyles.inputHalf}>
              <Controller
                control={control}
                name="novaSenha"
                rules={{
                  required: 'A nova senha é obrigatória.',
                  minLength: { value: 8, message: 'Mínimo 8 caracteres.' },
                  pattern: {
                    value:
                      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
                    message: 'Senha fraca.',
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <CustomTextInput label="Nova Senha" error={errors.novaSenha}>
                    <PasswordInput
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      error={!!errors.novaSenha}
                      placeholder="Crie uma nova senha"
                    />
                  </CustomTextInput>
                )}
              />
            </View>

            {/* Confirmar Senha */}
            <View style={responsiveStyles.inputHalf}>
              <Controller
                control={control}
                name="confirmarSenha"
                rules={{
                  required: 'Confirme a senha.',
                  validate: (value) =>
                    value === novaSenha || 'As senhas não coincidem.',
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <CustomTextInput
                    label="Confirmar Senha"
                    error={errors.confirmarSenha}>
                    <PasswordInput
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      error={!!errors.confirmarSenha}
                      placeholder="Repita a nova senha"
                    />
                  </CustomTextInput>
                )}
              />
            </View>
          </View>

          {/* Checklist de Requisitos */}
          <View style={styles.requirementsContainer}>
            <Text style={styles.requirementsTitle}>Sua senha deve conter:</Text>
            <PasswordRequirement
              regex={/.{8,}/}
              text="Pelo menos 8 caracteres"
            />
            <PasswordRequirement
              regex={/[A-Za-z]/}
              text="Pelo menos uma letra"
            />
            <PasswordRequirement regex={/\d/} text="Pelo menos um número" />
            <PasswordRequirement
              regex={/[@$!%*#?&]/}
              text="Pelo menos um caractere especial (@$!%*#?&)"
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.button,
                (!isValid || isSubmitting) && styles.buttonDisabled,
              ]}
              onPress={handleSubmit(handleSalvar)}
              disabled={!isValid || isSubmitting}
              activeOpacity={0.8}>
              {isSubmitting ? (
                <ActivityIndicator color={colors.primaryWhite} />
              ) : (
                <Text style={styles.buttonText}>Atualizar Senha</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Card LGPD de Geolocalização */}
      <View style={[styles.card, { marginTop: 24 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <FontAwesome name="map-marker" size={20} color={colors.primaryOrange || '#FF6B00'} style={{ marginRight: 10 }} />
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textSecondary || '#0F172A' }}>
            Privacidade & LGPD (Geolocalização)
          </Text>
        </View>

        <Text style={{ fontSize: 14, color: colors.textSecondary || '#475569', marginBottom: 14, lineHeight: 20 }}>
          O DelBicos transmite a sua localização em tempo real apenas durante o deslocamento até o local do agendamento (&quot;Estou a Caminho&quot;). Você pode consultar ou revogar esse consentimento a qualquer momento conforme a Lei nº 13.709/2018.
        </Text>

        <View style={{ backgroundColor: user?.location_consent_accepted ? '#F0FDF4' : '#FEF2F2', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: user?.location_consent_accepted ? '#BBF7D0' : '#FECACA', marginBottom: 16 }}>
          <Text style={{ fontWeight: '700', color: user?.location_consent_accepted ? '#15803D' : '#B91C1C', fontSize: 14, marginBottom: 4 }}>
            {user?.location_consent_accepted ? '✓ Consentimento Ativo' : '✕ Consentimento Revogado / Não Concedido'}
          </Text>
          {user?.location_consent_accepted && user?.location_consent_at ? (
            <Text style={{ fontSize: 12, color: '#166534' }}>
              Autorizado em: {new Date(user.location_consent_at).toLocaleString('pt-BR')}
            </Text>
          ) : null}
          {!user?.location_consent_accepted && user?.location_consent_revoked_at ? (
            <Text style={{ fontSize: 12, color: '#991B1B' }}>
              Revogado em: {new Date(user.location_consent_revoked_at).toLocaleString('pt-BR')}
            </Text>
          ) : null}
        </View>

        {user?.location_consent_accepted ? (
          <TouchableOpacity
            style={{ backgroundColor: '#EF4444', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10, alignItems: 'center' }}
            onPress={async () => {
              try {
                await revokeLocationConsent();
                Alert.alert('Sucesso', 'Seu consentimento de geolocalização foi revogado com sucesso.');
              } catch (err: any) {
                Alert.alert('Erro', err.message || 'Falha ao revogar consentimento.');
              }
            }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 }}>Revogar Consentimento de Localização</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={{ backgroundColor: '#2563EB', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10, alignItems: 'center' }}
            onPress={async () => {
              try {
                await acceptLocationConsent();
                Alert.alert('Sucesso', 'Consentimento de geolocalização registrado com sucesso.');
              } catch (err: any) {
                Alert.alert('Erro', err.message || 'Falha ao aceitar consentimento.');
              }
            }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 }}>Conceder Consentimento de Localização</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default TrocarSenhaForm;
