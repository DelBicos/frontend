import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import type { Address } from '@stores/Address/types';
import { AddressCard } from '..';

const address: Address = {
  id: 7,
  lat: 0,
  lng: 0,
  street: 'Rua A',
  number: '10',
  complement: 'Apto 2',
  neighborhood: 'Centro',
  city: 'Sorocaba',
  state: 'SP',
  country_iso: 'BR',
  postal_code: '18000000',
};

describe('AddressCard', () => {
  it('mostra o endereco com CEP formatado e as acoes', () => {
    const onDelete = jest.fn();
    const onSetPrimary = jest.fn();
    const onEditPress = jest.fn();
    const { getByText, getByLabelText } = render(
      <AddressCard
        addressData={address}
        onDelete={onDelete}
        onSetPrimary={onSetPrimary}
        onEditPress={onEditPress}
      />,
    );
    expect(getByText('Rua A, 10')).toBeTruthy();
    expect(getByText('Apto 2')).toBeTruthy();
    expect(getByText('Centro · Sorocaba/SP')).toBeTruthy();
    expect(getByText('CEP 18000-000')).toBeTruthy();

    fireEvent.press(getByText('Tornar principal'));
    expect(onSetPrimary).toHaveBeenCalledWith(7);
    fireEvent.press(getByText('Editar'));
    expect(onEditPress).toHaveBeenCalledWith(address);
    fireEvent.press(getByLabelText('Excluir Rua A, 10'));
    expect(onDelete).toHaveBeenCalledWith(address);
  });

  it('endereco principal tem selo e nao pode ser excluido', () => {
    const { getByText, queryByText } = render(
      <AddressCard
        addressData={{
          ...address,
          isPrimary: true,
          complement: null,
          postal_code: '123',
        }}
        onDelete={jest.fn()}
        onSetPrimary={jest.fn()}
        onEditPress={jest.fn()}
      />,
    );
    expect(getByText('Principal')).toBeTruthy();
    expect(getByText('CEP 123')).toBeTruthy();
    expect(queryByText('Excluir')).toBeNull();
    expect(queryByText('Tornar principal')).toBeNull();
    expect(
      getByText(
        'Usado como padrão nos agendamentos e na busca por profissionais.',
      ),
    ).toBeTruthy();
  });

  it('desabilita as acoes quando ocupado', () => {
    const onEditPress = jest.fn();
    const { getByText } = render(
      <AddressCard
        addressData={address}
        onDelete={jest.fn()}
        onSetPrimary={jest.fn()}
        onEditPress={onEditPress}
        busy
      />,
    );
    fireEvent.press(getByText('Editar'));
    expect(onEditPress).not.toHaveBeenCalled();
  });
});
