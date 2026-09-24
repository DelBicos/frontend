import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { openGoogleMaps, openWaze } from '@utils/mapsHelper';
import { backendHttpClient } from '@lib/helpers/httpClient';

export interface DeslocamentoParams {
  appointmentId: number | string;
  serviceTitle: string;
  clientName: string;
  clientPhone?: string;
  address: string;
  startTime: string;
  status?: string;
}

export const DeslocamentoScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const params = (route.params || {}) as DeslocamentoParams;

  const [inTransit, setInTransit] = useState(params.status === 'in_transit');
  const [loading, setLoading] = useState(false);

  const handleEstouACaminho = async () => {
    setLoading(true);
    try {
      await backendHttpClient.post(`/api/appointments/${params.appointmentId}/in-transit`);
      setInTransit(true);
      Alert.alert(
        '🚗 Você está a caminho!',
        'O cliente foi notificado em tempo real que você iniciou o deslocamento.',
      );
    } catch (error: any) {
      console.error('Erro ao marcar a caminho:', error);
      Alert.alert(
        'Atenção',
        error?.response?.data?.error || 'Não foi possível notificar o cliente.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCallClient = () => {
    if (params.clientPhone) {
      Linking.openURL(`tel:${params.clientPhone}`);
    } else {
      Alert.alert('Info', 'Telefone do cliente não disponível.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Deslocamento para Serviço</Text>
      </View>

      {/* Status Banner */}
      <View style={[styles.statusBanner, inTransit && styles.statusBannerActive]}>
        <Text style={styles.statusText}>
          {inTransit
            ? '🚗 Status: VOCÊ ESTÁ A CAMINHO'
            : '⏰ Serviço agendado para hoje'}
        </Text>
      </View>

      {/* Card do Serviço */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🛠️ Serviço</Text>
        <Text style={styles.cardValue}>{params.serviceTitle || 'Serviço Agendado'}</Text>
        <Text style={styles.cardSub}>Horário: {params.startTime || 'Hoje'}</Text>
      </View>

      {/* Card do Cliente */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>👤 Cliente</Text>
        <Text style={styles.cardValue}>{params.clientName || 'Cliente DelBicos'}</Text>
        {!!params.clientPhone && (
          <TouchableOpacity onPress={handleCallClient} style={styles.phoneButton}>
            <Text style={styles.phoneText}>📞 Ligue para o cliente: {params.clientPhone}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Card do Endereço */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📍 Endereço de Atendimento</Text>
        <Text style={styles.cardAddress}>{params.address || 'Endereço cadastrado no agendamento'}</Text>
      </View>

      {/* Botão Estou a Caminho */}
      {!inTransit ? (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleEstouACaminho}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.actionButtonText}>Estou a Caminho 🚗</Text>
          )}
        </TouchableOpacity>
      ) : (
        <View style={styles.inTransitConfirmed}>
          <Text style={styles.inTransitText}>✅ Cliente Notificado!</Text>
        </View>
      )}

      {/* Seção de GPS e Navegação Externa */}
      <View style={styles.navigationSection}>
        <Text style={styles.sectionTitle}>🗺️ Abrir Rota de Navegação GPS</Text>
        <Text style={styles.sectionSub}>Escolha o seu aplicativo de mapas preferido:</Text>

        <View style={styles.mapsButtonsRow}>
          <TouchableOpacity
            style={[styles.mapButton, styles.googleButton]}
            onPress={() => openGoogleMaps(params.address)}
          >
            <Text style={styles.mapButtonText}>📍 Google Maps</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.mapButton, styles.wazeButton]}
            onPress={() => openWaze(params.address)}
          >
            <Text style={styles.mapButtonText}>🚙 Waze</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  backButton: {
    marginBottom: 8,
  },
  backText: {
    fontSize: 16,
    color: '#0284C7',
    fontWeight: '600',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
  },
  statusBanner: {
    backgroundColor: '#E2E8F0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  statusBannerActive: {
    backgroundColor: '#DCFCE7',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#166534',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  cardValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  cardSub: {
    fontSize: 14,
    color: '#475569',
    marginTop: 4,
  },
  cardAddress: {
    fontSize: 15,
    color: '#334155',
    lineHeight: 22,
  },
  phoneButton: {
    marginTop: 8,
    backgroundColor: '#EFF6FF',
    padding: 8,
    borderRadius: 6,
  },
  phoneText: {
    color: '#2563EB',
    fontWeight: '600',
    fontSize: 14,
  },
  actionButton: {
    backgroundColor: '#16A34A',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  inTransitConfirmed: {
    backgroundColor: '#DCFCE7',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  inTransitText: {
    color: '#15803D',
    fontSize: 16,
    fontWeight: '700',
  },
  navigationSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  sectionSub: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 16,
  },
  mapsButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  mapButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  googleButton: {
    backgroundColor: '#EA4335',
  },
  wazeButton: {
    backgroundColor: '#33CCFF',
  },
  mapButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});

export default DeslocamentoScreen;
