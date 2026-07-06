import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import { useColors } from '@theme/ThemeProvider';
import { formatBRLFromCents } from '@lib/helpers/formatCurrency';
import { NavigationParams } from '@screens/types';
import { StripeProvider, useStripe } from '@stripe/stripe-react-native';
import { STRIPE_PUBLISHABLE_KEY, HTTP_DOMAIN } from '@config/varEnvs';

import { useUserStore } from '@stores/User';
import { Address } from '@stores/Address/types';
import { useProfessionalStore } from '@stores/Professional';
import { Appointment } from '@stores/Appointment';
import AddressSelectionModal from '@components/features/AddressSelectionModal';
import { createStyles } from './styles';
import CheckoutForm from '@screens/public/CheckoutScreen/CheckoutForm';

type CheckoutRouteParams = NavigationParams['Checkout'];

/** Haversine distance in km between two lat/lng pairs */
function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function fetchPaymentIntent(
  amount: number,
  professionalId: number,
  serviceId: number,
  selectedTime: string,
  addressId: number,
  token: string | null,
  appointmentId?: number,
): Promise<string | null> {
  if (!token) return null;

  try {
    const response = await fetch(
      `${HTTP_DOMAIN}/api/payments/create-payment-intent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount,
          currency: 'brl',
          professionalId,
          serviceId,
          selectedTime,
          addressId,
          ...(appointmentId ? { appointmentId } : {}),
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || `Erro do servidor: ${response.status}`,
      );
    }

    const data = await response.json();
    return data.clientSecret;
  } catch (e: any) {
    console.error('[CheckoutScreen] Erro no PaymentIntent:', e.message);
    return null;
  }
}

function CheckoutScreenContent() {
  const navigation = useNavigation();
  const route =
    useRoute<RouteProp<{ params: CheckoutRouteParams }, 'params'>>();
  const { professionalId, selectedTime, imageUrl, serviceId, appointmentId } = route.params;

  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loadingIntent, setLoadingIntent] = useState(false);
  const [errorIntent, setErrorIntent] = useState<string | null>(null);
  const [isLoadingProfessional, setIsLoadingProfessional] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState<string | null>(null);
  const [radiusWarning, setRadiusWarning] = useState<string | null>(null);

  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [isAddressModalVisible, setIsAddressModalVisible] = useState(false);

  const { user, token } = useUserStore();
  const { selectedProfessional, fetchProfessionalById } =
    useProfessionalStore();

  const colors = useColors();
  const styles = createStyles(colors);

  const formattedTime = useMemo(() => {
    if (!selectedTime) return '';
    try {
      const date = new Date(selectedTime);
      if (isNaN(date.getTime())) {
        return selectedTime;
      }
      const dataFormatada = date.toLocaleDateString('pt-BR');
      const horario = date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      });
      return `${dataFormatada} às ${horario}`;
    } catch (e) {
      return selectedTime;
    }
  }, [selectedTime]);

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      // @ts-ignore
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    }
  };

  // Redirect unauthenticated users to Login
  useEffect(() => {
    if (!user) {
      // @ts-ignore
      navigation.navigate('Login');
    }
  }, [user, navigation]);

  // 1. Carrega Profissional
  useEffect(() => {
    if (!user) return;
    const loadData = async () => {
      setIsLoadingProfessional(true);
      await fetchProfessionalById(professionalId);
      setIsLoadingProfessional(false);
    };
    loadData();
  }, [user, professionalId, fetchProfessionalById]);

  // 2. Identifica o Serviço
  const service = useMemo(() => {
    if (selectedProfessional && serviceId) {
      const found = selectedProfessional.Services?.find(
        (s) => String(s.id) === String(serviceId),
      );
      if (!found) {
        setErrorIntent('Serviço não encontrado. Tente novamente.');
      }
      return found || null;
    }
    return null;
  }, [selectedProfessional, serviceId]);

  // 3. Inicializa Pagamento (Quando tiver serviço + endereço)
  useEffect(() => {
    if (!service || !selectedAddress || !token) return;

    // Validate geocoded coordinates
    if (!selectedAddress.lat || !selectedAddress.lng) {
      setRadiusWarning(
        'Endereço sem coordenadas. Adicione um endereço geocodificado para continuar.',
      );
      setClientSecret(null);
      return;
    }

    // Haversine pre-check against professional radius
    const profLat = selectedProfessional?.MainAddress?.lat;
    const profLng = selectedProfessional?.MainAddress?.lng;
    const radius = selectedProfessional?.service_radius_km;
    if (profLat && profLng && radius != null && radius > 0) {
      const distKm = haversineKm(
        profLat,
        profLng,
        selectedAddress.lat,
        selectedAddress.lng,
      );
      if (distKm > radius) {
        setRadiusWarning(
          `Este endereço está a ~${Math.round(distKm)} km do profissional, fora do raio de ${radius} km. Escolha outro endereço.`,
        );
        setClientSecret(null);
        return;
      }
    }
    setRadiusWarning(null);

    const initPayment = async () => {
      setLoadingIntent(true);
      setErrorIntent(null);

      const amountValue = (service as any).price_cents
        ? (service as any).price_cents / 100
        : Number(service.price);

      const secret = await fetchPaymentIntent(
        amountValue,
        professionalId,
        service.id,
        selectedTime,
        selectedAddress.id,
        token,
        appointmentId,
      );

      if (secret) {
        setClientSecret(secret);

        const { error } = await initPaymentSheet({
          paymentIntentClientSecret: secret,
          merchantDisplayName: 'DelBicos',
          allowsDelayedPaymentMethods: false,
        });

        if (error) {
          console.error('[CheckoutScreen] initPaymentSheet error:', error);
          setErrorIntent('Falha ao inicializar pagamento.');
        }
      } else {
        setErrorIntent('Falha ao iniciar pagamento.');
      }
      setLoadingIntent(false);
    };
    initPayment();
  }, [
    service,
    selectedAddress,
    selectedProfessional,
    professionalId,
    selectedTime,
    token,
    initPaymentSheet,
    appointmentId,
  ]);

  // 4. Apresenta PaymentSheet e confirma no servidor
  const handlePay = async () => {
    if (!clientSecret || !user || !token) return;

    setIsProcessingPayment(true);
    setPaymentMessage(null);

    try {
      const { error } = await presentPaymentSheet();

      if (error) {
        if (error.code === 'Canceled') {
          setPaymentMessage(null);
        } else {
          setPaymentMessage(error.message || 'Ocorreu um erro no pagamento.');
        }
        setIsProcessingPayment(false);
        return;
      }

      // Pagamento aprovado — confirma no servidor
      const paymentIntentId = clientSecret.split('_secret_')[0];

      const confirmResponse = await fetch(
        `${HTTP_DOMAIN}/api/payments/confirm`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            paymentIntentId,
            userId: user.id,
          }),
        },
      );

      const confirmData = await confirmResponse.json();

      if (!confirmResponse.ok) {
        // Handle specific case: address out of professional radius
        const msg =
          confirmData.error ||
          confirmData.message ||
          'Falha ao confirmar agendamento no servidor.';
        if (typeof msg === 'string' && msg.includes('fora do raio')) {
          Alert.alert(
            'Endereço fora do raio',
            'O endereço selecionado está fora do raio de atendimento do profissional. Deseja escolher outro endereço ou procurar outro profissional?',
            [
              {
                text: 'Escolher Endereço',
                onPress: () => setIsAddressModalVisible(true),
              },
              {
                text: 'Procurar Outro',
                onPress: () => navigation.goBack(),
              },
            ],
          );
          setIsProcessingPayment(false);
          return;
        }

        throw new Error(msg);
      }

      const newAppointment = confirmData.appointment as Appointment;

      // @ts-ignore
      navigation.navigate('PaymentStatus', {
        appointmentId: newAppointment.id,
        paymentIntentId,
      });
    } catch (err: any) {
      console.error('[CheckoutScreen] Erro:', err.message);
      Alert.alert('Erro', err.message || 'Falha ao processar pagamento.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // --- Renderização de Estados ---

  if (isLoadingProfessional) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primaryBlue} />
        <Text style={styles.loadingText}>Carregando dados...</Text>
      </View>
    );
  }

  if (!selectedProfessional || !service || errorIntent) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          {errorIntent || 'Ocorreu um erro ao carregar o serviço.'}
        </Text>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.centerContainer}>
      <View style={styles.contentMaxWidth}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <FontAwesome
              name="chevron-left"
              size={14}
              color={colors.primaryBlue}
            />
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.pageTitle}>Confirmar Agendamento</Text>

        <View style={styles.mainContent}>
          {/* COLUNA ESQUERDA: Resumo */}
          <View style={styles.leftColumn}>
            <View style={styles.summaryCard}>
              <Image
                source={{
                  uri:
                    imageUrl ||
                    service.banner_uri ||
                    selectedProfessional.User.avatar_uri ||
                    undefined,
                }}
                style={styles.summaryImage}
                resizeMode="cover"
              />
              <View style={styles.summaryDetails}>
                <View style={styles.summaryHeaderRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.profName}>
                      {selectedProfessional.User.name}
                    </Text>
                    <Text style={styles.serviceTitle}>{service.title}</Text>
                  </View>
                  <Text style={styles.priceTag}>
                    {formatBRLFromCents(
                      (service as any).price_cents ??
                        Number(service.price) * 100,
                    )}
                  </Text>
                </View>

                <View style={styles.divider} />

                <Text style={styles.dateLabel}>Data e Horário</Text>
                <Text style={styles.dateValue}>{formattedTime}</Text>
              </View>
            </View>
          </View>

          {/* COLUNA DIREITA: Endereço e Pagamento */}
          <View style={styles.rightColumn}>
            {/* Seção Endereço */}
            {selectedAddress ? (
              <View style={styles.addressContainer}>
                <View style={styles.addressRow}>
                  <FontAwesome
                    name="map-marker"
                    size={20}
                    color={colors.primaryOrange}
                  />
                  <Text style={styles.addressText} numberOfLines={2}>
                    {selectedAddress.street}, {selectedAddress.number} -{' '}
                    {selectedAddress.city}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setIsAddressModalVisible(true)}>
                    <Text style={styles.changeAddressLink}>Alterar</Text>
                  </TouchableOpacity>
                </View>
                {radiusWarning && (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                      backgroundColor: '#fef2f2',
                      borderRadius: 8,
                      padding: 10,
                      marginTop: 8,
                      gap: 8,
                    }}>
                    <FontAwesome
                      name="exclamation-circle"
                      size={14}
                      color="#dc2626"
                      style={{ marginTop: 2 }}
                    />
                    <Text
                      style={{
                        flex: 1,
                        fontFamily: 'Afacad-Regular',
                        fontSize: 13,
                        color: '#dc2626',
                        lineHeight: 18,
                      }}>
                      {radiusWarning}
                    </Text>
                  </View>
                )}
              </View>
            ) : (
              <TouchableOpacity
                style={styles.selectAddressBtn}
                onPress={() => setIsAddressModalVisible(true)}>
                <Text style={styles.selectAddressBtnText}>
                  Selecione o Endereço do Serviço
                </Text>
              </TouchableOpacity>
            )}

            {/* Seção Pagamento */}
            <View style={styles.paymentCard}>
              <Text style={styles.sectionTitle}>Pagamento</Text>

              {loadingIntent && (
                <ActivityIndicator
                  color={colors.primaryBlue}
                  style={{ marginVertical: 20 }}
                />
              )}

              {!clientSecret && !loadingIntent && selectedAddress && (
                <Text style={styles.errorText}>
                  Erro ao inicializar pagamento.
                </Text>
              )}

              {!selectedAddress && (
                <Text
                  style={{
                    color: colors.textSecondary,
                    textAlign: 'center',
                    marginVertical: 20,
                  }}>
                  Selecione um endereço para continuar.
                </Text>
              )}

              {clientSecret && selectedAddress && !radiusWarning && (
                <CheckoutForm
                  onPay={handlePay}
                  isLoading={isProcessingPayment}
                  message={paymentMessage}
                />
              )}
            </View>
          </View>
        </View>
      </View>

      {user && (
        <AddressSelectionModal
          visible={isAddressModalVisible}
          userId={user.id}
          onClose={() => setIsAddressModalVisible(false)}
          onAddressSelect={(addr) => {
            setSelectedAddress(addr);
            setIsAddressModalVisible(false);
          }}
        />
      )}
    </ScrollView>
  );
}

function CheckoutScreen() {
  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
      <CheckoutScreenContent />
    </StripeProvider>
  );
}

export default CheckoutScreen;
