import React from 'react';
import type { ChatBotContext, QuickReplyOption } from '@stores/ChatBot/types';
import { QuickReplies } from '../QuickReplies';

interface Props {
  query: NonNullable<ChatBotContext['appointmentQuery']>;
  onSelect: (value: string, label: string) => void;
  disabled: boolean;
}

export function AppointmentQueryReplies({ query, onSelect, disabled }: Props) {
  const options: QuickReplyOption[] = [];
  if (query.hasMore) {
    options.push({
      label: 'Ver mais agendamentos',
      value: 'ver mais agendamentos',
    });
  }
  if (query.offset > 0) {
    options.push({ label: 'Página anterior', value: 'página anterior' });
  }
  options.push(
    { label: 'Todos os agendamentos', value: 'todos os meus agendamentos' },
    { label: 'Pendentes', value: 'meus agendamentos pendentes' },
    { label: 'Confirmados', value: 'meus agendamentos confirmados' },
    { label: 'Concluídos', value: 'meus agendamentos concluídos' },
    { label: 'Cancelados', value: 'meus agendamentos cancelados' },
  );
  return (
    <QuickReplies
      quickReplies={options}
      onSelect={onSelect}
      disabled={disabled}
    />
  );
}
