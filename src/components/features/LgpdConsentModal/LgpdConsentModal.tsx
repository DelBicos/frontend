import React, { useMemo, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useColors } from '@theme/ThemeProvider';
import { errorMessage } from '@utils/errors';
import { createStyles } from './styles';

interface LgpdConsentModalProps {
  visible: boolean;
  onClose: () => void;
  onAccept: () => Promise<void>;
  onDecline?: () => void;
}

export const LgpdConsentModal: React.FC<LgpdConsentModalProps> = ({
  visible,
  onClose,
  onAccept,
  onDecline,
}) => {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [loading, setLoading] = useState(false);

  const handleAcceptConsent = async () => {
    try {
      setLoading(true);
      await onAccept();
      setLoading(false);
      onClose();
    } catch (error) {
      setLoading(false);
      Alert.alert(
        'Erro',
        errorMessage(
          error,
          'Não foi possível registrar o consentimento. Tente novamente.',
        ),
      );
    }
  };

  const handleDeclineConsent = () => {
    if (onDecline) {
      onDecline();
    } else {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconBadge}>
              <FontAwesome name="shield" size={24} color={colors.primaryBlue} />
            </View>
            <Text style={styles.title}>Termo de Consentimento LGPD</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              disabled={loading}>
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Subtitle / Badge */}
          <View style={styles.subtitleBadge}>
            <Ionicons
              name="location-sharp"
              size={14}
              color={colors.primaryBlue}
            />
            <Text style={styles.subtitleText}>
              Uso de Geolocalização em Tempo Real
            </Text>
          </View>

          {/* Terms Content */}
          <ScrollView
            style={styles.scrollArea}
            showsVerticalScrollIndicator={true}>
            <Text style={styles.paragraph}>
              Para garantir a segurança e a precisão no atendimento dos seus
              agendamentos, o aplicativo{' '}
              <Text style={styles.boldText}>DelBicos</Text> solicita o seu
              consentimento para acessar e transmitir os seus dados de
              geolocalização (GPS) em tempo real.
            </Text>

            <View style={styles.bulletBox}>
              <View style={styles.bulletRow}>
                <Ionicons
                  name="lock-closed"
                  size={16}
                  color={colors.primaryBlue}
                  style={styles.bulletIcon}
                />
                <Text style={styles.bulletText}>
                  <Text style={styles.boldText}>
                    Uso Estrito no Deslocamento:
                  </Text>{' '}
                  A sua localização será compartilhada com o cliente apenas
                  enquanto o status do serviço for &quot;Estou a Caminho&quot;.
                </Text>
              </View>

              <View style={styles.bulletRow}>
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={colors.primaryGreen}
                  style={styles.bulletIcon}
                />
                <Text style={styles.bulletText}>
                  <Text style={styles.boldText}>Encerramento Automático:</Text>{' '}
                  A transmissão do GPS é completamente interrompida no momento
                  em que você registra &quot;Cheguei no Local&quot;.
                </Text>
              </View>

              <View style={styles.bulletRow}>
                <Ionicons
                  name="shield-checkmark"
                  size={16}
                  color={colors.primaryRed}
                  style={styles.bulletIcon}
                />
                <Text style={styles.bulletText}>
                  <Text style={styles.boldText}>Proteção & Privacidade:</Text>{' '}
                  Seus dados são criptografados durante o envio e jamais serão
                  vendidos ou compartilhados com terceiros.
                </Text>
              </View>
            </View>

            <Text style={styles.legalNotice}>
              Conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018),
              você possui o direito de aceitar ou revogar este consentimento a
              qualquer momento na aba de Configurações / Perfil da sua conta.
            </Text>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.btnAccept, loading && styles.btnDisabled]}
              onPress={handleAcceptConsent}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color={colors.textOnImage} size="small" />
              ) : (
                <Text style={styles.btnAcceptText}>Aceitar e Continuar</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnDecline}
              onPress={handleDeclineConsent}
              disabled={loading}>
              <Text style={styles.btnDeclineText}>Recusar / Agora Não</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
