import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { ServiceOptions } from '../ServiceOptions';
import { ChatBotServiceOption } from '@stores/ChatBot/types';

const option = (
  overrides: Partial<ChatBotServiceOption> = {},
): ChatBotServiceOption => ({
  id: 1,
  title: 'Limpeza residencial',
  description: 'Limpeza completa da casa',
  subcategoryId: 2,
  subcategoryName: 'Limpeza',
  categoryName: 'Casa',
  professionalId: 3,
  professionalName: 'Bruno',
  professionalAvatarUri: 'https://x/b.png',
  professionalDescription: 'Dez anos de experiência',
  professionalCity: 'Sorocaba',
  professionalState: 'SP',
  price: 15000,
  duration: 60,
  rating: 4.8,
  ratingsCount: 12,
  ...overrides,
});

describe('ServiceOptions', () => {
  it('não deve renderizar sem opções', () => {
    const { toJSON } = render(
      <ServiceOptions options={[]} onSelect={jest.fn()} />,
    );

    expect(toJSON()).toBeNull();
  });

  it('deve comparar os profissionais com preço, duração e local', () => {
    const { getByText, getByLabelText } = render(
      <ServiceOptions options={[option()]} onSelect={jest.fn()} />,
    );

    expect(getByText('Profissionais para este serviço')).toBeTruthy();
    expect(getByLabelText('Foto de Bruno')).toBeTruthy();
    expect(getByText('4.8 (12 avaliações)')).toBeTruthy();
    expect(getByText('Casa › Limpeza')).toBeTruthy();
    expect(getByText('Limpeza completa da casa')).toBeTruthy();
    expect(getByText(/R\$\s?150,00/)).toBeTruthy();
    expect(getByText('60 min')).toBeTruthy();
    expect(getByText('Sorocaba/SP')).toBeTruthy();
    expect(getByText('Dez anos de experiência')).toBeTruthy();
  });

  it('deve tratar profissional novo, com uma avaliação e sem dados opcionais', () => {
    const { getByText, queryByText } = render(
      <ServiceOptions
        options={[
          option({
            professionalAvatarUri: null,
            ratingsCount: 0,
            description: null,
            professionalDescription: null,
            professionalCity: null,
            categoryName: null,
          }),
          option({ id: 2, professionalId: 4, professionalName: 'Carla', ratingsCount: 1, rating: 5 }),
        ]}
        onSelect={jest.fn()}
      />,
    );

    expect(getByText('Novo neste serviço')).toBeTruthy();
    expect(getByText('5.0 (1 avaliação)')).toBeTruthy();
    expect(getByText('Limpeza')).toBeTruthy();
    expect(queryByText('Sorocaba/SP')).toBeTruthy();
  });

  it('deve escolher o profissional pela posição na lista', () => {
    const onSelect = jest.fn();
    const { getByLabelText } = render(
      <ServiceOptions
        options={[
          option(),
          option({ id: 2, professionalId: 4, professionalName: 'Carla' }),
        ]}
        onSelect={onSelect}
      />,
    );

    fireEvent.press(getByLabelText('Escolher Carla para Limpeza residencial'));

    expect(onSelect).toHaveBeenCalledWith(
      '2',
      'Limpeza residencial com Carla',
    );
  });

  it('deve bloquear a escolha quando desabilitado', () => {
    const onSelect = jest.fn();
    const { getByLabelText } = render(
      <ServiceOptions options={[option()]} onSelect={onSelect} disabled />,
    );

    fireEvent.press(getByLabelText('Escolher Bruno para Limpeza residencial'));

    expect(onSelect).not.toHaveBeenCalled();
  });
});
