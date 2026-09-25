export interface FaqQuestion {
  id: string;
  q: string;
  a: string;
}

export interface FaqTopic {
  id: string;
  title: string;
  /** Icone FontAwesome. */
  icon: string;
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
        a: 'O pagamento é processado de forma segura através do Stripe. Aceitamos Cartão de Crédito e Pix. O valor é pré-autorizado no agendamento e cobrado após a confirmação do serviço.',
      },
      {
        id: 'p2',
        q: 'Posso cancelar um agendamento?',
        a: 'Ainda não é possível cancelar pelo app. Converse com o profissional em "Conversas": enquanto o pedido estiver pendente, ele pode recusá-lo e o valor pago é estornado automaticamente.',
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
