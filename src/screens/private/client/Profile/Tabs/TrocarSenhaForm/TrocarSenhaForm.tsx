import React, { useState } from 'react';
import { Text, View, useWindowDimensions } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import { useUserStore } from '@stores/User';
import CustomTextInput from '@components/ui/CustomTextInput';
import PasswordInput from '@components/ui/PasswordInput';
import ActionButton from '@components/ui/ActionButton';
import InlineAlert from '@components/ui/InlineAlert';
import { useColors } from '@theme/ThemeProvider';
import ProfilePage, { ProfileCard } from '../../components/ProfilePage';
import { passwordStrength, MIN_PASSWORD_LENGTH } from './passwordStrength';
import { createStyles } from './styles';

type FormData = { current: string; next: string; confirm: string };

/** Trocar a senha (com a atual) ou ir para "esqueci minha senha". */
const TrocarSenhaForm: React.FC = () => {
  const colors = useColors();
  const styles = createStyles(colors);
  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();
  const isNarrow = width < 600;
  const { changePassword, user } = useUserStore();
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    getValues,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    mode: 'onTouched',
    defaultValues: { current: '', next: '', confirm: '' },
  });

  const strength = passwordStrength(watch('next'));
  const strengthColor = [
    colors.errorText,
    colors.errorText,
    colors.warningText,
    colors.successText,
  ][strength.level];

  const save = async (data: FormData) => {
    setFeedback(null);
    try {
      await changePassword(data.current, data.next);
      reset();
      setFeedback({ type: 'success', text: 'Senha alterada.' });
    } catch (error: any) {
      setFeedback({
        type: 'error',
        text: error?.message || 'Não foi possível trocar a senha.',
      });
    }
  };

  return (
    <ProfilePage
      title="Senha e segurança"
      subtitle="Use uma senha que você não usa em outros sites.">
      <ProfileCard title="Trocar senha">
        <Controller
          control={control}
          name="current"
          rules={{ required: 'Informe sua senha atual.' }}
          render={({ field: { onChange, onBlur, value } }) => (
            <CustomTextInput label="Senha atual" error={errors.current}>
              <PasswordInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                accessibilityLabel="Senha atual"
                autoComplete="current-password"
                textContentType="password"
                error={!!errors.current}
              />
            </CustomTextInput>
          )}
        />

        <View style={[styles.row, isNarrow && styles.rowNarrow]}>
          <View style={styles.col}>
            <Controller
              control={control}
              name="next"
              rules={{
                required: 'Crie a nova senha.',
                minLength: {
                  value: MIN_PASSWORD_LENGTH,
                  message: `Use pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`,
                },
                validate: (value) =>
                  value !== getValues('current') ||
                  'A nova senha deve ser diferente da atual.',
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <CustomTextInput label="Nova senha" error={errors.next}>
                  <PasswordInput
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    accessibilityLabel="Nova senha"
                    autoComplete="new-password"
                    textContentType="newPassword"
                    error={!!errors.next}
                  />
                </CustomTextInput>
              )}
            />
          </View>
          <View style={styles.col}>
            <Controller
              control={control}
              name="confirm"
              rules={{
                required: 'Repita a nova senha.',
                validate: (value) =>
                  value === getValues('next') || 'As senhas não são iguais.',
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <CustomTextInput
                  label="Repita a nova senha"
                  error={errors.confirm}>
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
          </View>
        </View>

        {watch('next') ? (
          <View style={styles.strength} accessibilityLiveRegion="polite">
            <View style={styles.bars}>
              {[1, 2, 3].map((n) => (
                <View
                  key={n}
                  style={[
                    styles.bar,
                    strength.level >= n && { backgroundColor: strengthColor },
                  ]}
                />
              ))}
            </View>
            <Text style={styles.strengthText}>
              Força: <Text style={styles.strengthLabel}>{strength.label}</Text>
              {strength.tip ? ` · ${strength.tip}` : ''}
            </Text>
          </View>
        ) : (
          <Text style={styles.hint}>
            Mínimo de {MIN_PASSWORD_LENGTH} caracteres. Misturar letras, números
            e símbolos deixa a senha mais segura.
          </Text>
        )}

        {feedback ? (
          <InlineAlert type={feedback.type}>{feedback.text}</InlineAlert>
        ) : null}

        <View style={styles.actions}>
          <ActionButton
            label="Trocar senha"
            onPress={handleSubmit(save)}
            loading={isSubmitting}
            block={isNarrow}
          />
          <ActionButton
            label="Esqueci a senha atual"
            variant="ghost"
            accessibilityRole="link"
            onPress={() =>
              navigation.navigate('ForgotPassword', { email: user?.email })
            }
          />
        </View>
      </ProfileCard>

      <View style={styles.tip}>
        <FontAwesome name="shield" size={18} color={colors.textSecondary} />
        <Text style={styles.tipText}>
          O DelBicos nunca pede sua senha por e-mail, WhatsApp ou chat.
        </Text>
      </View>
    </ProfilePage>
  );
};

export default TrocarSenhaForm;
