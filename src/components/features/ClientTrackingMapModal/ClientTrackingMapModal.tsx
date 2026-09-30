import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { useColors } from '@theme/ThemeProvider';
import { Appointment } from '@stores/Appointment/types';
import { useLocationSocket, LocationUpdateEvent } from '@hooks/useLocationSocket';

interface ClientTrackingMapModalProps {
  visible: boolean;
  onClose: () => void;
  appointment: Appointment | null;
}

const GOOGLE_MAPS_API_KEY = 'AIzaSyCtayctpZpx9eot7Iv3t2-TYkrUlZbEnpo';

function calculateDistanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const radLat1 = (lat1 * Math.PI) / 180;
  const radLat2 = (lat2 * Math.PI) / 180;
  const deltaLat = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(radLat1) * Math.cos(radLat2) *
    Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

export const ClientTrackingMapModal: React.FC<ClientTrackingMapModalProps> = ({
  visible,
  onClose,
  appointment,
}) => {
  const colors = useColors();
  const [profCoords, setProfCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [liveStatus, setLiveStatus] = useState<string>(appointment?.status || 'in_transit');
  const [mapLoading, setMapLoading] = useState<boolean>(true);

  // Socket escutando atualizações de geolocalização a cada 5 segundos
  useLocationSocket(appointment?.id, (event: LocationUpdateEvent) => {
    if (event.latitude && event.longitude) {
      setProfCoords({ latitude: event.latitude, longitude: event.longitude });
    }
  });

  useEffect(() => {
    if (appointment?.status) {
      setLiveStatus(appointment.status);
    }
  }, [appointment?.status]);

  if (!appointment) return null;

  const destLat = Number(appointment.Address?.lat) || -23.55052;
  const destLng = Number(appointment.Address?.lng) || -46.633308;

  const currentProfLat = profCoords?.latitude || destLat - 0.005;
  const currentProfLng = profCoords?.longitude || destLng - 0.005;

  const distanceMeters = calculateDistanceInMeters(currentProfLat, currentProfLng, destLat, destLng);
  const distanceFormatted =
    distanceMeters < 1000
      ? `${distanceMeters} metros da sua casa`
      : `${(distanceMeters / 1000).toFixed(1)} km da sua casa`;

  const estimatedMinutes = Math.max(1, Math.ceil(distanceMeters / 300));

  const centerLat = (destLat + currentProfLat) / 2;
  const centerLng = (destLng + currentProfLng) / 2;

  // URL Oficial da API do Google Maps Static Maps
  const googleMapImageUrl =
    `https://maps.googleapis.com/maps/api/staticmap?center=${centerLat},${centerLng}&zoom=15&size=650x650&scale=2&maptype=roadmap` +
    `&markers=color:0x2563EB%7Clabel:H%7C${destLat},${destLng}` +
    `&markers=color:0xFF6B00%7Clabel:C%7C${currentProfLat},${currentProfLng}` +
    `&key=${GOOGLE_MAPS_API_KEY}`;

  const handleCallProf = () => {
    const phone = appointment.Professional?.User?.phone;
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Top Bar Header */}
        <View style={[styles.header, { backgroundColor: colors.primaryWhite }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.primaryBlack} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Acompanhamento em Tempo Real</Text>
            <Text style={styles.headerSubtitle}>
              {liveStatus === 'in_transit'
                ? '🚘 Transmitindo localização a cada 5s'
                : liveStatus === 'arrived'
                ? '🎯 Prestador no local (Rastreamento encerrado)'
                : '⚡ Atendimento em andamento'}
            </Text>
          </View>
        </View>

        {/* Área Visual do Mapa Oficial Google Maps */}
        <View style={styles.mapContainer}>
          {/* Imagem Oficial do Google Maps da sua região */}
          <Image
            source={{ uri: googleMapImageUrl }}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
            onLoadStart={() => setMapLoading(true)}
            onLoadEnd={() => setMapLoading(false)}
          />

          {mapLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#FF6B00" />
              <Text style={styles.loadingText}>Carregando Google Maps...</Text>
            </View>
          )}

          {/* Card Superior Overlay: Ponto de Referência Casa do Usuário */}
          <View style={styles.houseCardOverlay}>
            <View style={styles.houseIconBadge}>
              <FontAwesome name="home" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.houseTextInfo}>
              <Text style={styles.houseTitle}>Sua Casa (Ponto de Destino)</Text>
              <Text style={styles.houseAddress} numberOfLines={1}>
                {appointment.Address?.street || 'Endereço'}, {appointment.Address?.number || ''}
              </Text>
            </View>
          </View>

          {/* Badge Flutuante de Distância em Tempo Real */}
          <View style={styles.distanceBadgeOverlay}>
            <View style={styles.distanceBadgeRow}>
              <FontAwesome5 name="car" size={16} color="#FF6B00" />
              <Text style={styles.distanceBadgeText}>
                Distância: <Text style={{ color: '#FF6B00', fontWeight: '800' }}>{distanceFormatted}</Text>
              </Text>
            </View>
            <Text style={styles.etaText}>
              Tempo estimado de chegada: <Text style={{ color: '#22C55E', fontWeight: '800' }}>~{estimatedMinutes} min</Text>
            </Text>
          </View>

          {/* Barra de Coordenadas GPS Ao Vivo */}
          <View style={styles.gpsCoordsBarOverlay}>
            <View style={styles.liveDot} />
            <Text style={styles.gpsCoordsText}>
              GPS Ao Vivo: Lat {currentProfLat.toFixed(5)} | Lng {currentProfLng.toFixed(5)} (Atualizado a cada 5s)
            </Text>
          </View>
        </View>

        {/* Card Inferior Bottom Sheet */}
        <View style={styles.bottomCard}>
          <View style={styles.dragHandle} />

          <View style={[styles.statusBanner, { backgroundColor: liveStatus === 'arrived' ? '#16A34A' : '#FF6B00' }]}>
            <FontAwesome
              name={liveStatus === 'arrived' ? 'check-circle' : 'car'}
              size={18}
              color="#FFFFFF"
            />
            <Text style={styles.statusBannerText}>
              {liveStatus === 'in_transit'
                ? 'Profissional a caminho do seu endereço'
                : liveStatus === 'arrived'
                ? 'Profissional chegou na sua casa! 🎯'
                : 'Serviço em andamento ⚡'}
            </Text>
          </View>

          {/* Caixa do Código de Segurança de 4 dígitos */}
          {appointment.verification_code || liveStatus === 'arrived' ? (
            <View style={styles.pinBox}>
              <Text style={styles.pinBoxTitle}>CÓDIGO DE INÍCIO DO SERVIÇO 🔑</Text>
              <Text style={styles.pinBoxCode}>{appointment.verification_code || '----'}</Text>
              <Text style={styles.pinBoxSub}>Informe este código ao profissional ao recebê-lo em casa</Text>
            </View>
          ) : null}

          {/* Dados do Prestador */}
          <View style={styles.profRow}>
            <View style={styles.profInfo}>
              <Text style={styles.profName}>{appointment.Professional?.User?.name || 'Prestador'}</Text>
              <Text style={styles.serviceTitle}>{appointment.Service?.title || 'Serviço Agendado'}</Text>
            </View>
            {appointment.Professional?.User?.phone ? (
              <TouchableOpacity style={styles.callBtn} onPress={handleCallProf} activeOpacity={0.8}>
                <Ionicons name="call" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            ) : null}
          </View>

          <TouchableOpacity style={styles.backBtn} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.backBtnText}>Fechar Acompanhamento</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    elevation: 3,
    zIndex: 10,
  },
  closeBtn: {
    padding: 8,
    marginRight: 10,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '600',
    marginTop: 2,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 4,
  },
  loadingText: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 10,
  },
  houseCardOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(30, 41, 59, 0.94)',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    elevation: 5,
    zIndex: 5,
  },
  houseIconBadge: {
    backgroundColor: '#2563EB',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  houseTextInfo: {
    flex: 1,
  },
  houseTitle: {
    color: '#F8FAFC',
    fontWeight: '700',
    fontSize: 14,
  },
  houseAddress: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  distanceBadgeOverlay: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.94)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FF6B00',
    elevation: 8,
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    zIndex: 5,
  },
  distanceBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  distanceBadgeText: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
  },
  etaText: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 4,
  },
  gpsCoordsBarOverlay: {
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.90)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 8,
    zIndex: 5,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
  },
  gpsCoordsText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '500',
  },
  bottomCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  dragHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#CBD5E1',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 14,
    gap: 8,
  },
  statusBannerText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  pinBox: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FF6B00',
    borderWidth: 2,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    marginBottom: 14,
  },
  pinBoxTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#EA580C',
  },
  pinBoxCode: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FF6B00',
    letterSpacing: 6,
    marginVertical: 4,
  },
  pinBoxSub: {
    fontSize: 11,
    color: '#C2410C',
  },
  profRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  profInfo: {
    flex: 1,
  },
  profName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  serviceTitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  callBtn: {
    backgroundColor: '#16A34A',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtn: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  backBtnText: {
    color: '#334155',
    fontWeight: '700',
    fontSize: 14,
  },
});

