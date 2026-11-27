import React from 'react';
import { Image } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import ProfessionalCard from '../ProfessionalCard';
import type { ListedProfessional } from '@stores/Professional/types';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

const professional = {
  id: 42,
  name: 'Carlos Pereira',
  category: 'Elétrica',
  offeredServices: ['Tomadas', 'Chuveiro', 'Quadro'],
  rating: 4.75,
  ratingsCount: 18,
  location: 'Curitiba, PR',
  distance: 2.345,
  imageUrl: 'https://exemplo.com/carlos.png',
  verified: true,
} as unknown as ListedProfessional;

describe('ProfessionalCard', () => {
  it('deve exibir os dados do profissional', () => {
    const { getByText, getByLabelText } = render(
      <ProfessionalCard professional={professional} />,
    );
    expect(getByText('Carlos Pereira')).toBeTruthy();
    expect(getByText('Tomadas, Chuveiro')).toBeTruthy();
    expect(getByText(/4\.8/)).toBeTruthy();
    expect(getByText('2.35 km')).toBeTruthy();
    expect(getByLabelText('Profissional verificado')).toBeTruthy();
  });

  it('deve navegar para o perfil ao tocar', () => {
    const { getByLabelText } = render(
      <ProfessionalCard professional={professional} />,
    );
    fireEvent.press(getByLabelText('Profissional Carlos Pereira'));
    expect(mockNavigate).toHaveBeenCalledWith('PartnerProfile', { id: 42 });
  });

  it('deve usar categoria, imagem padrão e esconder distância e selo', () => {
    const { getByText, queryByText, UNSAFE_getByType, getByLabelText } = render(
      <ProfessionalCard
        professional={
          {
            ...professional,
            offeredServices: undefined,
            imageUrl: undefined,
            distance: null,
            verified: false,
          } as unknown as ListedProfessional
        }
      />,
    );
    expect(getByText('Elétrica')).toBeTruthy();
    expect(queryByText(/km/)).toBeNull();
    expect(UNSAFE_getByType(Image).props.source.uri).toContain('placeholder');
    const card = getByLabelText('Profissional Carlos Pereira');
    fireEvent(card, 'hoverIn');
    fireEvent(card, 'hoverOut');
  });
});
