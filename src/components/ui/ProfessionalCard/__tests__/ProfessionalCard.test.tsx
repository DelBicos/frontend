import React from 'react';
import { Image } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import type { ListedProfessional } from '@stores/Professional/types';
import ProfessionalCard from '..';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate, goBack: jest.fn() }),
  useRoute: () => ({ params: {} }),
}));

const professional: ListedProfessional = {
  id: 9,
  name: 'Carlos',
  category: 'Pintura',
  rating: 4.25,
  ratingsCount: 12,
  imageUrl: 'https://img/c.png',
  location: 'Sorocaba - SP',
  distance: 1.234,
  offeredServices: ['Paredes', 'Portas', 'Janelas'],
  verified: true,
};

describe('ProfessionalCard', () => {
  beforeEach(() => mockNavigate.mockClear());

  it('mostra os dados e abre o perfil ao tocar', () => {
    const { getByText, getByLabelText } = render(
      <ProfessionalCard professional={professional} />,
    );
    expect(getByText('Carlos')).toBeTruthy();
    expect(getByText('Paredes, Portas')).toBeTruthy();
    expect(getByText('1.23 km')).toBeTruthy();
    expect(getByText('Verificado')).toBeTruthy();
    expect(getByText('Sorocaba - SP')).toBeTruthy();
    fireEvent.press(getByLabelText('Profissional Carlos'));
    expect(mockNavigate).toHaveBeenCalledWith('PartnerProfile', { id: 9 });
  });

  it('usa a categoria e imagem padrao quando faltam dados', () => {
    const { getByText, queryByText, UNSAFE_getByType, getByLabelText } = render(
      <ProfessionalCard
        professional={{
          ...professional,
          offeredServices: [],
          imageUrl: '',
          distance: undefined,
          verified: false,
        }}
      />,
    );
    expect(getByText('Pintura')).toBeTruthy();
    expect(queryByText(/km/)).toBeNull();
    expect(queryByText('Verificado')).toBeNull();
    expect(UNSAFE_getByType(Image).props.source).toEqual({
      uri: 'https://via.placeholder.com/100',
    });
    const card = getByLabelText('Profissional Carlos');
    fireEvent(card, 'hoverIn');
    fireEvent(card, 'hoverOut');
  });
});
