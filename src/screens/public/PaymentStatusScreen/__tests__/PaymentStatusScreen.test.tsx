import React from 'react';
import { Platform } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import PaymentStatusScreen from '../PaymentStatusScreen';
import PaymentStatusScreenWeb from '../PaymentStatusScreen.web';
import { useUserStore } from '@stores/User';
import { useAppointmentStore, InvoiceData } from '@stores/Appointment';
import { User } from '@stores/User/types';
import { confirmPayment } from '@api/payments';
import { generatePDF } from '@lib/helpers/fileGenerator';
import { downloadFile } from '@lib/helpers/shareHelperSimple';
import { URLSearchParams as NodeURLSearchParams } from 'url';

const mockReset = jest.fn();
let mockParams: Record<string, unknown> | undefined = {};
const mockRetrieve = jest.fn();
// O Stripe devolve sempre a mesma instancia, como o useStripe real.
const mockStripe = { retrievePaymentIntent: mockRetrieve };
let mockStripeReady = true;

jest.mock('@lib/helpers/httpClient', () => ({
  backendHttpClient: { get: jest.fn(), post: jest.fn() },
}));

jest.mock('@api/payments', () => ({ confirmPayment: jest.fn() }));

jest.mock('@lib/helpers/fileGenerator', () => ({ generatePDF: jest.fn() }));

jest.mock('@lib/helpers/shareHelperSimple', () => ({
  downloadFile: jest.fn(),
}));

jest.mock('@components/features/InvoiceTemplate', () => ({
  __esModule: true,
  default: () => '<html></html>',
}));

jest.mock('@components/features/BookingSteps', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@lib/stripe/stripe', () => ({ stripePromise: null }));

jest.mock('@stripe/react-stripe-js', () => ({
  Elements: ({ children }: { children: React.ReactNode }) => children,
  useStripe: () => (mockStripeReady ? mockStripe : null),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ reset: mockReset, navigate: jest.fn() }),
  useRoute: () => ({ params: mockParams }),
}));

const invoice: InvoiceData = {
  invoiceNumber: 'INV-1',
  date: '10/03/2099',
  customerName: 'Cliente',
  customerCpf: '',
  customerAddress: 'Rua A, 10',
  professionalName: 'João Silva',
  professionalCpf: '',
  serviceName: 'Tomada',
  serviceDescription: '',
  servicePrice: 30,
  serviceDate: '10/03/2099',
  serviceTime: '13:00',
  total: 30,
};

const mockConfirm = confirmPayment as jest.MockedFunction<
  typeof confirmPayment
>;
const mockGeneratePDF = generatePDF as jest.MockedFunction<typeof generatePDF>;
const mockDownload = downloadFile as jest.MockedFunction<typeof downloadFile>;

const originalURLSearchParams = global.URLSearchParams;

const setSearch = (search: string) =>
  Object.defineProperty(window, 'location', {
    value: { search, origin: 'https://app.local' },
    configurable: true,
  });

describe('PaymentStatusScreen', () => {
  const fetchInvoice = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockParams = { appointmentId: '12' };
    mockStripeReady = true;
    setSearch('');
    fetchInvoice.mockResolvedValue(invoice);
    useAppointmentStore.setState({ fetchInvoice });
    useUserStore.setState({
      user: { id: 1, name: 'Cliente' } as unknown as User,
    });
  });

  describe('app', () => {
    it('carrega o recibo e mostra o resumo do pedido', async () => {
      const { getByText, findByText } = render(<PaymentStatusScreen />);

      expect(getByText('Confirmando seu pagamento…')).toBeTruthy();
      expect(await findByText('Pedido enviado!')).toBeTruthy();
      expect(fetchInvoice).toHaveBeenCalledWith(12);
      expect(getByText('10/03/2099, 13:00')).toBeTruthy();
      expect(getByText('Rua A, 10')).toBeTruthy();
      expect(getByText(/João Silva precisa aceitar/)).toBeTruthy();
    });

    it('mostra o sucesso sem resumo quando não há recibo', async () => {
      fetchInvoice.mockResolvedValueOnce(null);
      const { findByText, queryByText } = render(<PaymentStatusScreen />);

      expect(await findByText(/O profissional precisa aceitar/)).toBeTruthy();
      expect(queryByText('Salvar recibo')).toBeNull();
    });

    it('mostra erro sem o agendamento na rota', () => {
      mockParams = undefined;
      const { getByText } = render(<PaymentStatusScreen />);

      expect(getByText('Não foi possível concluir o pagamento')).toBeTruthy();
      expect(
        getByText(
          'Não encontramos os dados deste pagamento. Confira em Meus agendamentos.',
        ),
      ).toBeTruthy();
    });

    it('salva o recibo em PDF', async () => {
      mockGeneratePDF.mockResolvedValueOnce('file://recibo.pdf');
      mockDownload.mockResolvedValueOnce(true);
      const { findByText } = render(<PaymentStatusScreen />);

      fireEvent.press(await findByText('Salvar recibo'));
      expect(await findByText('Recibo salvo.')).toBeTruthy();
      expect(mockDownload).toHaveBeenCalledWith(
        'file://recibo.pdf',
        'recibo-INV-1.pdf',
      );
    });

    it('avisa quando o recibo não é gerado', async () => {
      mockGeneratePDF.mockRejectedValueOnce(new Error('x'));
      const { findByText } = render(<PaymentStatusScreen />);

      fireEvent.press(await findByText('Salvar recibo'));
      expect(
        await findByText('Não foi possível gerar o recibo. Tente de novo.'),
      ).toBeTruthy();
    });

    it('imprime o recibo no web', async () => {
      jest.replaceProperty(Platform, 'OS', 'web');
      const { findByText, queryByText } = render(<PaymentStatusScreen />);

      fireEvent.press(await findByText('Imprimir recibo'));
      await waitFor(() => expect(mockGeneratePDF).toHaveBeenCalled());
      expect(mockDownload).not.toHaveBeenCalled();
      expect(queryByText('Recibo salvo.')).toBeNull();
      jest.restoreAllMocks();
    });

    it('leva aos agendamentos ou ao início limpando o histórico', async () => {
      const { findByText, getByText } = render(<PaymentStatusScreen />);

      fireEvent.press(await findByText('Ver meus agendamentos'));
      expect(mockReset).toHaveBeenCalledWith({
        index: 1,
        routes: [{ name: 'Home' }, { name: 'MySchedules' }],
      });

      fireEvent.press(getByText('Voltar ao início'));
      expect(mockReset).toHaveBeenLastCalledWith({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    });
  });

  describe('web', () => {
    it('usa o agendamento vindo do checkout', async () => {
      const { findByText } = render(<PaymentStatusScreenWeb />);

      expect(await findByText('Pedido enviado!')).toBeTruthy();
      expect(fetchInvoice).toHaveBeenCalledWith('12');
      expect(mockRetrieve).not.toHaveBeenCalled();
    });

    it('espera o login antes de verificar', () => {
      useUserStore.setState({ user: null });
      const { getByText } = render(<PaymentStatusScreenWeb />);

      expect(getByText('Confirmando seu pagamento…')).toBeTruthy();
      expect(fetchInvoice).not.toHaveBeenCalled();
    });

    it('espera o Stripe carregar no retorno do redirecionamento', () => {
      mockParams = {};
      mockStripeReady = false;
      const { getByText } = render(<PaymentStatusScreenWeb />);

      expect(getByText('Confirmando seu pagamento…')).toBeTruthy();
    });

    it('mostra erro sem os dados do pagamento na URL', async () => {
      mockParams = {};
      const { findByText } = render(<PaymentStatusScreenWeb />);

      expect(
        await findByText(
          'Não encontramos os dados deste pagamento. Confira em Meus agendamentos.',
        ),
      ).toBeTruthy();
    });

    describe('com o pagamento na URL', () => {
      beforeEach(() => {
        // O URLSearchParams do React Native nao implementa get(); no navegador
        // existe, entao usa a implementacao do Node.
        global.URLSearchParams =
          NodeURLSearchParams as unknown as typeof URLSearchParams;
        mockParams = {};
        setSearch('?payment_intent=pi_1&payment_intent_client_secret=sec_1');
      });

      it.each(['succeeded', 'requires_capture'])(
        'confirma no servidor quando o status é %s',
        async (status) => {
          mockRetrieve.mockResolvedValueOnce({ paymentIntent: { status } });
          mockConfirm.mockResolvedValueOnce({
            message: 'ok',
            appointment: { id: 'AP1' },
          });
          const { findByText } = render(<PaymentStatusScreenWeb />);

          expect(await findByText('Pedido enviado!')).toBeTruthy();
          expect(mockRetrieve).toHaveBeenCalledWith('sec_1');
          expect(mockConfirm).toHaveBeenCalledWith('pi_1');
          expect(fetchInvoice).toHaveBeenCalledWith('AP1');
        },
      );

      it('mostra o pagamento em processamento', async () => {
        mockRetrieve.mockResolvedValueOnce({
          paymentIntent: { status: 'processing' },
        });
        const { findByText } = render(<PaymentStatusScreenWeb />);

        expect(await findByText('Pagamento em processamento')).toBeTruthy();
      });

      it('mostra o pagamento recusado', async () => {
        mockRetrieve.mockResolvedValueOnce({
          paymentIntent: { status: 'canceled' },
        });
        const { findByText } = render(<PaymentStatusScreenWeb />);

        expect(
          await findByText(
            'O pagamento foi recusado ou cancelado. Nenhum valor foi cobrado.',
          ),
        ).toBeTruthy();
      });

      it('mostra o erro devolvido pelo Stripe', async () => {
        mockRetrieve.mockResolvedValueOnce({
          error: new Error('Falha no Stripe.'),
        });
        const { findByText } = render(<PaymentStatusScreenWeb />);

        expect(await findByText('Falha no Stripe.')).toBeTruthy();
      });

      afterEach(() => {
        global.URLSearchParams = originalURLSearchParams;
      });

      it('usa a mensagem padrão para erros sem texto', async () => {
        mockRetrieve.mockRejectedValueOnce({});
        const { findByText } = render(<PaymentStatusScreenWeb />);

        expect(
          await findByText('Ocorreu um erro ao processar o pagamento.'),
        ).toBeTruthy();
      });
    });
  });
});
