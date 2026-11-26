import React from 'react';
import { Image } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import ProfessionalResultCard, { type ProfessionalResult } from '..';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate, goBack: jest.fn() }),
  useRoute: () => ({ params: {} }),
}));

jest.mock('@expo/vector-icons', () => {
  const Icon = () => null;
  return { FontAwesome: Icon, MaterialIcons: Icon };
});

const baseProfessional: ProfessionalResult = {
  id: 7,
  name: 'Ana Paula',
  serviceName: 'Faxina completa',
  serviceId: 33,
  rating: 4.75,
  ratingsCount: 12,
  priceFrom: 150,
  availableTimes: [],
  offeredServices: [],
  distance: 2.35,
  location: 'Centro, Sorocaba',
  imageUrl: 'https://exemplo.com/ana.png',
};

type Props = React.ComponentProps<typeof ProfessionalResultCard>;

const TIMES = Array.from(
  { length: 10 },
  (_, i) => `${String(8 + i).padStart(2, '0')}:00`,
);

const renderCard = (
  professional: Partial<ProfessionalResult> = {},
  props: Partial<Props> = {},
) =>
  render(
    <ProfessionalResultCard
      professional={{ ...baseProfessional, ...professional }}
      selectedDate="2026-12-01"
      times={['09:00', '10:00']}
      showDistance
      {...props}
    />,
  );

describe('ProfessionalResultCard', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('deve exibir os dados do profissional', () => {
    const { getByText, getByLabelText, UNSAFE_getByType } = renderCard();

    expect(getByText('Ana Paula')).toBeTruthy();
    expect(getByText('Faxina completa')).toBeTruthy();
    expect(getByText('4.8')).toBeTruthy();
    expect(getByText('(12)')).toBeTruthy();
    expect(getByLabelText('Nota 4.8 de 5, 12 avaliações')).toBeTruthy();
    expect(getByText(/2,4/)).toBeTruthy();
    expect(getByText('Centro, Sorocaba')).toBeTruthy();
    expect(getByText(/150,00/)).toBeTruthy();
    expect(UNSAFE_getByType(Image).props.source).toEqual({
      uri: 'https://exemplo.com/ana.png',
    });
  });

  it('deve marcar profissional novo e esconder distância e local inválido', () => {
    const { getByText, queryByText } = renderCard(
      { ratingsCount: 0, location: 'undefined, undefined' },
      { showDistance: false },
    );

    expect(getByText('Novo no DelBicos')).toBeTruthy();
    expect(queryByText(/km/)).toBeNull();
    expect(queryByText('undefined, undefined')).toBeNull();
  });

  it('deve exibir o selo de verificado', () => {
    const { getByText } = renderCard({ verified: true });

    expect(getByText('Verificado')).toBeTruthy();
  });

  it('deve mostrar as iniciais sem foto', () => {
    const { getByText, UNSAFE_queryByType } = renderCard({ imageUrl: '' });

    expect(UNSAFE_queryByType(Image)).toBeNull();
    expect(getByText('AP')).toBeTruthy();
  });

  it('deve trocar a foto pelas iniciais quando a imagem falha', () => {
    const { getByText, UNSAFE_getByType, UNSAFE_queryByType } = renderCard();

    fireEvent(UNSAFE_getByType(Image), 'error');

    expect(UNSAFE_queryByType(Image)).toBeNull();
    expect(getByText('AP')).toBeTruthy();
  });

  it('deve limitar os horários e mostrar todos ao tocar em "mais"', () => {
    const { getByText, queryByText } = renderCard({}, { times: TIMES });

    expect(getByText('15:00')).toBeTruthy();
    expect(queryByText('16:00')).toBeNull();

    fireEvent.press(getByText('+2 horários'));

    expect(getByText('16:00')).toBeTruthy();
    expect(getByText('17:00')).toBeTruthy();
    expect(queryByText('+2 horários')).toBeNull();
  });

  it('não deve agendar sem horário escolhido', () => {
    const { getByText } = renderCard();

    fireEvent.press(getByText('Escolha um horário'));

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('deve agendar no horário escolhido', () => {
    const { getByText } = renderCard();

    fireEvent.press(getByText('10:00'));
    fireEvent.press(getByText('Agendar às 10:00'));

    expect(mockNavigate).toHaveBeenCalledWith('Checkout', {
      professionalId: 7,
      priceFrom: 150,
      selectedTime: '2026-12-01T10:00:00.000Z',
      imageUrl: 'https://exemplo.com/ana.png',
      professionalName: 'Ana Paula',
      serviceId: 33,
    });
  });

  it('deve abrir o perfil do profissional', () => {
    const { getByText } = renderCard();

    fireEvent.press(getByText('Ver perfil'));

    expect(mockNavigate).toHaveBeenCalledWith('PartnerProfile', { id: 7 });
  });
});
