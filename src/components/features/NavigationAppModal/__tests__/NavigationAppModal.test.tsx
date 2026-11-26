import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NavigationAppModal } from '..';
import { openGoogleMaps, openWaze } from '@lib/maps';

jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));

jest.mock('@lib/maps', () => ({
  openGoogleMaps: jest.fn().mockResolvedValue(undefined),
  openWaze: jest.fn().mockResolvedValue(undefined),
}));

const ADDRESS = 'Rua das Flores, 123, Sorocaba';

const renderModal = (visible = true) => {
  const onClose = jest.fn();
  const utils = render(
    <NavigationAppModal
      visible={visible}
      onClose={onClose}
      address={ADDRESS}
    />,
  );
  return { ...utils, onClose };
};

describe('NavigationAppModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve exibir as opções de navegação', () => {
    const { getByText } = renderModal();

    expect(getByText('Abrir Rota no GPS')).toBeTruthy();
    expect(getByText('Google Maps')).toBeTruthy();
    expect(getByText('Waze')).toBeTruthy();
  });

  it('não deve exibir o conteúdo quando oculto', () => {
    const { queryByText } = renderModal(false);

    expect(queryByText('Abrir Rota no GPS')).toBeNull();
  });

  it('deve fechar e abrir o Google Maps com o endereço', () => {
    const { getByText, onClose } = renderModal();

    fireEvent.press(getByText('Google Maps'));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(openGoogleMaps).toHaveBeenCalledWith(ADDRESS);
    expect(openWaze).not.toHaveBeenCalled();
  });

  it('deve fechar e abrir o Waze com o endereço', () => {
    const { getByText, onClose } = renderModal();

    fireEvent.press(getByText('Waze'));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(openWaze).toHaveBeenCalledWith(ADDRESS);
  });

  it('deve apenas fechar ao cancelar', () => {
    const { getByText, onClose } = renderModal();

    fireEvent.press(getByText('Cancelar'));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(openGoogleMaps).not.toHaveBeenCalled();
    expect(openWaze).not.toHaveBeenCalled();
  });
});
