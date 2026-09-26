import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NavigationParams } from '@screens/types';
import { createPaymentIntent } from '@api/payments';
import { getApiErrorMessage } from '@api/errors';
import { useUserStore } from '@stores/User';
import { useAddressStore } from '@stores/Address';
import { Address } from '@stores/Address/types';
import { useProfessionalStore } from '@stores/Professional';

type CheckoutRouteParams = NavigationParams['Checkout'];

export type CheckoutStatus = 'loading' | 'not-found' | 'ready';

/**
 * Dados e regras do checkout, iguais no app e no web: carrega o
 * profissional e o servico, sugere o endereco principal e cria o pagamento
 * (o servidor valida horario, endereco e raio de atendimento).
 */
export function useCheckout() {
  const navigation = useNavigation<any>();
  const route =
    useRoute<RouteProp<{ params: CheckoutRouteParams }, 'params'>>();
  const { professionalId, selectedTime, imageUrl, serviceId, appointmentId } =
    route.params;

  const { user, token } = useUserStore();
  const { selectedProfessional, fetchProfessionalById } =
    useProfessionalStore();
  const { addresses, fetchAddressesByUserId } = useAddressStore();

  const [isLoadingProfessional, setIsLoadingProfessional] = useState(true);
  const [address, setAddress] = useState<Address | null>(null);
  const [addressTouched, setAddressTouched] = useState(false);
  const [isAddressModalVisible, setIsAddressModalVisible] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [intentError, setIntentError] = useState<string | null>(null);
  const [isCreatingIntent, setIsCreatingIntent] = useState(false);
  const [attempt, setAttempt] = useState(0);

  // Sem login, vai para o login (o checkout exige usuario).
  useEffect(() => {
    if (!user) navigation.navigate('Login');
  }, [user, navigation]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setIsLoadingProfessional(true);
    // Parametros vindos da URL (web) chegam como texto.
    fetchProfessionalById(Number(professionalId)).finally(() => {
      if (!cancelled) setIsLoadingProfessional(false);
    });
    fetchAddressesByUserId(user.id);
    return () => {
      cancelled = true;
    };
  }, [user, professionalId, fetchProfessionalById, fetchAddressesByUserId]);

  // Sugere o endereco principal enquanto o cliente nao escolher outro.
  useEffect(() => {
    if (addressTouched || addresses.length === 0) return;
    const active = addresses.filter((a) => a.active !== false);
    setAddress(active.find((a) => a.isPrimary) ?? active[0] ?? null);
  }, [addresses, addressTouched]);

  const professional =
    selectedProfessional &&
    String(selectedProfessional.id) === String(professionalId)
      ? selectedProfessional
      : null;

  const service = useMemo(
    () =>
      professional?.Services?.find((s) => String(s.id) === String(serviceId)) ??
      null,
    [professional, serviceId],
  );

  const priceCents = useMemo(() => {
    if (!service) return 0;
    if (typeof service.price_cents === 'number' && service.price_cents > 0) {
      return service.price_cents;
    }
    return Math.round(Number(service.price) * 100) || 0;
  }, [service]);

  const status: CheckoutStatus = isLoadingProfessional
    ? 'loading'
    : professional && service
      ? 'ready'
      : 'not-found';

  // Cria o pagamento quando ha servico e endereco (e a cada nova tentativa).
  useEffect(() => {
    if (status !== 'ready' || !service || !address || !token) return;
    let cancelled = false;
    setClientSecret(null);
    setIntentError(null);
    setIsCreatingIntent(true);
    createPaymentIntent({
      professionalId: Number(professionalId),
      serviceId: service.id,
      selectedTime,
      addressId: address.id,
      appointmentId: appointmentId ? Number(appointmentId) : undefined,
    })
      .then((secret) => {
        if (!cancelled) setClientSecret(secret);
      })
      .catch((error) => {
        if (!cancelled) {
          setIntentError(
            getApiErrorMessage(error, 'Não foi possível iniciar o pagamento.'),
          );
        }
      })
      .finally(() => {
        if (!cancelled) setIsCreatingIntent(false);
      });
    return () => {
      cancelled = true;
    };
  }, [
    status,
    service,
    address,
    token,
    professionalId,
    selectedTime,
    appointmentId,
    attempt,
  ]);

  const chooseAddress = useCallback((next: Address) => {
    setAddressTouched(true);
    setAddress(next);
    setIsAddressModalVisible(false);
  }, []);

  const goBack = useCallback(() => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  }, [navigation]);

  return {
    user,
    status,
    professional,
    service,
    priceCents,
    selectedTime,
    imageUrl,
    address,
    isAddressModalVisible,
    openAddressModal: () => setIsAddressModalVisible(true),
    closeAddressModal: () => setIsAddressModalVisible(false),
    chooseAddress,
    clientSecret,
    intentError,
    isCreatingIntent,
    retry: () => setAttempt((n) => n + 1),
    goToLogin: () => navigation.navigate('Login'),
    goBack,
  };
}

export type CheckoutState = ReturnType<typeof useCheckout>;
