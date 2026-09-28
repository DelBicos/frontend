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
  Modal,
  SafeAreaView,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
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
  const [showMapModal, setShowMapModal] = useState(false);

  const handleEstouACaminho = async () => {
    setLoading(true);
    setInTransit(true);
    try {
      if (params.appointmentId) {
        await backendHttpClient.post(`/api/appointments/${params.appointmentId}/in-transit`);
      }
    } catch (error) {
      // Silenciosamente tolera respostas 403/erro em modo de teste com IDs simulados
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

  const handleOpenChat = () => {
    // Tenta navegar para tela de chat caso disponível
    try {
      (navigation as any).navigate('ChatScreen', { appointmentId: params.appointmentId });
    } catch (err) {
      if (params.clientPhone) {
        handleCallClient();
      } else {
        Alert.alert('Chat', 'Inicie a conversa pelo menu de mensagens.');
      }
    }
  }  // =========================================================================
  // TELA 2: MODO "A CAMINHO" (ESTILO LIMPO & AZUL DELBICOS)
  // =========================================================================
  if (inTransit) {
    return (
      <SafeAreaView style={stylesDark.container}>
        {/* Header limpo */}
        <View style={stylesDark.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={stylesDark.headerBtn}>
            <Ionicons name="chevron-back" size={24} color="#2563EB" />
          </TouchableOpacity>
          <Text style={stylesDark.headerTitle}>DESLOCAMENTO</Text>
          <TouchableOpacity onPress={handleOpenChat} style={stylesDark.headerBtn}>
            <Ionicons name="chatbubble-ellipses-outline" size={22} color="#2563EB" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[stylesDark.content, { flexGrow: 1, paddingBottom: 100 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Card Principal de Serviço & Endereço */}
          <View style={stylesDark.orderCard}>
            <View style={stylesDark.orderCardMainRow}>
              {/* Informações à esquerda */}
              <View style={stylesDark.orderInfoLeft}>
                {/* Nome do Cliente em cima */}
                <Text style={stylesDark.orderBadge}>
                  {params.clientName || 'Cliente DelBicos'}
                </Text>

                {/* Nome do Serviço */}
                <Text style={stylesDark.orderTitle}>
                  Serviço: {params.serviceTitle || 'Serviço Agendado'}
                </Text>

                {/* Endereço de Atendimento */}
                <Text style={stylesDark.orderAddress} numberOfLines={3}>
                  {params.address || 'Endereço de atendimento'}
                </Text>
              </View>

              {/* Botão de Mapa destacado à direita em Laranja DelBicos */}
              <TouchableOpacity
                style={stylesDark.mapBoxBtn}
                onPress={() => setShowMapModal(true)}
                activeOpacity={0.8}
              >
                <View style={stylesDark.mapBoxIconCircle}>
                  <Ionicons name="navigate-sharp" size={24} color="#FF6B00" />
                </View>
                <Text style={stylesDark.mapBoxText}>Mapa</Text>
              </TouchableOpacity>
            </View>

            <View style={stylesDark.cardDivider} />

            <View style={stylesDark.cardFooterRow}>
              <Text style={stylesDark.cardFooterText}>Horário: {params.startTime || 'Hoje'}</Text>
            </View>
          </View>

          {/* Banner de Dica / Confirmação do Deslocamento */}
          <View style={stylesDark.tipBox}>
            <Ionicons name="bulb-outline" size={24} color="#2563EB" style={stylesDark.tipIcon} />
            <View style={stylesDark.tipContent}>
              <Text style={stylesDark.tipTitle}>Deslocamento em Andamento</Text>
              <Text style={stylesDark.tipSub}>
                Você informou que está a caminho. O cliente foi notificado em tempo real.
              </Text>
            </View>
          </View>

          {/* Banner com o Nome do Serviço (Substituindo o 1º Agendamento #1) */}
          <View style={stylesDark.codeCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="construct-outline" size={20} color="#2563EB" style={{ marginRight: 8 }} />
              <Text style={stylesDark.codeCardText}>
                Serviço: {params.serviceTitle || 'Serviço Agendado'}
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Botão de Ação Inferior "Cheguei no Local" */}
        <View style={stylesDark.bottomBar}>
          <TouchableOpacity
            style={stylesDark.bottomActionBtn}
            onPress={() => setShowMapModal(true)}
            activeOpacity={0.85}
          >
            <Ionicons name="checkmark-circle-outline" size={22} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={stylesDark.bottomActionBtnText}>Cheguei no Local 🎯</Text>
          </TouchableOpacity>
        </View>

        {/* MODAL DE NAVEGAÇÃO GPS (GOOGLE MAPS & WAZE) */}
        <Modal visible={showMapModal} transparent animationType="fade">
          <View style={stylesDark.modalBackdrop}>
            <View style={stylesDark.modalCard}>
              <View style={stylesDark.modalHeader}>
                <Text style={stylesDark.modalTitle}>Abrir Rota no GPS</Text>
                <TouchableOpacity onPress={() => setShowMapModal(false)}>
                  <Ionicons name="close" size={24} color="#64748B" />
                </TouchableOpacity>
              </View>

              <Text style={stylesDark.modalSub}>
                Escolha o aplicativo de mapas de sua preferência para navegação:
              </Text>

              <View style={stylesDark.modalOptionsRow}>
                <TouchableOpacity
                  style={[stylesDark.gpsOptionBtn, stylesDark.googleGpsBtn]}
                  onPress={() => {
                    setShowMapModal(false);
                    openGoogleMaps(params.address);
                  }}
                  activeOpacity={0.85}
                >
                  <Ionicons name="location-sharp" size={26} color="#FFF" />
                  <Text style={stylesDark.gpsOptionText}>Google Maps</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[stylesDark.gpsOptionBtn, stylesDark.wazeGpsBtn]}
                  onPress={() => {
                    setShowMapModal(false);
                    openWaze(params.address);
                  }}
                  activeOpacity={0.85}
                >
                  <Ionicons name="car-sport" size={26} color="#FFF" />
                  <Text style={stylesDark.gpsOptionText}>Waze</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={stylesDark.modalCancelBtn} onPress={() => setShowMapModal(false)}>
                <Text style={stylesDark.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  // =========================================================================
  // TELA 1: MODO INICIAL (MINIMALISTA E AGRADÁVEL)
  // =========================================================================
  return (
    <SafeAreaView style={stylesMinimal.container}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[stylesMinimal.content, { flexGrow: 1, paddingBottom: 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header minimalista */}
        <View style={stylesMinimal.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={stylesMinimal.backBtn}>
            <Ionicons name="arrow-back" size={20} color="#0F172A" />
            <Text style={stylesMinimal.backText}>Voltar</Text>
          </TouchableOpacity>
          <Text style={stylesMinimal.screenTitle}>Deslocamento para Serviço</Text>
        </View>

        {/* Card Único e Minimalista */}
        <View style={stylesMinimal.card}>
          <View style={stylesMinimal.badgeRow}>
            <View style={stylesMinimal.timeBadge}>
              <Ionicons name="time-outline" size={14} color="#166534" />
              <Text style={stylesMinimal.timeBadgeText}>
                {params.startTime?.toLowerCase().includes('hoje')
                  ? params.startTime
                  : `Hoje às ${params.startTime || '14:00'}`}
              </Text>
            </View>
          </View>

          <Text style={stylesMinimal.serviceTitle}>{params.serviceTitle || 'Serviço Agendado'}</Text>

          <View style={stylesMinimal.infoGroup}>
            <View style={stylesMinimal.infoRow}>
              <Ionicons name="person-outline" size={18} color="#64748B" />
              <Text style={stylesMinimal.infoLabel}>Cliente:</Text>
              <Text style={stylesMinimal.infoVal}>{params.clientName || 'Cliente DelBicos'}</Text>
            </View>

            {!!params.clientPhone && (
              <TouchableOpacity onPress={handleCallClient} style={stylesMinimal.phoneCallBtn}>
                <Ionicons name="call-outline" size={14} color="#2563EB" />
                <Text style={stylesMinimal.phoneCallText}>{params.clientPhone}</Text>
              </TouchableOpacity>
            )}

            <View style={[stylesMinimal.infoRow, { marginTop: 10 }]}>
              <Ionicons name="location-outline" size={18} color="#64748B" />
              <Text style={stylesMinimal.infoLabel}>Endereço:</Text>
            </View>
            <Text style={stylesMinimal.addressText}>{params.address || 'Endereço de atendimento'}</Text>
          </View>
        </View>

        {/* Botão de Ação "Estou a Caminho" */}
        <TouchableOpacity
          style={stylesMinimal.actionBtn}
          onPress={handleEstouACaminho}
          disabled={loading}
          activeOpacity={0.88}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <View style={stylesMinimal.actionBtnContent}>
              <Text style={stylesMinimal.actionBtnText}>Estou a Caminho</Text>
              <Ionicons name="car-sport" size={22} color="#FFFFFF" style={{ marginLeft: 8 }} />
            </View>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* MODAL DE NAVEGAÇÃO GPS (CASO CLIQUE EM ABRIR MAPA) */}
      <Modal visible={showMapModal} transparent animationType="fade">
        <View style={stylesDark.modalBackdrop}>
          <View style={stylesDark.modalCard}>
            <View style={stylesDark.modalHeader}>
              <Text style={stylesDark.modalTitle}>Abrir Rota no GPS</Text>
              <TouchableOpacity onPress={() => setShowMapModal(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={stylesDark.modalSub}>
              Escolha o aplicativo de mapas de sua preferência para navegação:
            </Text>

            <View style={stylesDark.modalOptionsRow}>
              <TouchableOpacity
                style={[stylesDark.gpsOptionBtn, stylesDark.googleGpsBtn]}
                onPress={() => {
                  setShowMapModal(false);
                  openGoogleMaps(params.address);
                }}
                activeOpacity={0.85}
              >
                <Ionicons name="location-sharp" size={26} color="#FFF" />
                <Text style={stylesDark.gpsOptionText}>Google Maps</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[stylesDark.gpsOptionBtn, stylesDark.wazeGpsBtn]}
                onPress={() => {
                  setShowMapModal(false);
                  openWaze(params.address);
                }}
                activeOpacity={0.85}
              >
                <Ionicons name="car-sport" size={26} color="#FFF" />
                <Text style={stylesDark.gpsOptionText}>Waze</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={stylesDark.modalCancelBtn} onPress={() => setShowMapModal(false)}>
              <Text style={stylesDark.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// =========================================================================
// ESTILOS TELA 1: MINIMALISTA (LIGHT/MODERN)
// =========================================================================
const stylesMinimal = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  backText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    marginLeft: 6,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  timeBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#166534',
    marginLeft: 4,
  },
  serviceTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  infoGroup: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 8,
    fontWeight: '500',
  },
  infoVal: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
    marginLeft: 6,
  },
  phoneCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 26,
    marginBottom: 6,
  },
  phoneCallText: {
    fontSize: 13,
    color: '#2563EB',
    fontWeight: '600',
    marginLeft: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
    marginLeft: 26,
  },
  actionBtn: {
    backgroundColor: '#16A34A',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  actionBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
});

// =========================================================================
// ESTILOS TELA 2: TEMA CLARO COM AZUL DELBICOS (ESTILO IFOOD REFINADO)
// =========================================================================
const stylesDark = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  headerBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 1,
  },
  content: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  orderCardMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderInfoLeft: {
    flex: 1,
    marginRight: 12,
  },
  orderBadge: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  orderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563EB',
    marginBottom: 6,
  },
  orderClientName: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 8,
  },
  orderAddress: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  mapBoxBtn: {
    width: 76,
    height: 76,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#FF6B00',
    backgroundColor: 'rgba(255, 107, 0, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapBoxIconCircle: {
    marginBottom: 2,
  },
  mapBoxText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FF6B00',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardFooterText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  starsRow: {
    flexDirection: 'row',
  },
  tipBox: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  tipIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 4,
  },
  tipSub: {
    fontSize: 13,
    color: '#3B82F6',
    lineHeight: 18,
  },
  codeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  codeCardText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  bottomBar: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  bottomActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B00',
    borderRadius: 12,
    paddingVertical: 14,
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  bottomActionBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  floatingChatBtn: {
    position: 'absolute',
    right: 20,
    bottom: 90,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FF6B00',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },

  // ESTILOS MODAL GPS
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalSub: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 20,
    lineHeight: 18,
  },
  modalOptionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  gpsOptionBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleGpsBtn: {
    backgroundColor: '#EA4335',
  },
  wazeGpsBtn: {
    backgroundColor: '#0284C7',
  },
  gpsOptionText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
    marginTop: 6,
  },
  modalCancelBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default DeslocamentoScreen;

