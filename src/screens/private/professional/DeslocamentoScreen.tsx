import React, { useState, useRef, useEffect } from 'react';
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
  TextInput,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
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

  const [inTransit, setInTransit] = useState(params.status === 'in_transit' || params.status === 'arrived' || params.status === 'in_progress');
  const [arrived, setArrived] = useState(params.status === 'arrived' || params.status === 'in_progress');
  const [inProgress, setInProgress] = useState(params.status === 'in_progress');
  const [loading, setLoading] = useState(false);
  const [arrivedLoading, setArrivedLoading] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);

  // Dynamic state loaded from DB
  const [clientName, setClientName] = useState(params.clientName || 'Cliente DelBicos');
  const [clientPhone, setClientPhone] = useState(params.clientPhone || '');
  const [serviceTitle, setServiceTitle] = useState(params.serviceTitle || 'Serviço Agendado');
  const [address, setAddress] = useState(params.address || 'Endereço de atendimento');

  useEffect(() => {
    if (params.appointmentId) {
      backendHttpClient
        .get(`/api/appointments/${params.appointmentId}`)
        .then((res) => {
          const appt = res.data;
          if (appt) {
            if (appt.Client?.User?.name) setClientName(appt.Client.User.name);
            if (appt.Client?.User?.phone) setClientPhone(appt.Client.User.phone);
            if (appt.Service?.title) setServiceTitle(appt.Service.title);
            if (appt.Address) {
              const addrStr = `${appt.Address.street}, ${appt.Address.number} - ${appt.Address.neighborhood}, ${appt.Address.city} - ${appt.Address.state}`;
              setAddress(addrStr);
            }
            if (appt.status === 'in_transit') {
              setInTransit(true);
            } else if (appt.status === 'arrived') {
              setInTransit(true);
              setArrived(true);
            } else if (appt.status === 'in_progress') {
              setInTransit(true);
              setArrived(true);
              setInProgress(true);
            }
          }
        })
        .catch(() => {
          // Silenciosamente mantém os dados iniciais
        });
    }
  }, [params.appointmentId]);

  // OTP Code Modal State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState<string[]>(['', '', '', '']);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');

  const inputRef0 = useRef<TextInput>(null);
  const inputRef1 = useRef<TextInput>(null);
  const inputRef2 = useRef<TextInput>(null);
  const inputRef3 = useRef<TextInput>(null);
  const inputRefs = [inputRef0, inputRef1, inputRef2, inputRef3];

  const handleEstouACaminho = async () => {
    setLoading(true);
    setInTransit(true);
    try {
      if (params.appointmentId) {
        await backendHttpClient.post(`/api/appointments/${params.appointmentId}/in-transit`);
      }
    } catch (error) {
      // Silenciosamente tolera respostas em modo de teste
    } finally {
      setLoading(false);
    }
  };

  const handleChegueiNoLocal = async () => {
    setArrivedLoading(true);
    let coords: { latitude?: number; longitude?: number } = {};

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        coords = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
      }
    } catch (err) {
      console.log('Location error:', err);
    }

    try {
      if (params.appointmentId) {
        const response = await backendHttpClient.post(`/api/appointments/${params.appointmentId}/arrived`, coords);
        if (response.data && response.data.success) {
          setArrived(true);
          setShowOtpModal(true);
        }
      } else {
        setArrived(true);
        setShowOtpModal(true);
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error;
      if (errorMessage && errorMessage.includes('distante')) {
        Alert.alert('📍 Localização Distante', errorMessage);
      } else {
        // Modo de demonstração / fallback para testes
        setArrived(true);
        setShowOtpModal(true);
      }
    } finally {
      setArrivedLoading(false);
    }
  };

  const handleOtpChange = (text: string, index: number) => {
    const cleanText = text.replace(/[^0-9]/g, '');
    const newOtp = [...otp];
    newOtp[index] = cleanText;
    setOtp(newOtp);
    setOtpError('');

    if (cleanText && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleConfirmOtp = async () => {
    const code = otp.join('');
    if (code.length !== 4) {
      setOtpError('O código deve conter 4 números.');
      return;
    }

    setOtpLoading(true);
    setOtpError('');

    try {
      if (params.appointmentId) {
        const res = await backendHttpClient.post(`/api/appointments/${params.appointmentId}/start-service`, { code });
        if (res.data && res.data.success) {
          setInProgress(true);
          setShowOtpModal(false);
          Alert.alert('Serviço Iniciado! 🚀', 'Atendimento iniciado com sucesso.');
        }
      } else {
        setInProgress(true);
        setShowOtpModal(false);
        Alert.alert('Serviço Iniciado! 🚀', 'Atendimento iniciado com sucesso.');
      }
    } catch (error: any) {
      const msg = error?.response?.data?.error || 'Código incorreto. Peça o código de 4 dígitos ao cliente.';
      setOtpError(msg);
    } finally {
      setOtpLoading(false);
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
    try {
      (navigation as any).navigate('ChatScreen', { appointmentId: params.appointmentId });
    } catch (err) {
      if (params.clientPhone) {
        handleCallClient();
      } else {
        Alert.alert('Chat', 'Inicie a conversa pelo menu de mensagens.');
      }
    }
  };  // =========================================================================
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
                  {clientName}
                </Text>

                {/* Nome do Serviço */}
                <Text style={stylesDark.orderTitle}>
                  Serviço: {serviceTitle}
                </Text>

                {/* Endereço de Atendimento */}
                <Text style={stylesDark.orderAddress} numberOfLines={3}>
                  {address}
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

          {/* Banner de Dica / Status */}
          {inProgress ? (
            <View style={[stylesDark.tipBox, { borderColor: '#10B981', backgroundColor: '#F0FDF4' }]}>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" style={stylesDark.tipIcon} />
              <View style={stylesDark.tipContent}>
                <Text style={[stylesDark.tipTitle, { color: '#065F46' }]}>Serviço em Andamento ⚡</Text>
                <Text style={[stylesDark.tipSub, { color: '#047857' }]}>
                  Atendimento iniciado com sucesso. Realize o serviço conforme o agendamento.
                </Text>
              </View>
            </View>
          ) : arrived ? (
            <View style={[stylesDark.tipBox, { borderColor: '#FF6B00', backgroundColor: '#FFF7ED' }]}>
              <Ionicons name="key-outline" size={24} color="#FF6B00" style={stylesDark.tipIcon} />
              <View style={stylesDark.tipContent}>
                <Text style={[stylesDark.tipTitle, { color: '#C2410C' }]}>Chegada Confirmada 🎯</Text>
                <Text style={[stylesDark.tipSub, { color: '#EA580C' }]}>
                  Solicite o código de 4 dígitos enviado ao cliente para iniciar o atendimento.
                </Text>
              </View>
            </View>
          ) : (
            <View style={stylesDark.tipBox}>
              <Ionicons name="bulb-outline" size={24} color="#2563EB" style={stylesDark.tipIcon} />
              <View style={stylesDark.tipContent}>
                <Text style={stylesDark.tipTitle}>Deslocamento em Andamento</Text>
                <Text style={stylesDark.tipSub}>
                  Você informou que está a caminho. Ao chegar no local de atendimento, clique no botão abaixo.
                </Text>
              </View>
            </View>
          )}

          {/* Banner com o Nome do Serviço */}
          <View style={stylesDark.codeCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="construct-outline" size={20} color="#2563EB" style={{ marginRight: 8 }} />
              <Text style={stylesDark.codeCardText}>
                Serviço: {params.serviceTitle || 'Serviço Agendado'}
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Botão de Ação Inferior */}
        <View style={stylesDark.bottomBar}>
          {inProgress ? (
            <View style={[stylesDark.bottomActionBtn, { backgroundColor: '#10B981' }]}>
              <Ionicons name="time-outline" size={22} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={stylesDark.bottomActionBtnText}>Serviço em Andamento ⏱️</Text>
            </View>
          ) : arrived ? (
            <TouchableOpacity
              style={[stylesDark.bottomActionBtn, { backgroundColor: '#FF6B00' }]}
              onPress={() => setShowOtpModal(true)}
              activeOpacity={0.85}
            >
              <Ionicons name="key-outline" size={22} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={stylesDark.bottomActionBtnText}>Digitar Código do Cliente 🔐</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={stylesDark.bottomActionBtn}
              onPress={handleChegueiNoLocal}
              disabled={arrivedLoading}
              activeOpacity={0.85}
            >
              {arrivedLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={22} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={stylesDark.bottomActionBtnText}>Cheguei no Local 🎯</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* MODAL CÓDIGO DE 4 DÍGITOS (ESTILO IFOOD / OTP) */}
        <Modal visible={showOtpModal} transparent animationType="slide">
          <View style={stylesDark.modalBackdrop}>
            <View style={stylesDark.otpCard}>
              <View style={stylesDark.otpHeader}>
                <TouchableOpacity onPress={() => setShowOtpModal(false)}>
                  <Ionicons name="chevron-back" size={24} color="#0F172A" />
                </TouchableOpacity>
                <Text style={stylesDark.otpHeaderTitle}>CÓDIGO DE INÍCIO</Text>
                <View style={{ width: 24 }} />
              </View>

              <Text style={stylesDark.otpTitle}>Digite o código do cliente</Text>
              <Text style={stylesDark.otpSub}>
                O cliente recebeu um código de 4 números. Peça este código para iniciar o serviço.
              </Text>

              {/* 4 BOXES DE INPUT */}
              <View style={stylesDark.otpBoxesRow}>
                {otp.map((digit, idx) => (
                  <TextInput
                    key={idx}
                    ref={inputRefs[idx]}
                    style={[
                      stylesDark.otpInputBox,
                      digit ? stylesDark.otpInputBoxFilled : null,
                    ]}
                    value={digit}
                    onChangeText={(text) => handleOtpChange(text, idx)}
                    onKeyPress={(e) => handleOtpKeyPress(e, idx)}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                    autoFocus={idx === 0}
                  />
                ))}
              </View>

              {otpError ? (
                <Text style={stylesDark.otpErrorText}>{otpError}</Text>
              ) : null}

              <View style={stylesDark.otpRequirements}>
                <Ionicons name="checkmark-circle-outline" size={16} color="#10B981" />
                <Text style={stylesDark.otpReqText}>Código de 4 números fornecido pelo cliente</Text>
              </View>

              <TouchableOpacity
                style={[stylesDark.otpConfirmBtn, otpLoading && { opacity: 0.7 }]}
                onPress={handleConfirmOtp}
                disabled={otpLoading}
                activeOpacity={0.85}
              >
                {otpLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={stylesDark.otpConfirmBtnText}>Confirmar e Iniciar Serviço</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={stylesDark.otpHelpLink} onPress={handleCallClient}>
                <Text style={stylesDark.otpHelpText}>Não consegue o código? Ligar para o cliente</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

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
                    openGoogleMaps(address);
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
                    openWaze(address);
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

          <Text style={stylesMinimal.serviceTitle}>{serviceTitle}</Text>

          <View style={stylesMinimal.infoGroup}>
            <View style={stylesMinimal.infoRow}>
              <Ionicons name="person-outline" size={18} color="#64748B" />
              <Text style={stylesMinimal.infoLabel}>Cliente:</Text>
              <Text style={stylesMinimal.infoVal}>{clientName}</Text>
            </View>

            {!!clientPhone && (
              <TouchableOpacity onPress={handleCallClient} style={stylesMinimal.phoneCallBtn}>
                <Ionicons name="call-outline" size={14} color="#2563EB" />
                <Text style={stylesMinimal.phoneCallText}>{clientPhone}</Text>
              </TouchableOpacity>
            )}

            <View style={[stylesMinimal.infoRow, { marginTop: 10 }]}>
              <Ionicons name="location-outline" size={18} color="#64748B" />
              <Text style={stylesMinimal.infoLabel}>Endereço:</Text>
            </View>
            <Text style={stylesMinimal.addressText}>{address}</Text>
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
                  openGoogleMaps(address);
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
                  openWaze(address);
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

  // ESTILOS MODAL OTP (CÓDIGO DE 4 DÍGITOS ESTILO IFOOD)
  otpCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  otpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  otpHeaderTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 1,
  },
  otpTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  otpSub: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 24,
  },
  otpBoxesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 20,
  },
  otpInputBox: {
    flex: 1,
    height: 64,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    textAlign: 'center',
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
  },
  otpInputBoxFilled: {
    borderColor: '#FF6B00',
    backgroundColor: '#FFFFFF',
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  otpErrorText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  otpRequirements: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 24,
  },
  otpReqText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  otpConfirmBtn: {
    backgroundColor: '#FF6B00',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 14,
  },
  otpConfirmBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  otpHelpLink: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  otpHelpText: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default DeslocamentoScreen;

