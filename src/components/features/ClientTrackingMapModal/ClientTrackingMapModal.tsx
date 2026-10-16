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
  ScrollView,
} from 'react-native';
import { Ionicons, FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { useColors } from '@theme/ThemeProvider';
import { Appointment } from '@stores/Appointment/types';
import {
  useLocationSocket,
  LocationUpdateEvent,
  ProximityWarningEvent,
  LocationArrivedEvent,
} from '@hooks/useLocationSocket';
import { styles } from './styles';

interface ClientTrackingMapModalProps {
  visible: boolean;
  onClose: () => void;
  appointment: Appointment | null;
}

const GOOGLE_MAPS_API_KEY =
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ||
  'AIzaSyCtayctpZpx9eot7Iv3t2-TYkrUlZbEnpo';

function calculateDistanceInMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371000;
  const radLat1 = (lat1 * Math.PI) / 180;
  const radLat2 = (lat2 * Math.PI) / 180;
  const deltaLat = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(radLat1) *
      Math.cos(radLat2) *
      Math.sin(deltaLon / 2) *
      Math.sin(deltaLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

export const ClientTrackingMapModal: React.FC<ClientTrackingMapModalProps> = ({
  visible,
  onClose,
  appointment,
}) => {
  const colors = useColors();
  const [profCoords, setProfCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [liveStatus, setLiveStatus] = useState<string>(
    appointment?.status || 'in_transit',
  );
  const [mapLoading, setMapLoading] = useState<boolean>(true);
  const [proximityAlert, setProximityAlert] = useState<string | null>(null);

  // Socket escutando atualizações de geolocalização a cada 5 segundos, alertas de 5 min e evento de chegada
  useLocationSocket(
    appointment?.numeric_id || appointment?.id,
    (event: LocationUpdateEvent) => {
      if (event.latitude && event.longitude) {
        setProfCoords({ latitude: event.latitude, longitude: event.longitude });
      }
    },
    (event: ProximityWarningEvent) => {
      setProximityAlert(
        event.message || '🚘 Prestador a cerca de 5 minutos da sua casa!',
      );
    },
    (event: LocationArrivedEvent) => {
      setLiveStatus('arrived');
    },
  );

  useEffect(() => {
    if (appointment?.status) {
      setLiveStatus(appointment.status);
    }
  }, [appointment?.status]);

  if (!appointment) return null;

  const destLat = Number(appointment.Address?.lat) || -23.55052;
  const destLng = Number(appointment.Address?.lng) || -46.633308;

  const hasLiveCoords =
    profCoords !== null &&
    profCoords.latitude != null &&
    profCoords.longitude != null;
  const currentProfLat = hasLiveCoords ? profCoords.latitude : destLat;
  const currentProfLng = hasLiveCoords ? profCoords.longitude : destLng;

  const distanceMeters = hasLiveCoords
    ? calculateDistanceInMeters(
        currentProfLat,
        currentProfLng,
        destLat,
        destLng,
      )
    : 0;
  const distanceFormatted =
    distanceMeters < 1000
      ? `${distanceMeters} metros da sua casa`
      : `${(distanceMeters / 1000).toFixed(1)} km da sua casa`;

  const estimatedMinutes = Math.max(1, Math.ceil(distanceMeters / 300));

  const centerLat = hasLiveCoords ? (destLat + currentProfLat) / 2 : destLat;
  const centerLng = hasLiveCoords ? (destLng + currentProfLng) / 2 : destLng;

  const markersParam = hasLiveCoords
    ? `&markers=color:0x2563EB%7Clabel:H%7C${destLat},${destLng}&markers=color:0xFF6B00%7Clabel:C%7C${currentProfLat},${currentProfLng}`
    : `&markers=color:0x2563EB%7Clabel:H%7C${destLat},${destLng}`;

  // URL Oficial da API do Google Maps Static Maps
  const googleMapImageUrl =
    `https://maps.googleapis.com/maps/api/staticmap?center=${centerLat},${centerLng}&zoom=15&size=650x650&scale=2&maptype=roadmap` +
    markersParam +
    `&key=${GOOGLE_MAPS_API_KEY}`;

  const handleCallProf = () => {
    const phone = appointment.Professional?.User?.phone;
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}>
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
                ? hasLiveCoords
                  ? '🚘 Transmitindo localização a cada 5s'
                  : '⏳ Aguardando localização do prestador...'
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

          {/* Banner de Alerta de Proximidade (5 Minutos para Chegar) */}
          {(proximityAlert ||
            (hasLiveCoords &&
              estimatedMinutes <= 5 &&
              liveStatus === 'in_transit')) && (
            <View style={styles.proximityBannerOverlay}>
              <Ionicons name="notifications" size={18} color="#FFFFFF" />
              <Text style={styles.proximityBannerText}>
                {proximityAlert ||
                  '🚘 Prestador a cerca de 5 minutos da sua casa!'}
              </Text>
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
                {appointment.Address?.street || 'Endereço'},{' '}
                {appointment.Address?.number || ''}
              </Text>
            </View>
          </View>

          {/* Badge Flutuante no Mapa */}
          {liveStatus === 'arrived' ? (
            <View
              style={[
                styles.distanceBadgeOverlay,
                styles.arrivedBadgeOverlay,
              ]}>
              <View style={styles.distanceBadgeRow}>
                <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                <Text
                  style={[
                    styles.distanceBadgeText,
                    { color: '#FFFFFF', fontWeight: '800' },
                  ]}>
                  Prestador no local!
                </Text>
              </View>
            </View>
          ) : (
            <>
              {/* Badge Flutuante de Distância em Tempo Real */}
              <View style={styles.distanceBadgeOverlay}>
                {hasLiveCoords ? (
                  <>
                    <View style={styles.distanceBadgeRow}>
                      <FontAwesome5 name="car" size={16} color="#FF6B00" />
                      <Text style={styles.distanceBadgeText}>
                        Distância:{' '}
                        <Text style={{ color: '#FF6B00', fontWeight: '800' }}>
                          {distanceFormatted}
                        </Text>
                      </Text>
                    </View>
                    <Text style={styles.etaText}>
                      Tempo estimado de chegada:{' '}
                      <Text style={{ color: '#22C55E', fontWeight: '800' }}>
                        ~{estimatedMinutes} min
                      </Text>
                    </Text>
                  </>
                ) : (
                  <View style={styles.distanceBadgeRow}>
                    <Ionicons name="time-outline" size={18} color="#FF6B00" />
                    <Text style={styles.distanceBadgeText}>
                      Aguardando sinal GPS do prestador...
                    </Text>
                  </View>
                )}
              </View>

              {/* Barra de Coordenadas GPS Ao Vivo */}
              <View style={styles.gpsCoordsBarOverlay}>
                <View
                  style={[
                    styles.liveDot,
                    !hasLiveCoords && { backgroundColor: '#EAB308' },
                  ]}
                />
                <Text style={styles.gpsCoordsText}>
                  {hasLiveCoords
                    ? `GPS Ao Vivo: Lat ${currentProfLat.toFixed(5)} | Lng ${currentProfLng.toFixed(5)} (Atualizado a cada 5s)`
                    : 'GPS em espera: Aguardando prestador iniciar rota'}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Card Inferior Bottom Sheet */}
        <View style={styles.bottomCard}>
          <View style={styles.dragHandle} />

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.bottomScrollContent}>
            <View
              style={[
                styles.statusBanner,
                {
                  backgroundColor:
                    liveStatus === 'arrived' ? '#16A34A' : '#FF6B00',
                },
              ]}>
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

            {/* Caixa do Código de Confirmação */}
            {appointment.verification_code || liveStatus === 'arrived' ? (
              <View style={styles.pinBox}>
                <View style={styles.pinBoxHeaderRow}>
                  <Ionicons name="key" size={16} color="#EA580C" />
                  <Text style={styles.pinBoxTitle}>
                    CÓDIGO DE CONFIRMAÇÃO DO SERVIÇO
                  </Text>
                </View>
                <View style={styles.pinBoxCodeBadge}>
                  <Text style={styles.pinBoxCode}>
                    {appointment.verification_code || '----'}
                  </Text>
                </View>
                <Text style={styles.pinBoxSub}>
                  Informe este código ao profissional para validação do
                  atendimento
                </Text>
              </View>
            ) : null}

            {/* Dados do Prestador */}
            <View style={styles.profRow}>
              <View style={styles.profInfo}>
                <Text style={styles.profName}>
                  {appointment.Professional?.User?.name || 'Prestador'}
                </Text>
                <Text style={styles.serviceTitle}>
                  {appointment.Service?.title || 'Serviço Agendado'}
                </Text>
              </View>
              {appointment.Professional?.User?.phone ? (
                <TouchableOpacity
                  style={styles.callBtn}
                  onPress={handleCallProf}
                  activeOpacity={0.8}>
                  <Ionicons name="call" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              ) : null}
            </View>

            <TouchableOpacity
              style={styles.backBtn}
              onPress={onClose}
              activeOpacity={0.8}>
              <Text style={styles.backBtnText}>Fechar Acompanhamento</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};


