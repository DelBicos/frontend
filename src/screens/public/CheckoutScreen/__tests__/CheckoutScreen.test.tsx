import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Image } from 'react-native';
import CheckoutScreen from '../CheckoutScreen';
import CheckoutScreenWeb from '../CheckoutScreen.web';
import { ThemeMode, useThemeStore } from '@stores/Theme';
import { useUserStore } from '@stores/User';
import { useAddressStore } from '@stores/Address';
import { useProfessionalStore } from '@stores/Professional';
import { createPaymentIntent, confirmPayment } from '@api/payments';
import { Professional } from '@stores/Professional/types';
import { Address } from '@stores/Address/types';
import { User } from '@stores/User/types';

const mockNavigate = jest.fn();
const mockReplace = jest.fn();
const mockGoBack = jest.fn();
const mockReset = jest.fn();
const mockCanGoBack = jest.fn(() => true);
let mockParams: Record<string, unknown> = {};
const mockInitPaymentSheet = jest.fn();
const mockPresentPaymentSheet = jest.fn();
let mockWidth = 375;

jest.mock('@lib/helpers/httpClient', () => ({
  backendHttpClient: { get: jest.fn(), post: jest.fn() },
}));

jest.mock('@api/payments', () => ({
  ...jest.requireActual('@api/payments'),
  createPaymentIntent: jest.fn(),
  confirmPayment: jest.fn(),
}));

jest.mock('@stripe/stripe-react-native', () => ({
  StripeProvider: ({ children }: { children: React.ReactNode }) => children,
  useStripe: () => ({
    initPaymentSheet: mockInitPaymentSheet,
    presentPaymentSheet: mockPresentPaymentSheet,
  }),
}));

const mockStripeConfirm = jest.fn();
let mockStripeReady = true;

jest.mock('@lib/stripe/stripe', () => ({ stripePromise: null }));

// Formulario web do Stripe: um botao simula o evento de pronto do elemento.
jest.mock('@stripe/react-stripe-js', () => {
  const { Text } = jest.requireActual('react-native');
  return {
    Elements: ({ children }: { children: React.ReactNode }) => children,
    PaymentElement: ({ onReady }: { onReady: () => void }) => (
      <Text onPress={onReady}>Formulário do cartão</Text>
    ),
    useStripe: () =>
      mockStripeReady ? { confirmPayment: mockStripeConfirm } : null,
    useElements: () => (mockStripeReady ? {} : null),
  };
});

jest.mock('@lib/hooks/useBreakpoint', () => {
  const actual = jest.requireActual('@lib/hooks/useBreakpoint');
  return {
    ...actual,
    useBreakpoint: () => actual.getBreakpointInfo(mockWidth),
  };
});

jest.mock('@components/features/BookingSteps', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@components/features/AddressSelectionModal', () => {
  const { Text } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: ({
      visible,
      onClose,
      onAddressSelect,
    }: {
      visible: boolean;
      onClose: () => void;
      onAddressSelect: (a: unknown) => void;
    }) =>
      visible ? (
        <>
          <Text onPress={() => onAddressSelect(mockWorkAddress)}>
            Usar Av. B
          </Text>
          <Text onPress={onClose}>Fechar endereços</Text>
        </>
      ) : null,
  };
});

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    replace: mockReplace,
    goBack: mockGoBack,
    reset: mockReset,
    canGoBack: mockCanGoBack,
  }),
  useRoute: () => ({ params: mockParams }),
}));

const checkoutParams = {
  professionalId: '7',
  serviceId: 1,
  selectedTime: '2099-03-10T13:00:00',
  imageUrl: 'https://img/pro.png',
};

const checkoutUser = { id: 31, name: 'Cliente' } as unknown as User;

const checkoutProfessional = {
  id: 7,
  User: { name: 'João Silva', avatar_uri: 'https://img/avatar.png' },
  Services: [
    {
      id: 1,
      title: 'Instalação de chuveiro',
      price: '80.00',
      price_cents: 8000,
      duration: 90,
      active: true,
    },
    { id: 2, title: 'Tomada', price: '30.50', duration: 0, active: true },
  ],
} as unknown as Professional;

const homeAddress: Address = {
  id: 5,
  lat: 0,
  lng: 0,
  street: 'Rua A',
  number: '10',
  complement: 'Apto 2',
  neighborhood: 'Centro',
  city: 'Sorocaba',
  state: 'SP',
  country_iso: 'BR',
  postal_code: '18000000',
  isPrimary: true,
};

const workAddress: Address = {
  ...homeAddress,
  id: 6,
  street: 'Av. B',
  number: '200',
  complement: null,
  isPrimary: false,
};

// Variavel com prefixo mock para poder ser usada dentro do jest.mock.
const mockWorkAddress = workAddress;

const mockCreateIntent = createPaymentIntent as jest.MockedFunction<
  typeof createPaymentIntent
>;
const mockConfirm = confirmPayment as jest.MockedFunction<
  typeof confirmPayment
>;

describe('CheckoutScreen (app)', () => {
  const fetchProfessionalById = jest.fn();
  const fetchAddressesByUserId = jest.fn(() => Promise.resolve());

  beforeEach(() => {
    jest.clearAllMocks();
    mockWidth = 375;
    mockParams = { ...checkoutParams };
    mockCanGoBack.mockReturnValue(true);
    fetchProfessionalById.mockImplementation(() => {
      useProfessionalStore.setState({
        selectedProfessional: checkoutProfessional,
      });
      return Promise.resolve(checkoutProfessional);
    });
    useProfessionalStore.setState({
      selectedProfessional: null,
      fetchProfessionalById,
    });
    useAddressStore.setState({
      addresses: [workAddress, homeAddress],
      fetchAddressesByUserId,
    });
    useUserStore.setState({ user: checkoutUser, token: 'token' });
    mockCreateIntent.mockResolvedValue('pi_123_secret_abc');
    mockInitPaymentSheet.mockResolvedValue({});
    mockPresentPaymentSheet.mockResolvedValue({});
    mockConfirm.mockResolvedValue({
      message: 'ok',
      appointment: { id: 'AB12' },
    });
  });

  it('pede login quando não há usuário', () => {
    useUserStore.setState({ user: null });
    const { getByText } = render(<CheckoutScreen />);

    expect(getByText('Entre para continuar')).toBeTruthy();
    expect(mockNavigate).toHaveBeenCalledWith('Login');

    mockNavigate.mockClear();
    fireEvent.press(getByText('Entrar'));
    expect(mockNavigate).toHaveBeenCalledWith('Login');
  });

  it('mostra o carregamento e depois o resumo com o endereço principal', async () => {
    const { getByLabelText, findByText, getByText } = render(
      <CheckoutScreen />,
    );

    expect(getByLabelText('Carregando')).toBeTruthy();
    expect(await findByText('Instalação de chuveiro')).toBeTruthy();
    expect(fetchProfessionalById).toHaveBeenCalledWith(7);
    expect(fetchAddressesByUserId).toHaveBeenCalledWith(31);
    expect(getByText('com João Silva')).toBeTruthy();
    expect(getByText(/13:00 · duração de 1 h 30 min/)).toBeTruthy();
    expect(getByText('Rua A, 10 - Apto 2')).toBeTruthy();
    expect(getByText('Centro · Sorocaba/SP')).toBeTruthy();
    expect(await findByText(/Pagar R\$\s?80,00/)).toBeTruthy();
    expect(mockCreateIntent).toHaveBeenCalledWith({
      professionalId: 7,
      serviceId: 1,
      selectedTime: checkoutParams.selectedTime,
      addressId: 5,
      appointmentId: undefined,
    });
  });

  it('paga pelo PaymentSheet e abre o status do pagamento', async () => {
    mockParams = { ...checkoutParams, appointmentId: 99 };
    const { findByRole } = render(<CheckoutScreen />);

    const pay = await findByRole('button', { name: /Pagar/ });
    await waitFor(() =>
      expect(pay.props.accessibilityState?.disabled).toBe(false),
    );
    expect(mockCreateIntent).toHaveBeenCalledWith(
      expect.objectContaining({ appointmentId: '99' }),
    );
    fireEvent.press(pay);

    await waitFor(() =>
      expect(mockReplace).toHaveBeenCalledWith('PaymentStatus', {
        appointmentId: 'AB12',
        paymentIntentId: 'pi_123',
      }),
    );
    expect(mockConfirm).toHaveBeenCalledWith('pi_123');
  });

  it('não mostra erro quando a pessoa cancela o PaymentSheet', async () => {
    mockPresentPaymentSheet.mockResolvedValueOnce({
      error: { code: 'Canceled', message: 'cancelado' },
    });
    const { findByRole, queryByText } = render(<CheckoutScreen />);

    const pay = await findByRole('button', { name: /Pagar/ });
    await waitFor(() =>
      expect(pay.props.accessibilityState?.disabled).toBe(false),
    );
    fireEvent.press(pay);
    await waitFor(() => expect(mockPresentPaymentSheet).toHaveBeenCalled());
    expect(queryByText('cancelado')).toBeNull();
    expect(mockConfirm).not.toHaveBeenCalled();
  });

  it.each([
    [{ code: 'Failed', message: 'Cartão recusado.' }, 'Cartão recusado.'],
    [{ code: 'Failed', message: '' }, 'O pagamento não foi concluído.'],
  ])('mostra o erro do PaymentSheet', async (error, message) => {
    mockPresentPaymentSheet.mockResolvedValueOnce({ error });
    const { findByRole, findByText } = render(<CheckoutScreen />);

    const pay = await findByRole('button', { name: /Pagar/ });
    await waitFor(() =>
      expect(pay.props.accessibilityState?.disabled).toBe(false),
    );
    fireEvent.press(pay);
    expect(await findByText(message)).toBeTruthy();
  });

  it('mostra o erro quando a confirmação no servidor falha', async () => {
    mockConfirm.mockRejectedValueOnce(new Error('x'));
    const { findByRole, findByText } = render(<CheckoutScreen />);

    const pay = await findByRole('button', { name: /Pagar/ });
    await waitFor(() =>
      expect(pay.props.accessibilityState?.disabled).toBe(false),
    );
    fireEvent.press(pay);
    expect(
      await findByText('Não foi possível confirmar o agendamento.'),
    ).toBeTruthy();
  });

  it('avisa quando o PaymentSheet não abre', async () => {
    mockInitPaymentSheet.mockResolvedValueOnce({ error: { code: 'Failed' } });
    const { findByText } = render(<CheckoutScreen />);

    expect(
      await findByText('Não foi possível abrir o pagamento. Tente de novo.'),
    ).toBeTruthy();
  });

  it('mostra o erro ao criar o pagamento e tenta de novo', async () => {
    mockCreateIntent.mockRejectedValueOnce(new Error('x'));
    const { findByText, getByText } = render(<CheckoutScreen />);

    expect(
      await findByText('Não foi possível iniciar o pagamento.'),
    ).toBeTruthy();
    fireEvent.press(getByText('Tentar de novo'));
    expect(await findByText(/Pagar R\$/)).toBeTruthy();
    expect(mockCreateIntent).toHaveBeenCalledTimes(2);

    mockCreateIntent.mockRejectedValueOnce(new Error('x'));
    fireEvent.press(getByText('Trocar'));
    fireEvent.press(getByText('Usar Av. B'));
    fireEvent.press(await findByText('Escolher outro horário'));
    expect(mockGoBack).toHaveBeenCalled();
  });

  it('troca o endereço pelo modal', async () => {
    const { findByLabelText, getByText, queryByText } = render(
      <CheckoutScreen />,
    );

    fireEvent.press(await findByLabelText('Trocar endereço'));
    fireEvent.press(getByText('Fechar endereços'));
    expect(queryByText('Usar Av. B')).toBeNull();

    fireEvent.press(await findByLabelText('Trocar endereço'));
    fireEvent.press(getByText('Usar Av. B'));
    expect(getByText('Av. B, 200')).toBeTruthy();
    await waitFor(() =>
      expect(mockCreateIntent).toHaveBeenLastCalledWith(
        expect.objectContaining({ addressId: 6 }),
      ),
    );
  });

  it('pede o endereço quando a pessoa não tem nenhum', async () => {
    useAddressStore.setState({ addresses: [] });
    const { findByText, getByText } = render(<CheckoutScreen />);

    expect(
      await findByText(
        'Escolha o local do atendimento para liberar o pagamento.',
      ),
    ).toBeTruthy();
    fireEvent.press(getByText('Escolher endereço'));
    expect(getByText('Usar Av. B')).toBeTruthy();
    expect(mockCreateIntent).not.toHaveBeenCalled();
  });

  it('mostra o preparo do pagamento sem token', async () => {
    useUserStore.setState({ token: null });
    const { findByText } = render(<CheckoutScreen />);

    expect(await findByText('Preparando o pagamento…')).toBeTruthy();
  });

  it('usa o preço em reais e as iniciais quando a foto falha', async () => {
    mockParams = { ...checkoutParams, serviceId: '2' };
    mockWidth = 1280;
    const { findByText, UNSAFE_getAllByType, getByText, getAllByText } = render(
      <CheckoutScreen />,
    );

    expect(await findByText('Tomada')).toBeTruthy();
    expect(getAllByText(/R\$\s?30,50/).length).toBeGreaterThan(0);
    fireEvent(UNSAFE_getAllByType(Image)[0], 'error');
    expect(getByText('JS')).toBeTruthy();
  });

  it('mostra serviço indisponível e volta para a home sem histórico', async () => {
    mockParams = { ...checkoutParams, serviceId: 404 };
    mockCanGoBack.mockReturnValue(false);
    const { findByText } = render(<CheckoutScreen />);

    expect(await findByText('Serviço indisponível')).toBeTruthy();
    fireEvent.press(await findByText('Voltar'));
    expect(mockReset).toHaveBeenCalledWith({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  });
});

describe('CheckoutScreen (web)', () => {
  const fetchProfessionalById = jest.fn();

  const renderReady = async () => {
    const utils = render(<CheckoutScreenWeb />);
    fireEvent.press(await utils.findByText('Formulário do cartão'));
    const pay = utils.getByRole('button', { name: /Pagar/ });
    await waitFor(() =>
      expect(pay.props.accessibilityState?.disabled).toBe(false),
    );
    return { ...utils, pay };
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockWidth = 375;
    mockStripeReady = true;
    mockParams = { ...checkoutParams };
    Object.defineProperty(window, 'location', {
      value: { origin: 'https://app.local' },
      configurable: true,
    });
    fetchProfessionalById.mockImplementation(() => {
      useProfessionalStore.setState({
        selectedProfessional: checkoutProfessional,
      });
      return Promise.resolve(checkoutProfessional);
    });
    useProfessionalStore.setState({
      selectedProfessional: null,
      fetchProfessionalById,
    });
    useAddressStore.setState({
      addresses: [homeAddress],
      fetchAddressesByUserId: jest.fn(() => Promise.resolve()),
    });
    useUserStore.setState({ user: checkoutUser, token: 'token' });
    useThemeStore.setState({ theme: ThemeMode.LIGHT });
    mockCreateIntent.mockResolvedValue('pi_web_secret_x');
    mockConfirm.mockResolvedValue({
      message: 'ok',
      appointment: { id: 'WEB1' },
    });
  });

  it('confirma o cartão na página e abre o status', async () => {
    mockStripeConfirm.mockResolvedValueOnce({
      paymentIntent: { id: 'pi_web', client_secret: 'pi_web_secret_x' },
    });
    const { pay } = await renderReady();

    fireEvent.press(pay);
    await waitFor(() =>
      expect(mockReplace).toHaveBeenCalledWith('PaymentStatus', {
        appointmentId: 'WEB1',
        paymentIntentId: 'pi_web',
      }),
    );
    expect(mockStripeConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        confirmParams: { return_url: 'https://app.local/payment-status' },
        redirect: 'if_required',
      }),
    );
  });

  it('usa o client_secret quando o Stripe não devolve o id', async () => {
    useThemeStore.setState({ theme: ThemeMode.DARK });
    mockStripeConfirm.mockResolvedValueOnce({
      paymentIntent: { client_secret: 'pi_sec_secret_y' },
    });
    const { pay } = await renderReady();

    fireEvent.press(pay);
    await waitFor(() => expect(mockConfirm).toHaveBeenCalledWith('pi_sec'));
  });

  it('não faz nada quando o Stripe não devolve o pagamento', async () => {
    mockStripeConfirm.mockResolvedValueOnce({});
    const { pay } = await renderReady();

    fireEvent.press(pay);
    await waitFor(() => expect(mockStripeConfirm).toHaveBeenCalled());
    expect(mockConfirm).not.toHaveBeenCalled();
  });

  it.each([
    [{ type: 'card_error', message: 'Cartão recusado.' }, 'Cartão recusado.'],
    [{ type: 'validation_error' }, 'Confira os dados do cartão.'],
    [
      { type: 'api_error', message: 'x' },
      'O pagamento não foi concluído. Tente de novo.',
    ],
  ])('mostra o erro do Stripe %j', async (error, message) => {
    mockStripeConfirm.mockResolvedValueOnce({ error });
    const { pay, findByText } = await renderReady();

    fireEvent.press(pay);
    expect(await findByText(message)).toBeTruthy();
  });

  it('mostra o erro quando a confirmação no servidor falha', async () => {
    mockStripeConfirm.mockResolvedValueOnce({ paymentIntent: { id: 'pi' } });
    mockConfirm.mockRejectedValueOnce(new Error('x'));
    const { pay, findByText } = await renderReady();

    fireEvent.press(pay);
    expect(
      await findByText('Não foi possível confirmar o agendamento.'),
    ).toBeTruthy();
  });

  it('mantém o botão desabilitado enquanto o Stripe não carrega', async () => {
    mockStripeReady = false;
    const { findByText, getByRole } = render(<CheckoutScreenWeb />);

    fireEvent.press(await findByText('Formulário do cartão'));
    const pay = getByRole('button', { name: /Pagar/ });
    expect(pay.props.accessibilityState?.disabled).toBe(true);
    fireEvent(pay, 'press');
    expect(mockStripeConfirm).not.toHaveBeenCalled();
  });
});
