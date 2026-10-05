import { MIN_ADVANCE_HOURS } from '@lib/booking';
import {
  DISPUTE_WINDOW_DAYS,
  FREE_CANCELLATION_HOURS,
  LATE_CANCELLATION_HOURS,
  LATE_RETENTION_PERCENT,
  MID_RETENTION_PERCENT,
  NO_SHOW_GRACE_MINUTES,
  PENDING_RESPONSE_HOURS,
  RESCHEDULE_MIN_HOURS,
} from '@lib/appointments';

import type { FontAwesomeName } from '@utils/iconNames';
export interface FaqQuestion {
  id: string;
  q: string;
  a: string;
}

export interface FaqTopic {
  id: string;
  title: string;
  /** Icone FontAwesome. */
  icon: FontAwesomeName;
  questions: FaqQuestion[];
}

export const FAQ_TOPICS: FaqTopic[] = [
  {
    id: 'inicio',
    title: 'Primeiros passos',
    icon: 'compass',
    questions: [
      {
        id: 'i1',
        q: 'Como encontro um profissional?',
        a: 'Na página inicial ou em "Buscar", escolha o serviço que precisa, selecione uma data e veja os profissionais disponíveis perto de você. Depois é só escolher o horário e agendar.',
      },
      {
        id: 'i2',
        q: 'Preciso de uma conta para agendar?',
        a: 'Você pode navegar pelos serviços e profissionais sem conta. Para agendar e pagar, é preciso entrar ou se cadastrar.',
      },
      {
        id: 'i3',
        q: 'Não sei qual serviço escolher. E agora?',
        a: 'Descreva o problema com suas palavras na busca, por exemplo "vazamento na pia", e use a busca inteligente: ela sugere os serviços e profissionais mais adequados.',
      },
    ],
  },
  {
    id: 'agendamentos',
    title: 'Agendamentos e pagamentos',
    icon: 'calendar-check-o',
    questions: [
      {
        id: 'p1',
        q: 'Como funciona o pagamento?',
        a: `O pagamento é processado de forma segura através do Stripe. Aceitamos Cartão de Crédito. O valor fica apenas reservado no cartão quando você agenda e só é cobrado quando o profissional aceita o pedido. Se ele recusar ou não responder em ${PENDING_RESPONSE_HOURS} horas, a reserva é liberada e nada é cobrado.`,
      },
      {
        id: 'p4',
        q: 'Com quanta antecedência preciso agendar?',
        a: `Com pelo menos ${MIN_ADVANCE_HOURS} horas de antecedência. Só aparecem horários que respeitam esse prazo.`,
      },
      {
        id: 'p2',
        q: 'Posso cancelar um agendamento? Quanto vou pagar?',
        a: `Pode. Em "Meus Agendamentos", abra o serviço e toque em "Cancelar agendamento": o app mostra o valor exato antes de você confirmar. Enquanto o profissional não aceitou, o cancelamento é sempre grátis. Depois que ele aceita: com ${FREE_CANCELLATION_HOURS} horas ou mais de antecedência não há custo; entre ${FREE_CANCELLATION_HOURS}h e ${LATE_CANCELLATION_HOURS}h o profissional retém ${MID_RETENTION_PERCENT}% do valor; com menos de ${LATE_CANCELLATION_HOURS}h ele retém ${LATE_RETENTION_PERCENT}%. Se for o profissional a cancelar, você recebe o reembolso total.`,
      },
      {
        id: 'p5',
        q: 'Como reagendo um serviço?',
        a: `Em "Meus Agendamentos", abra o serviço e toque em "Reagendar". Só é possível com pelo menos ${RESCHEDULE_MIN_HOURS} horas de antecedência e o novo horário precisa ser aceito pela outra parte. Até lá, vale o horário original.`,
      },
      {
        id: 'p6',
        q: 'E se eu não puder comparecer, ou o profissional não aparecer?',
        a: `Se você não comparecer, o profissional pode registrar a falta ${NO_SHOW_GRACE_MINUTES} minutos após o horário e o valor fica retido; se isso não procede, você pode contestar. Se o profissional é quem não aparece, abra uma disputa ${LATE_CANCELLATION_HOURS} horas depois do horário marcado e a equipe analisa o reembolso.`,
      },
      {
        id: 'p7',
        q: 'Como abro uma disputa?',
        a: `Em até ${DISPUTE_WINDOW_DAYS} dias após um serviço concluído (ou de um não comparecimento), abra o agendamento em "Meus Agendamentos" e toque em "Abrir disputa". Escolha o motivo e descreva o que houve. A equipe DelBicos decide por reembolso total, parcial ou pela manutenção do valor e você acompanha a resposta no próprio agendamento.`,
      },
      {
        id: 'p3',
        q: 'Onde encontro meu recibo?',
        a: 'Após o pagamento, o recibo fica disponível na tela "Meus Agendamentos", no card do serviço concluído, clicando em "Ver Recibo".',
      },
    ],
  },
  {
    id: 'profissionais',
    title: 'Profissionais e colaboradores',
    icon: 'handshake-o',
    questions: [
      {
        id: 'r1',
        q: 'Como converso com o profissional?',
        a: 'Em "Meu Perfil", abra a aba "Conversas" para ver e responder as mensagens trocadas com os profissionais.',
      },
      {
        id: 'r2',
        q: 'Como avalio um atendimento?',
        a: 'Depois do serviço, acesse a aba "Avaliações" em "Meu Perfil" para dar sua nota e comentário. As avaliações ajudam outros clientes a escolher.',
      },
      {
        id: 'r3',
        q: 'Quero oferecer meus serviços. Como faço?',
        a: 'Em "Meu Perfil", escolha "Tornar-se Colaborador" e preencha o cadastro. Depois você acessa o Painel Colaborador para cadastrar serviços, área de atendimento e agenda.',
      },
    ],
  },
  {
    id: 'conta',
    title: 'Conta e perfil',
    icon: 'user-circle-o',
    questions: [
      {
        id: 'c1',
        q: 'Como faço para alterar minha senha?',
        a: 'Você pode alterar sua senha na tela "Meu Perfil", clicando na aba "Segurança". Você precisará da sua senha atual para definir uma nova.',
      },
      {
        id: 'c2',
        q: 'Como atualizo meu endereço de cadastro?',
        a: 'Na tela "Meu Perfil", acesse a aba "Endereços". Lá você pode editar seu endereço principal ou adicionar novos.',
      },
      {
        id: 'c3',
        q: 'Esqueci minha senha, e agora?',
        a: 'Na tela de login, clique em "Esqueci minha senha" e siga as instruções enviadas para o seu e-mail.',
      },
    ],
  },
  {
    id: 'acessibilidade',
    title: 'Acessibilidade',
    icon: 'universal-access',
    questions: [
      {
        id: 'a1',
        q: 'Posso mudar as cores do site?',
        a: 'Sim. No site, use o seletor de tema no topo da página para escolher entre claro, escuro e alto contraste.',
      },
      {
        id: 'a2',
        q: 'O site tem tradução para Libras?',
        a: 'Sim. No site, toque no botão azul do VLibras, na lateral da tela, para ver o conteúdo traduzido para Libras.',
      },
    ],
  },
];
