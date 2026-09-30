export const MONTH_LABELS = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
];

export const STATUS_LABELS = {
  pending: 'Pendentes',
  confirmed: 'Confirmados',
  completed: 'Concluídos',
  canceled: 'Cancelados',
  no_show: 'Não compareceu',
} as const;

export const formatMoney = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const formatCount = (value: number) => value.toLocaleString('pt-BR');
