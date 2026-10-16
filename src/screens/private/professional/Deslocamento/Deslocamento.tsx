import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Linking,
  SafeAreaView,
  TextInput,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useUserStore } from '@stores/User';
import { useAppointmentStore } from '@stores/Appointment';
import { useThemeStore, ThemeMode } from '@stores/Theme';
import { useColors } from '@theme/ThemeProvider';
import { LgpdConsentModal } from '@components/features/LgpdConsentModal';
import { NavigationAppModal } from '@components/features/NavigationAppModal';
import { OtpConfirmationModal } from '@components/features/OtpConfirmationModal';
import { DeslocamentoInitialCard } from '@components/features/DeslocamentoInitialCard';
import { DeslocamentoActiveCard } from '@components/features/DeslocamentoActiveCard';
import { useDeslocamentoTracking } from './useDeslocamentoTracking';
import { createStyles } from './styles';

export interface DeslocamentoParams {
  appointmentId: number | string;
  serviceTitle: string;
  clientName: string;
  clientPhone?: string;
  address: string;
  startTime: string;
  status?: string;
  verificationCode?: string;
}

export const DeslocamentoScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const params = (route.params || {}) as DeslocamentoParams;

  const colors = useColors();
  const { theme } = useThemeStore();
  const isDark = theme === ThemeMode.DARK;
  const isHighContrast = theme === ThemeMode.LIGHT_HI_CONTRAST;
  const styles = createStyles(colors, isDark, isHighContrast);

  const {
    getAppointmentById,
    markInTransit,
    markArrived,
    startService,
    completeService,
  } = useAppointmentStore();

  const rawId = params.appointmentId;
  const initialNumId =
    typeof rawId === 'number'
      ? rawId
      : /^\d+$/.test(String(rawId))
        ? Number(rawId)
        : undefined;
  const [numericAppointmentId, setNumericAppointmentId] = useState<
    number | undefined
  >(initialNumId);

  const [inTransit, setInTransit] = useState(
    params.status === 'in_transit' ||
      params.status === 'arrived' ||
      params.status === 'in_progress',
  );
  const [arrived, setArrived] = useState(
    params.status === 'arrived' || params.status === 'in_progress',
  );
  const [inProgress, setInProgress] = useState(params.status === 'in_progress');
  const [loading, setLoading] = useState(false);
  const [arrivedLoading, setArrivedLoading] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [destCoords, setDestCoords] = useState<{ lat?: number; lng?: number }>(
    {},
  );
  const { user, getLocationConsent, acceptLocationConsent } = useUserStore();
  const [showLgpdModal, setShowLgpdModal] = useState(false);

  // Dynamic state loaded from DB
  const [clientName, setClientName] = useState(
    params.clientName || 'Cliente DelBicos',
  );
  const [clientPhone, setClientPhone] = useState(params.clientPhone || '');
  const [serviceTitle, setServiceTitle] = useState(
    params.serviceTitle || 'Serviço Agendado',
  );
  const [address, setAddress] = useState(
    params.address || 'Endereço de atendimento',
  );

  const { startGpsTracking, stopGpsTracking, notifyArrived } =
    useDeslocamentoTracking({
      numericAppointmentId,
      appointmentId: params.appointmentId,
      destCoords,
    });

  useEffect(() => {
    if (params.appointmentId) {
      getAppointmentById(params.appointmentId)
        .then((appt) => {
          if (appt) {
            const numId = appt.numeric_id || appt.id;
            if (
              typeof numId === 'number' ||
              (typeof numId === 'string' && /^\d+$/.test(numId))
            ) {
              setNumericAppointmentId(Number(numId));
            }
            if (appt.Client?.User?.name) setClientName(appt.Client.User.name);
            if (appt.Client?.User?.phone)
              setClientPhone(appt.Client.User.phone);
            if (appt.Service?.title) setServiceTitle(appt.Service.title);
            if (appt.Address) {
              const addrStr = `${appt.Address.street}, ${appt.Address.number} - ${appt.Address.neighborhood}, ${appt.Address.city} - ${appt.Address.state}`;
              setAddress(addrStr);
              if (appt.Address.lat && appt.Address.lng) {
                setDestCoords({
                  lat: Number(appt.Address.lat),
                  lng: Number(appt.Address.lng),
                });
              }
            }
            if (appt.status === 'in_transit') {
              setInTransit(true);
              startGpsTracking();
            } else if (appt.status === 'arrived') {
              setInTransit(true);
              setArrived(true);
              setOtpMode('checkin');
              setShowOtpModal(true);
            } else if (appt.status === 'in_progress') {
              setInTransit(true);
              setArrived(true);
              setInProgress(true);
            }
          }
        })
        .catch(() => {});
    }
  }, [params.appointmentId, getAppointmentById, startGpsTracking]);

  // OTP Code Modal State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpMode, setOtpMode] = useState<'checkin' | 'checkout'>('checkin');
  const [otp, setOtp] = useState<string[]>(['', '', '', '']);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');

  const inputRef0 = useRef<TextInput | null>(null);
  const inputRef1 = useRef<TextInput | null>(null);
  const inputRef2 = useRef<TextInput | null>(null);
  const inputRef3 = useRef<TextInput | null>(null);
  const inputRefs = [inputRef0, inputRef1, inputRef2, inputRef3];

  const executeEstouACaminho = async () => {
    setLoading(true);
    try {
      if (params.appointmentId) {
        const res = await markInTransit(params.appointmentId);
        if (!res.success && res.error) {
          Alert.alert('Erro', res.error);
          return;
        }
      }
      setInTransit(true);
      await startGpsTracking();
      Alert.alert(
        'A Caminho! 🚗',
        'Você informou que está a caminho do local. Sua localização está sendo transmitida em tempo real para o cliente a cada 5 segundos.',
      );
    } catch {
      Alert.alert('Erro', 'Erro ao atualizar status para em deslocamento.');
    } finally {
      setLoading(false);
    }
  };

  const handleEstouACaminho = async () => {
    if (!user?.location_consent_accepted) {
      const consent = await getLocationConsent();
      if (!consent?.accepted) {
        setShowLgpdModal(true);
        return;
      }
    }
    await executeEstouACaminho();
  };

  const handleChegueiNoLocal = async () => {
    setArrivedLoading(true);
    let coords: { latitude?: number; longitude?: number } = {};

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        coords = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
      }
    } catch {
      // Coordenadas indisponíveis no momento
    }

    try {
      if (params.appointmentId) {
        const response = await markArrived(params.appointmentId, coords);
        if (response.success) {
          notifyArrived();
          setArrived(true);
          setOtpMode('checkin');
          setShowOtpModal(true);
        } else {
          Alert.alert(
            'Atenção',
            response.error || 'Erro ao confirmar chegada.',
          );
        }
      } else {
        stopGpsTracking();
        setArrived(true);
        setShowOtpModal(true);
      }
    } catch {
      Alert.alert('Atenção', 'Erro ao confirmar chegada.');
    } finally {
      setArrivedLoading(false);
    }
  };

  const handleOtpChange = (text: string, index: number) => {
    let cleanText = text.toUpperCase();
    if (index === 0 || index === 1) {
      cleanText = cleanText.replace(/[^A-Z]/g, '');
    } else {
      cleanText = cleanText.replace(/[^0-9]/g, '');
    }
    const newOtp = [...otp];
    newOtp[index] = cleanText;
    setOtp(newOtp);
    setOtpError('');

    if (cleanText && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number,
  ) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleConfirmOtp = async () => {
    const rawCode = otp.join('').toUpperCase();
    if (rawCode.length !== 4) {
      setOtpError('O código deve conter 4 caracteres (ex: AB-12).');
      return;
    }
    const code = `${rawCode.slice(0, 2)}-${rawCode.slice(2)}`;

    setOtpLoading(true);
    setOtpError('');

    try {
      if (params.appointmentId) {
        if (otpMode === 'checkout') {
          const res = await completeService(params.appointmentId, code);
          if (res.success) {
            setInProgress(false);
            setShowOtpModal(false);
            Alert.alert(
              'Serviço Concluído! 🎉',
              'Check-out realizado com sucesso! Atendimento concluído.',
              [{ text: 'OK', onPress: () => navigation.goBack() }],
            );
          } else {
            setOtpError(res.error || 'Código incorreto.');
          }
        } else {
          const res = await startService(params.appointmentId, code);
          if (res.success) {
            setInProgress(true);
            setShowOtpModal(false);
            Alert.alert(
              'Serviço Iniciado! 🚀',
              'Check-in realizado com sucesso! Atendimento iniciado.',
            );
          } else {
            setOtpError(res.error || 'Código incorreto.');
          }
        }
      } else {
        if (otpMode === 'checkout') {
          setInProgress(false);
          setShowOtpModal(false);
          Alert.alert(
            'Serviço Concluído! 🎉',
            'Check-out realizado com sucesso! Atendimento concluído.',
            [{ text: 'OK', onPress: () => navigation.goBack() }],
          );
        } else {
          setInProgress(true);
          setShowOtpModal(false);
          Alert.alert(
            'Serviço Iniciado! 🚀',
            'Check-in realizado com sucesso! Atendimento iniciado.',
          );
        }
      }
    } catch {
      setOtpError('Código incorreto. Peça o código de confirmação ao cliente.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleCallClient = () => {
    if (clientPhone) {
      Linking.openURL(`tel:${clientPhone}`);
    } else {
      Alert.alert('Info', 'Telefone do cliente não disponível.');
    }
  };

  const handleOpenChat = () => {
    try {
      (navigation as any).navigate('ChatScreen', {
        appointmentId: params.appointmentId,
      });
    } catch {
      if (clientPhone) {
        handleCallClient();
      } else {
        Alert.alert('Chat', 'Inicie a conversa pelo menu de mensagens.');
      }
    }
  };

  // MODO "A CAMINHO" / "CHEGOU" / "EM ANDAMENTO"
  if (inTransit) {
    return (
      <SafeAreaView style={styles.active.container}>
        <View style={styles.active.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.active.headerBtn}>
            <Ionicons
              name="chevron-back"
              size={24}
              color={colors.primaryBlue}
            />
          </TouchableOpacity>
          <Text style={styles.active.headerTitle}>DESLOCAMENTO</Text>
          <TouchableOpacity
            onPress={handleOpenChat}
            style={styles.active.headerBtn}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={22}
              color={colors.primaryBlue}
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[
            styles.active.content,
            { flexGrow: 1, paddingBottom: 100 },
          ]}
          showsVerticalScrollIndicator={false}>
          <DeslocamentoActiveCard
            clientName={clientName}
            serviceTitle={serviceTitle}
            address={address}
            startTime={params.startTime}
            inProgress={inProgress}
            arrived={arrived}
            onOpenMap={() => setShowMapModal(true)}
          />
        </ScrollView>

        <View style={styles.active.bottomBar}>
          {inProgress ? (
            <TouchableOpacity
              style={[
                styles.active.bottomActionBtn,
                { backgroundColor: colors.primaryGreen },
              ]}
              onPress={() => {
                setOtp(['', '', '', '']);
                setOtpError('');
                setOtpMode('checkout');
                setShowOtpModal(true);
              }}
              activeOpacity={0.85}>
              <Ionicons
                name="checkmark-done-circle-outline"
                size={22}
                color={colors.primaryWhite}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.active.bottomActionBtnText}>
                Finalizar Atendimento (Check-out) 🏁
              </Text>
            </TouchableOpacity>
          ) : arrived ? (
            <TouchableOpacity
              style={[
                styles.active.bottomActionBtn,
                { backgroundColor: colors.primaryOrange },
              ]}
              onPress={() => {
                setOtp(['', '', '', '']);
                setOtpError('');
                setOtpMode('checkin');
                setShowOtpModal(true);
              }}
              activeOpacity={0.85}>
              <Ionicons
                name="key-outline"
                size={22}
                color={colors.primaryWhite}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.active.bottomActionBtnText}>
                Digitar Código do Cliente 🔐
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.active.bottomActionBtn}
              onPress={handleChegueiNoLocal}
              disabled={arrivedLoading}
              activeOpacity={0.85}>
              {arrivedLoading ? (
                <ActivityIndicator color={colors.primaryWhite} size="small" />
              ) : (
                <>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={22}
                    color={colors.primaryWhite}
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.active.bottomActionBtnText}>
                    Cheguei no Local 🎯
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        <OtpConfirmationModal
          visible={showOtpModal}
          onClose={() => setShowOtpModal(false)}
          otpMode={otpMode}
          otp={otp}
          otpError={otpError}
          otpLoading={otpLoading}
          inputRefs={inputRefs}
          onOtpChange={handleOtpChange}
          onOtpKeyPress={handleOtpKeyPress}
          onConfirm={handleConfirmOtp}
          onCallClient={handleCallClient}
        />

        <NavigationAppModal
          visible={showMapModal}
          onClose={() => setShowMapModal(false)}
          address={address}
        />

        <LgpdConsentModal
          visible={showLgpdModal}
          onClose={() => setShowLgpdModal(false)}
          onAccept={async () => {
            await acceptLocationConsent();
            setShowLgpdModal(false);
            await executeEstouACaminho();
          }}
          onDecline={() => {
            setShowLgpdModal(false);
            Alert.alert(
              'Consentimento Necessário (LGPD)',
              'Conforme as diretrizes da LGPD (Lei nº 13.709/2018), a transmissão do seu deslocamento em tempo real exige a autorização de geolocalização.',
            );
          }}
        />
      </SafeAreaView>
    );
  }

  // MODO INICIAL (MINIMALISTA)
  return (
    <SafeAreaView style={styles.minimal.container}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.minimal.content,
          { flexGrow: 1, paddingBottom: 40 },
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.minimal.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.minimal.backBtn}>
            <Ionicons name="arrow-back" size={20} color={colors.primaryBlack} />
            <Text style={styles.minimal.backText}>Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.minimal.screenTitle}>
            Deslocamento para Serviço
          </Text>
        </View>

        <DeslocamentoInitialCard
          clientName={clientName}
          clientPhone={clientPhone}
          serviceTitle={serviceTitle}
          address={address}
          startTime={params.startTime}
          onCallClient={handleCallClient}
        />

        <TouchableOpacity
          style={styles.minimal.actionBtn}
          onPress={handleEstouACaminho}
          disabled={loading}
          activeOpacity={0.88}>
          {loading ? (
            <ActivityIndicator color={colors.primaryWhite} />
          ) : (
            <View style={styles.minimal.actionBtnContent}>
              <Text style={styles.minimal.actionBtnText}>Estou a Caminho</Text>
              <Ionicons
                name="car-sport"
                size={22}
                color={colors.primaryWhite}
                style={{ marginLeft: 8 }}
              />
            </View>
          )}
        </TouchableOpacity>
      </ScrollView>

      <NavigationAppModal
        visible={showMapModal}
        onClose={() => setShowMapModal(false)}
        address={address}
      />

      <LgpdConsentModal
        visible={showLgpdModal}
        onClose={() => setShowLgpdModal(false)}
        onAccept={async () => {
          await acceptLocationConsent();
          setShowLgpdModal(false);
          await executeEstouACaminho();
        }}
        onDecline={() => {
          setShowLgpdModal(false);
          Alert.alert(
            'Consentimento Necessário (LGPD)',
            'Conforme as diretrizes da LGPD (Lei nº 13.709/2018), a transmissão do seu deslocamento em tempo real exige a autorização de geolocalização.',
          );
        }}
      />
    </SafeAreaView>
  );
};

export default DeslocamentoScreen;
