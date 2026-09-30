import React, { useState } from 'react';
import { Image, Platform, Pressable, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import ActionButton from '@components/ui/ActionButton';
import Chip from '@components/ui/Chip';
import InlineAlert from '@components/ui/InlineAlert';
import VerifiedBadge from '@components/ui/VerifiedBadge';
import { useColors } from '@theme/ThemeProvider';
import {
  submitIdentity,
  uploadIdentityFile,
  type DocumentType,
  type IdentityFile,
  type VerificationStatus,
} from '@api/verification';
import { getApiErrorMessage } from '@api/errors';
import { ProfileCard } from '../../components/ProfilePage';
import { createStyles } from './styles';

type Picked = Partial<Record<IdentityFile, string>>;

const SLOTS: { kind: IdentityFile; label: string; hint: string }[] = [
  {
    kind: 'front',
    label: 'Frente do documento',
    hint: 'Foto nítida, sem reflexo.',
  },
  {
    kind: 'back',
    label: 'Verso (opcional)',
    hint: 'Se o documento tiver verso.',
  },
  {
    kind: 'selfie',
    label: 'Selfie com o documento',
    hint: 'Seu rosto e o documento na mesma foto.',
  },
];

interface Props {
  status: VerificationStatus;
  onChanged: () => void;
}

/** Envio de documento e selfie para o selo de profissional verificado. */
function IdentityCard({ status, onChanged }: Props) {
  const colors = useColors();
  const styles = createStyles(colors);
  const [documentType, setDocumentType] = useState<DocumentType>('cnh');
  const [picked, setPicked] = useState<Picked>({});
  const [busy, setBusy] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const identity = status.identity;
  const showForm =
    !status.verified &&
    (!identity || identity.status === 'rejected' || resending);

  const pick = async (kind: IdentityFile, camera: boolean) => {
    setError(null);
    if (Platform.OS !== 'web') {
      const perm = camera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (perm.status !== 'granted') {
        setError('Permita o acesso nas configurações do aparelho.');
        return;
      }
    }
    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    };
    const result = camera
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);
    if (!result.canceled && result.assets[0]) {
      setPicked((prev) => ({ ...prev, [kind]: result.assets[0].uri }));
    }
  };

  const send = async () => {
    if (!picked.front || !picked.selfie) {
      setError('Envie a frente do documento e a selfie.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const [front, selfie, back] = await Promise.all([
        uploadIdentityFile('front', picked.front),
        uploadIdentityFile('selfie', picked.selfie),
        picked.back ? uploadIdentityFile('back', picked.back) : null,
      ]);
      await submitIdentity({
        document_type: documentType,
        front_key: front,
        back_key: back,
        selfie_key: selfie,
      });
      setPicked({});
      setResending(false);
      onChanged();
    } catch (err) {
      setError(
        getApiErrorMessage(err, 'Não foi possível enviar. Tente de novo.'),
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <ProfileCard title="Identidade">
      {status.verified ? (
        <View style={styles.rowGap}>
          <VerifiedBadge showLabel size={20} />
          <Text style={styles.body}>
            Seu perfil exibe o selo de verificado para os clientes.
          </Text>
        </View>
      ) : null}

      {identity?.status === 'pending' ? (
        <InlineAlert type="info">
          Recebemos seus documentos e eles estão em análise. Você será avisado
          por notificação.
        </InlineAlert>
      ) : null}

      {identity?.status === 'rejected' && !resending ? (
        <InlineAlert type="error">
          {`Não conseguimos verificar seus documentos: ${identity.reject_reason ?? 'motivo não informado'}.`}
        </InlineAlert>
      ) : null}

      {!identity && !status.verified ? (
        <Text style={styles.body}>
          Envie um documento com foto e uma selfie segurando o documento. Um
          administrador confere e o selo aparece no seu perfil. As imagens ficam
          em armazenamento privado e são apagadas após a análise.
        </Text>
      ) : null}

      {showForm ? (
        <View style={styles.form}>
          <Text style={styles.label}>Tipo de documento</Text>
          <View style={styles.chips}>
            <Chip
              label="CNH"
              selected={documentType === 'cnh'}
              onPress={() => setDocumentType('cnh')}
            />
            <Chip
              label="RG"
              selected={documentType === 'rg'}
              onPress={() => setDocumentType('rg')}
            />
          </View>

          {SLOTS.map((slot) => (
            <View key={slot.kind} style={styles.slot}>
              <View style={styles.slotTexts}>
                <Text style={styles.label}>{slot.label}</Text>
                <Text style={styles.hint}>{slot.hint}</Text>
                <View style={styles.slotButtons}>
                  <Pressable
                    onPress={() => pick(slot.kind, false)}
                    accessibilityRole="button"
                    accessibilityLabel={`Escolher foto: ${slot.label}`}
                    style={styles.pickButton}>
                    <MaterialIcons
                      name="photo-library"
                      size={18}
                      color={colors.primaryBlack}
                    />
                    <Text style={styles.pickText}>Galeria</Text>
                  </Pressable>
                  {Platform.OS !== 'web' ? (
                    <Pressable
                      onPress={() => pick(slot.kind, true)}
                      accessibilityRole="button"
                      accessibilityLabel={`Tirar foto: ${slot.label}`}
                      style={styles.pickButton}>
                      <MaterialIcons
                        name="photo-camera"
                        size={18}
                        color={colors.primaryBlack}
                      />
                      <Text style={styles.pickText}>Câmera</Text>
                    </Pressable>
                  ) : null}
                </View>
              </View>
              {picked[slot.kind] ? (
                <Image
                  source={{ uri: picked[slot.kind] }}
                  style={styles.preview}
                  accessibilityLabel={`Prévia: ${slot.label}`}
                />
              ) : (
                <View style={[styles.preview, styles.previewEmpty]} />
              )}
            </View>
          ))}

          {error ? <InlineAlert type="error">{error}</InlineAlert> : null}
          <ActionButton
            label="Enviar para análise"
            icon="upload"
            onPress={send}
            loading={busy}
            block
          />
        </View>
      ) : null}

      {identity?.status === 'rejected' && !resending ? (
        <ActionButton
          label="Enviar novamente"
          variant="secondary"
          onPress={() => setResending(true)}
        />
      ) : null}
    </ProfileCard>
  );
}

export default IdentityCard;
