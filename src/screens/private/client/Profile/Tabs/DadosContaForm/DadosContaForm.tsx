import React, { useEffect, useState } from 'react';
import { Platform, Text, View, useWindowDimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useForm, Controller } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import CustomTextInput from '@components/ui/CustomTextInput';
import PhoneInput from '@components/ui/PhoneInput';
import Avatar from '@components/ui/Avatar';
import ActionButton from '@components/ui/ActionButton';
import InlineAlert from '@components/ui/InlineAlert';
import { maskCpf } from '@components/ui/CpfInput/CpfInput';
import { useColors } from '@theme/ThemeProvider';
import { useUserStore } from '@stores/User';
import { confirmAction } from '@lib/utils/confirmAction';
import { UserProfileProps } from '../../types';
import ProfilePage, { ProfileCard } from '../../components/ProfilePage';
import { createStyles } from './styles';

interface DadosContaFormProps {
  user?: UserProfileProps;
}

type FormData = {
  name: string;
  surname: string;
  email: string;
  phone: string;
};

type Feedback = { type: 'success' | 'error'; text: string } | null;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function splitName(full: string) {
  const parts = full.trim().split(/\s+/);
  return { name: parts[0] ?? '', surname: parts.slice(1).join(' ') };
}

/** Foto, nome, contato e CPF (somente leitura). */
export default function DadosContaForm({
  user: propUser,
}: DadosContaFormProps) {
  const colors = useColors();
  const styles = createStyles(colors);
  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();
  const isNarrow = width < 600;
  const { user, avatarBase64, updateUserProfile, uploadAvatar, removeAvatar } =
    useUserStore();

  const fullName = user?.name ?? propUser?.userName ?? '';
  const email = user?.email ?? propUser?.userEmail ?? '';
  const phone = user?.phone ?? propUser?.userPhone ?? '';
  const cpf = user?.cpf ?? propUser?.userCpf ?? '';
  const avatarUri = avatarBase64 || user?.avatar_uri || null;

  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoFeedback, setPhotoFeedback] = useState<Feedback>(null);
  const [formFeedback, setFormFeedback] = useState<Feedback>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<FormData>({
    mode: 'onTouched',
    defaultValues: { ...splitName(fullName), email, phone },
  });

  // Recarrega o formulario quando os dados da conta chegam do servidor.
  useEffect(() => {
    reset({ ...splitName(fullName), email, phone });
  }, [fullName, email, phone, reset]);

  const sendPhoto = async (asset: ImagePicker.ImagePickerAsset) => {
    setPhotoBusy(true);
    setPhotoFeedback(null);
    const result = await uploadAvatar(asset.uri);
    setPhotoBusy(false);
    setPhotoFeedback(
      result.erro
        ? {
            type: 'error',
            text: result.mensagem || 'Não foi possível enviar a foto.',
          }
        : { type: 'success', text: 'Foto atualizada.' },
    );
  };

  const pickFromGallery = async () => {
    if (Platform.OS !== 'web') {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        setPhotoFeedback({
          type: 'error',
          text: 'Permita o acesso às fotos nas configurações do aparelho.',
        });
        return;
      }
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) sendPhoto(result.assets[0]);
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      setPhotoFeedback({
        type: 'error',
        text: 'Permita o acesso à câmera nas configurações do aparelho.',
      });
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) sendPhoto(result.assets[0]);
  };

  const deletePhoto = async () => {
    const ok = await confirmAction({
      title: 'Remover foto',
      message: 'Sua foto de perfil vai ser removida.',
      confirmLabel: 'Remover',
      destructive: true,
    });
    if (!ok) return;
    setPhotoBusy(true);
    setPhotoFeedback(null);
    const result = await removeAvatar();
    setPhotoBusy(false);
    setPhotoFeedback(
      result?.erro
        ? {
            type: 'error',
            text: result.mensagem || 'Não foi possível remover.',
          }
        : { type: 'success', text: 'Foto removida.' },
    );
  };

  const save = async (data: FormData) => {
    setFormFeedback(null);
    try {
      await updateUserProfile({
        name: `${data.name.trim()} ${data.surname.trim()}`.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone.replace(/\D/g, ''),
      });
      reset(data);
      setFormFeedback({ type: 'success', text: 'Dados salvos.' });
    } catch (error: any) {
      setFormFeedback({
        type: 'error',
        text: error?.message || 'Não foi possível salvar. Tente de novo.',
      });
    }
  };

  return (
    <ProfilePage
      title="Dados da conta"
      subtitle="Como você aparece para os profissionais e como falamos com você.">
      <ProfileCard title="Foto de perfil">
        <View style={[styles.photoRow, isNarrow && styles.photoRowNarrow]}>
          <Avatar uri={avatarUri} name={fullName} size={96} />
          <View style={styles.photoActions}>
            <Text style={styles.hint}>
              Uma foto ajuda o profissional a reconhecer você no atendimento.
            </Text>
            <View style={styles.buttons}>
              {Platform.OS !== 'web' ? (
                <ActionButton
                  label="Tirar foto"
                  icon="camera"
                  variant="secondary"
                  size="sm"
                  onPress={takePhoto}
                  disabled={photoBusy}
                />
              ) : null}
              <ActionButton
                label={Platform.OS === 'web' ? 'Escolher foto' : 'Galeria'}
                icon="image"
                variant="secondary"
                size="sm"
                onPress={pickFromGallery}
                loading={photoBusy}
              />
              {avatarUri ? (
                <ActionButton
                  label="Remover"
                  variant="ghost"
                  size="sm"
                  onPress={deletePhoto}
                  disabled={photoBusy}
                />
              ) : null}
            </View>
          </View>
        </View>
        {photoFeedback ? (
          <View style={styles.feedback}>
            <InlineAlert type={photoFeedback.type}>
              {photoFeedback.text}
            </InlineAlert>
          </View>
        ) : null}
      </ProfileCard>

      <ProfileCard title="Informações pessoais">
        <View style={[styles.row, isNarrow && styles.rowNarrow]}>
          <View style={styles.col}>
            <Controller
              control={control}
              name="name"
              rules={{ required: 'Informe seu nome.' }}
              render={({ field: { onChange, onBlur, value } }) => (
                <CustomTextInput
                  label="Nome"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.name}
                  autoComplete="given-name"
                />
              )}
            />
          </View>
          <View style={styles.col}>
            <Controller
              control={control}
              name="surname"
              render={({ field: { onChange, onBlur, value } }) => (
                <CustomTextInput
                  label="Sobrenome"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoComplete="family-name"
                />
              )}
            />
          </View>
        </View>
        <View style={[styles.row, isNarrow && styles.rowNarrow]}>
          <View style={styles.col}>
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
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.email}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              )}
            />
          </View>
          <View style={styles.col}>
            <Controller
              control={control}
              name="phone"
              rules={{
                required: 'Informe seu celular.',
                validate: (v) =>
                  v.replace(/\D/g, '').length >= 10 || 'Telefone incompleto.',
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

        <View style={styles.readonly}>
          <Text style={styles.readonlyLabel}>CPF</Text>
          <Text style={styles.readonlyValue}>{maskCpf(cpf) || '—'}</Text>
          <Text style={styles.hint}>
            O CPF não pode ser alterado. Precisa corrigir? Fale com o suporte na{' '}
            <Text
              style={styles.link}
              onPress={() => navigation.navigate('Help')}
              accessibilityRole="link">
              Central de ajuda
            </Text>
            .
          </Text>
        </View>

        {formFeedback ? (
          <InlineAlert type={formFeedback.type}>
            {formFeedback.text}
          </InlineAlert>
        ) : null}

        <View style={styles.formActions}>
          <ActionButton
            label="Salvar alterações"
            onPress={handleSubmit(save)}
            loading={isSubmitting}
            disabled={!isDirty}
            block={isNarrow}
          />
          {isDirty ? (
            <ActionButton
              label="Descartar"
              variant="ghost"
              onPress={() => {
                reset();
                setFormFeedback(null);
              }}
            />
          ) : null}
        </View>
      </ProfileCard>
    </ProfilePage>
  );
}
