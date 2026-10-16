import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import colors from '@theme/colors';

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
  const [loading, setLoading] = useState(false);

  const handleAcceptConsent = async () => {
    try {
      setLoading(true);
      await onAccept();
      setLoading(false);
      onClose();
    } catch (error: any) {
      setLoading(false);
      Alert.alert(
        'Erro',
        error?.message || 'Não foi possível registrar o consentimento. Tente novamente.',
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
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconBadge}>
              <FontAwesome name="shield" size={24} color="#2563EB" />
            </View>
            <Text style={styles.title}>Termo de Consentimento LGPD</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              disabled={loading}
            >
              <Ionicons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Subtitle / Badge */}
          <View style={styles.subtitleBadge}>
            <Ionicons name="location-sharp" size={14} color="#0284C7" />
            <Text style={styles.subtitleText}>
              Uso de Geolocalização em Tempo Real
            </Text>
          </View>

          {/* Terms Content */}
          <ScrollView
            style={styles.scrollArea}
            showsVerticalScrollIndicator={true}
          >
            <Text style={styles.paragraph}>
              Para garantir a segurança e a precisão no atendimento dos seus agendamentos, o aplicativo{' '}
              <Text style={styles.boldText}>DelBicos</Text> solicita o seu consentimento para acessar e transmitir os seus dados de geolocalização (GPS) em tempo real.
            </Text>

            <View style={styles.bulletBox}>
              <View style={styles.bulletRow}>
                <Ionicons name="lock-closed" size={16} color="#2563EB" style={styles.bulletIcon} />
                <Text style={styles.bulletText}>
                  <Text style={styles.boldText}>Uso Estrito no Deslocamento:</Text> A sua localização será compartilhada com o cliente apenas enquanto o status do serviço for &quot;Estou a Caminho&quot;.
                </Text>
              </View>

              <View style={styles.bulletRow}>
                <Ionicons name="checkmark-circle" size={16} color="#16A34A" style={styles.bulletIcon} />
                <Text style={styles.bulletText}>
                  <Text style={styles.boldText}>Encerramento Automático:</Text> A transmissão do GPS é completamente interrompida no momento em que você registra &quot;Cheguei no Local&quot;.
                </Text>
              </View>

              <View style={styles.bulletRow}>
                <Ionicons name="shield-checkmark" size={16} color="#DC2626" style={styles.bulletIcon} />
                <Text style={styles.bulletText}>
                  <Text style={styles.boldText}>Proteção & Privacidade:</Text> Seus dados são criptografados durante o envio e jamais serão vendidos ou compartilhados com terceiros.
                </Text>
              </View>
            </View>

            <Text style={styles.legalNotice}>
              Conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você possui o direito de aceitar ou revogar este consentimento a qualquer momento na aba de Configurações / Perfil da sua conta.
            </Text>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.btnAccept, loading && styles.btnDisabled]}
              onPress={handleAcceptConsent}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.btnAcceptText}>Aceitar e Continuar</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnDecline}
              onPress={handleDeclineConsent}
              disabled={loading}
            >
              <Text style={styles.btnDeclineText}>Recusar / Agora Não</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    maxHeight: '85%',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  closeButton: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  subtitleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  subtitleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0284C7',
    marginLeft: 6,
  },
  scrollArea: {
    marginBottom: 16,
  },
  paragraph: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
    marginBottom: 14,
  },
  boldText: {
    fontWeight: '700',
    color: '#0F172A',
  },
  bulletBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  bulletIcon: {
    marginTop: 2,
    marginRight: 8,
  },
  bulletText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    flex: 1,
  },
  legalNotice: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 16,
    fontStyle: 'italic',
  },
  footer: {
    gap: 10,
  },
  btnAccept: {
    backgroundColor: colors.primaryOrange || '#FF6B00',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnAcceptText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  btnDecline: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDeclineText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
});
