import { MIN_ADVANCE_HOURS } from '@lib/booking';
import {
  DISPUTE_WINDOW_DAYS,
  FREE_CANCELLATION_HOURS,
  LATE_CANCELLATION_HOURS,
  LATE_RETENTION_PERCENT,
  MID_RETENTION_PERCENT,
  NO_SHOW_GRACE_MINUTES,
  NO_SHOW_RETENTION_PERCENT,
  PENDING_RESPONSE_HOURS,
  RESCHEDULE_MIN_HOURS,
} from '@lib/appointments';

export interface TermsSection {
  id: string;
  title: string;
  /** Paragrafos de texto corrido. */
  paragraphs?: string[];
  /** Itens de lista (uma linha cada). */
  items?: string[];
}

/** Faixas da politica de cancelamento pelo cliente, depois que o profissional aceita. */
export const CANCELLATION_TIERS: { when: string; result: string }[] = [
  {
    when: `${FREE_CANCELLATION_HOURS} horas ou mais antes do horário`,
    result: 'Sem custo: você recebe 100% do valor de volta.',
  },
  {
    when: `Entre ${FREE_CANCELLATION_HOURS} horas e ${LATE_CANCELLATION_HOURS} horas antes`,
    result: `O profissional retém ${MID_RETENTION_PERCENT}% do valor; você recebe o restante.`,
  },
  {
    when: `Menos de ${LATE_CANCELLATION_HOURS} horas antes`,
    result: `O profissional retém ${LATE_RETENTION_PERCENT}% do valor; você recebe o restante.`,
  },
  {
    when: 'Cliente não compareceu',
    result: `O profissional retém ${NO_SHOW_RETENTION_PERCENT}% do valor.`,
  },
];

export const TERMS_SECTIONS: TermsSection[] = [
  {
    id: 'sobre',
    title: '1. Sobre o DelBicos',
    paragraphs: [
      'O DelBicos é uma plataforma que aproxima clientes e profissionais autônomos para a contratação de serviços. O serviço em si é prestado e de responsabilidade do profissional; o DelBicos cuida do agendamento, do pagamento e da comunicação entre as partes.',
    ],
  },
  {
    id: 'agendamento',
    title: '2. Agendamento e pagamento',
    items: [
      `O agendamento exige pelo menos ${MIN_ADVANCE_HOURS} horas de antecedência.`,
      'Ao agendar, o valor é apenas reservado no cartão de crédito. Nada é cobrado nesse momento.',
      `O profissional tem até ${PENDING_RESPONSE_HOURS} horas para aceitar ou recusar. A cobrança só acontece quando ele aceita.`,
      `Se o profissional recusar, ou não responder em ${PENDING_RESPONSE_HOURS} horas, o pedido é cancelado, a reserva é liberada e você não paga nada.`,
      'O valor do serviço é definido pelo profissional e calculado pelo sistema; ele não pode ser alterado pelo aplicativo do cliente.',
    ],
  },
  {
    id: 'cancelamento-cliente',
    title: '3. Cancelamento pelo cliente',
    paragraphs: [
      'Enquanto o profissional não aceitou o pedido, você pode cancelar sem custo algum: como nada foi cobrado, a reserva no cartão é simplesmente liberada.',
      'Depois que o profissional aceita, vale a tabela abaixo, contada a partir do horário marcado. Antes de confirmar o cancelamento, o aplicativo mostra exatamente quanto será retido e quanto será devolvido.',
    ],
  },
  {
    id: 'cancelamento-profissional',
    title: '4. Cancelamento pelo profissional',
    items: [
      'Se o profissional cancelar um serviço já aceito, o cliente recebe o reembolso total, em qualquer prazo.',
      'Cancelamentos de serviços aceitos ficam registrados no perfil do profissional e podem afetar sua reputação na plataforma.',
    ],
  },
  {
    id: 'reagendamento',
    title: '5. Reagendamento',
    items: [
      `Cliente ou profissional podem pedir um novo horário com pelo menos ${RESCHEDULE_MIN_HOURS} horas de antecedência.`,
      'O novo horário só vale se a outra parte aceitar. Enquanto isso, continua valendo o horário original.',
      'Se a outra parte recusar, ou se o prazo para reagendar já passou, é possível manter o horário ou cancelar conforme as regras acima.',
    ],
  },
  {
    id: 'nao-comparecimento',
    title: '6. Não comparecimento',
    items: [
      `Se o cliente não estiver no local, o profissional pode registrar o não comparecimento ${NO_SHOW_GRACE_MINUTES} minutos após o horário marcado.`,
      `Nesse caso o valor fica retido pelo profissional (${NO_SHOW_RETENTION_PERCENT}%).`,
      `O cliente pode contestar o registro em até ${DISPUTE_WINDOW_DAYS} dias (veja Disputas).`,
    ],
  },
  {
    id: 'disputas',
    title: '7. Disputas',
    items: [
      `O cliente pode abrir uma disputa em até ${DISPUTE_WINDOW_DAYS} dias depois de um serviço concluído, de um não comparecimento registrado, ou quando o profissional não aparece (${LATE_CANCELLATION_HOURS} horas depois do horário marcado, sem registro).`,
      'É preciso informar o motivo e descrever o que aconteceu. Há uma disputa por agendamento.',
      'A equipe do DelBicos analisa o caso e decide por reembolso total, reembolso parcial ou pela manutenção do valor, sempre com uma justificativa que fica visível para as duas partes.',
    ],
  },
  {
    id: 'estornos',
    title: '8. Estornos e prazos',
    paragraphs: [
      'Quando a reserva é liberada, o valor volta a ficar disponível no seu limite do cartão. Quando há estorno de uma cobrança já feita, o prazo para aparecer na fatura depende do banco emissor e pode levar alguns dias.',
    ],
  },
  {
    id: 'direitos',
    title: '9. Seus direitos como consumidor',
    paragraphs: [
      'As regras acima não afastam os direitos previstos no Código de Defesa do Consumidor e na legislação aplicável. Em caso de conflito, prevalece a lei.',
    ],
  },
  {
    id: 'privacidade',
    title: '10. Privacidade',
    paragraphs: [
      'Usamos seus dados apenas para operar a plataforma: cadastro, agendamentos, pagamentos e comunicação entre cliente e profissional. O endereço exato de um profissional não é exibido publicamente no perfil dele.',
    ],
  },
];
