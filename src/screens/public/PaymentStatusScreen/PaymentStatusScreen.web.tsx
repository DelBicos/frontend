import React, { useEffect, useState } from 'react';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Elements, useStripe } from '@stripe/react-stripe-js';
import { stripePromise } from '@lib/stripe/stripe';
import { confirmPayment } from '@api/payments';
import { getApiErrorMessage } from '@api/errors';
import { useUserStore } from '@stores/User';
import { useAppointmentStore, InvoiceData } from '@stores/Appointment';
import { NavigationParams } from '@screens/types';
import PaymentResultView, { PaymentResultStatus } from './PaymentResultView';

type PaymentStatusRouteParams = NavigationParams['PaymentStatus'];

/**
 * Web: chega aqui de duas formas.
 * - Do checkout, com o agendamento ja criado (appointmentId).
 * - Do redirecionamento do Stripe (Pix, 3D Secure...), com o pagamento na
 *   URL: verifica o status e confirma no servidor (idempotente).
 */
function PaymentStatusLogic() {
  const route =
    useRoute<RouteProp<{ params: PaymentStatusRouteParams }, 'params'>>();
  const stripe = useStripe();
  const { user } = useUserStore();
  const { fetchInvoice } = useAppointmentStore();
  const appointmentId = route.params?.appointmentId;

  const [status, setStatus] = useState<PaymentResultStatus>('loading');
  const [message, setMessage] = useState<string | null>(null);
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const finish = async (id: number) => {
      const data = await fetchInvoice(id);
      if (cancelled) return;
      setInvoice(data);
      setStatus('success');
    };

    const verify = async () => {
      if (appointmentId) {
        await finish(Number(appointmentId));
        return;
      }
      if (!stripe) return;

      const params = new URLSearchParams(window.location.search);
      const clientSecret = params.get('payment_intent_client_secret');
      const paymentIntentId = params.get('payment_intent');
      if (!clientSecret || !paymentIntentId) {
        setMessage(
          'Não encontramos os dados deste pagamento. Confira em Meus agendamentos.',
        );
        setStatus('error');
        return;
      }

      try {
        const { error, paymentIntent } =
          await stripe.retrievePaymentIntent(clientSecret);
        if (error) throw error;
        if (paymentIntent?.status === 'processing') {
          if (!cancelled) setStatus('processing');
          return;
        }
        if (paymentIntent?.status !== 'succeeded') {
          if (!cancelled) {
            setMessage(
              'O pagamento foi recusado ou cancelado. Nenhum valor foi cobrado.',
            );
            setStatus('error');
          }
          return;
        }
        const { appointment } = await confirmPayment(paymentIntentId);
        await finish(appointment.id);
      } catch (err: any) {
        if (cancelled) return;
        setMessage(
          getApiErrorMessage(
            err,
            err?.message || 'Ocorreu um erro ao processar o pagamento.',
          ),
        );
        setStatus('error');
      }
    };

    verify();
    return () => {
      cancelled = true;
    };
  }, [appointmentId, stripe, user, fetchInvoice]);

  return (
    <PaymentResultView status={status} message={message} invoice={invoice} />
  );
}

function PaymentStatusScreen() {
  return (
    <Elements stripe={stripePromise}>
      <PaymentStatusLogic />
    </Elements>
  );
}

export default PaymentStatusScreen;
