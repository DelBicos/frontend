import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import { useColors } from '@theme/ThemeProvider';
import { formatBRLFromCents } from '@lib/helpers/formatCurrency';
import { NavigationParams } from '@screens/types';

import { stripePromise } from '@lib/stripe/stripe';
import { Elements } from '@stripe/react-stripe-js';
import { HTTP_DOMAIN } from '@config/varEnvs';

import { useUserStore } from '@stores/User';
import { Address } from '@stores/Address/types';
import { useProfessionalStore } from '@stores/Professional';
import AddressSelectionModal from '@components/features/AddressSelectionModal';
import { createStyles } from './styles';
import CheckoutForm from '../CheckoutForm/CheckoutForm.web';

type CheckoutRouteParams = NavigationParams['Checkout'];

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

  if (amount <= 0) {
    console.error('[CheckoutScreen] Amount inválido:', amount);
    return null;
  }

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

function CheckoutScreen() {
  const navigation = useNavigation();
  const route =
    useRoute<RouteProp<{ params: CheckoutRouteParams }, 'params'>>();
  const { professionalId, selectedTime, imageUrl, serviceId, appointmentId } = route.params;

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loadingIntent, setLoadingIntent] = useState(false);
  const [errorIntent, setErrorIntent] = useState<string | null>(null);
  const [isLoadingProfessional, setIsLoadingProfessional] = useState(true);

  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [isAddressModalVisible, setIsAddressModalVisible] = useState(false);

  const { user, token } = useUserStore();
  const { selectedProfessional, fetchProfessionalById } =
    useProfessionalStore();

  const colors = useColors();
  const styles = createStyles(colors);

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
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    }
  };

  useEffect(() => {
    if (!user) {
      navigation.navigate('Login');
    }
  }, [user, navigation]);

  useEffect(() => {
    if (!user) return;
    const loadData = async () => {
      setIsLoadingProfessional(true);
      await fetchProfessionalById(professionalId);
      setIsLoadingProfessional(false);
    };
    loadData();
  }, [user, professionalId, fetchProfessionalById]);

  const amountInReais = useMemo(() => {
    if (!service) return 0;
    if (service.price_cents !== null && service.price_cents !== undefined) {
      return service.price_cents / 100;
    }
    if (service.price !== null && service.price !== undefined) {
      return Number(service.price);
    }
    return 0;
  }, [service]);

  useEffect(() => {
    if (service && selectedAddress && token) {
      const initPayment = async () => {
        setLoadingIntent(true);
        setErrorIntent(null);

        if (amountInReais <= 0) {
          setErrorIntent('Valor do serviço inválido. Entre em contato com o suporte.');
          setLoadingIntent(false);
          return;
        }

        console.log('[CheckoutScreen] Enviando amount (em reais):', amountInReais);

        const secret = await fetchPaymentIntent(
          amountInReais,
          professionalId,
          service.id,
          selectedTime,
          selectedAddress.id,
          token,
          appointmentId,
        );

        if (secret) {
          setClientSecret(secret);
        } else {
          setErrorIntent('Falha ao iniciar pagamento.');
        }
        setLoadingIntent(false);
      };
      initPayment();
    }
  }, [service, selectedAddress, professionalId, selectedTime, token, amountInReais, appointmentId]);

  const stripeOptions = useMemo(
    () => ({
      clientSecret: clientSecret || '',
      appearance: { theme: 'stripe', labels: 'floating' } as const,
    }),
    [clientSecret],
  );


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
                    {formatBRLFromCents(service.price_cents)}
                  </Text>
                </View>

                <View style={styles.divider} />

                <Text style={styles.dateLabel}>Data e Horário</Text>
                <Text style={styles.dateValue}>{formattedTime}</Text>
              </View>
            </View>
          </View>

          <View style={styles.rightColumn}>
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

              {clientSecret && selectedAddress && (
                <Elements options={stripeOptions} stripe={stripePromise}>
                  <CheckoutForm />
                </Elements>
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

export default CheckoutScreen;
