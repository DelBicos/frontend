import React, { useEffect, useState } from 'react';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useUserStore } from '@stores/User';
import { useAppointmentStore, InvoiceData } from '@stores/Appointment';
import { NavigationParams } from '@screens/types';
import PaymentResultView, { PaymentResultStatus } from './PaymentResultView';

type PaymentStatusRouteParams = NavigationParams['PaymentStatus'];

/**
 * App: o checkout ja confirmou o pagamento no servidor e passa o
 * agendamento criado; aqui so carrega o recibo para o resumo.
 */
function PaymentStatusScreen() {
  const route =
    useRoute<RouteProp<{ params: PaymentStatusRouteParams }, 'params'>>();
  const { user } = useUserStore();
  const { fetchInvoice } = useAppointmentStore();
  const appointmentId = route.params?.appointmentId;

  const [status, setStatus] = useState<PaymentResultStatus>(
    appointmentId ? 'loading' : 'error',
  );
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);

  useEffect(() => {
    if (!appointmentId || !user) return;
    let cancelled = false;
    // Sem recibo o pagamento continua valido: mostra o sucesso sem o resumo.
    fetchInvoice(Number(appointmentId)).then((data) => {
      if (cancelled) return;
      setInvoice(data);
      setStatus('success');
    });
    return () => {
      cancelled = true;
    };
  }, [appointmentId, user, fetchInvoice]);

  return (
    <PaymentResultView
      status={status}
      invoice={invoice}
      message="Não encontramos os dados deste pagamento. Confira em Meus agendamentos."
    />
  );
}

export default PaymentStatusScreen;
