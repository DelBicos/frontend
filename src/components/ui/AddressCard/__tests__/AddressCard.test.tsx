import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AddressCard } from '../AddressCard';
import type { Address } from '@stores/Address/types';

const address = {
  id: 7,
  street: 'Rua das Flores',
  number: '100',
  complement: 'Apto 12',
  neighborhood: 'Centro',
  city: 'Curitiba',
  state: 'PR',
  postal_code: '80000123',
  isPrimary: false,
} as unknown as Address;

const setup = (overrides: Record<string, unknown> = {}) => {
  const handlers = {
    onDelete: jest.fn(),
    onSetPrimary: jest.fn(),
    onEditPress: jest.fn(),
  };
  const utils = render(
    <AddressCard
      addressData={{ ...address, ...overrides } as Address}
      {...handlers}
    />,
  );
  return { ...utils, ...handlers };
};

describe('AddressCard', () => {
  it('deve exibir o endereço com o CEP mascarado', () => {
    const { getByText } = setup();
    expect(getByText('Rua das Flores, 100')).toBeTruthy();
    expect(getByText('Apto 12')).toBeTruthy();
    expect(getByText('Centro · Curitiba/PR')).toBeTruthy();
    expect(getByText('CEP 80000-123')).toBeTruthy();
  });

  it('deve manter o CEP original quando não tem 8 dígitos', () => {
    const { getByText } = setup({ postal_code: '123', complement: '' });
    expect(getByText('CEP 123')).toBeTruthy();
  });

  it('deve disparar as ações de um endereço secundário', () => {
    const { getByText, getByLabelText, onSetPrimary, onEditPress, onDelete } =
      setup();
    fireEvent.press(getByText('Tornar principal'));
    fireEvent.press(getByText('Editar'));
    fireEvent.press(getByLabelText('Excluir Rua das Flores, 100'));
    expect(onSetPrimary).toHaveBeenCalledWith(7);
    expect(onEditPress).toHaveBeenCalledWith(
      expect.objectContaining({ id: 7 }),
    );
    expect(onDelete).toHaveBeenCalledWith(expect.objectContaining({ id: 7 }));
  });

  it('deve esconder excluir e tornar principal no endereço principal', () => {
    const { getByText, queryByText } = setup({ isPrimary: true });
    expect(getByText('Principal')).toBeTruthy();
    expect(queryByText('Tornar principal')).toBeNull();
    expect(queryByText('Excluir')).toBeNull();
    expect(getByText(/Usado como padrão/)).toBeTruthy();
  });
});
