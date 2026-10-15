import React, { useMemo, useState } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTicketStore } from '@stores/Ticket/Ticket';
import { useUserStore } from '@stores/User';
import { TicketCategory } from '@stores/Ticket/types';
import { TicketForm, TicketSuccessModal } from '@components/features/Tickets';
import type { NavigationParams } from '@screens/types';

type CreateTicketRouteProp = RouteProp<NavigationParams, 'CreateTicket'>;

const CLIENT_CATEGORIES: TicketCategory[] = [
  'AGENDAMENTO',
  'PAGAMENTO',
  'SERVICO',
  'PRESTADOR',
  'SUGESTAO',
  'OUTROS',
];

const PROFESSIONAL_CATEGORIES: TicketCategory[] = [
  'AGENDAMENTO',
  'PAGAMENTO',
  'SERVICO',
  'CLIENTE',
  'SUGESTAO',
  'OUTROS',
];

export const CreateTicketScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<CreateTicketRouteProp>();

  const appointmentShortId = route.params?.appointmentShortId;
  const contextLabel = route.params?.contextLabel;

  const user = useUserStore((state) => state.user);
  const isProfessional = Boolean(user?.professional_id);

  const { createTicket, isSubmitting, error, clearError } = useTicketStore();

  const [successVisible, setSuccessVisible] = useState(false);
  const [createdCode, setCreatedCode] = useState<string | null>(null);

  const availableCategories = useMemo(
    () => (isProfessional ? PROFESSIONAL_CATEGORIES : CLIENT_CATEGORIES),
    [isProfessional],
  );

  const initialValues = useMemo(
    () => ({
      title: contextLabel ? `Problema com ${contextLabel}` : '',
      category: (appointmentShortId
        ? 'AGENDAMENTO'
        : null) as TicketCategory | null,
    }),
    [appointmentShortId, contextLabel],
  );

  const contextBanner = appointmentShortId
    ? `Chamado relacionado ao agendamento ${contextLabel ?? `#${appointmentShortId}`}`
    : null;

  const handleSubmit = async (values: {
    title: string;
    description: string;
    category: TicketCategory;
  }) => {
    try {
      const ticket = await createTicket({
        ...values,
        appointment_short_id: appointmentShortId,
      });

      setCreatedCode(ticket.ticket_code);
      setSuccessVisible(true);
    } catch {}
  };

  const handleViewTickets = () => {
    setSuccessVisible(false);
    navigation.replace('TicketsList');
  };

  const handleCloseSuccess = () => {
    setSuccessVisible(false);
    if (appointmentShortId) {
      navigation.goBack();
    } else {
      navigation.replace('TicketsList');
    }
  };

  return (
    <>
      <TicketForm
        initialValues={initialValues}
        availableCategories={availableCategories}
        contextBanner={contextBanner}
        isSubmitting={isSubmitting}
        externalError={error}
        onSubmit={handleSubmit}
        onCancel={() => {
          clearError();
          navigation.goBack();
        }}
      />

      <TicketSuccessModal
        visible={successVisible}
        ticketCode={createdCode}
        onViewTickets={handleViewTickets}
        onClose={handleCloseSuccess}
      />
    </>
  );
};

export default CreateTicketScreen;
