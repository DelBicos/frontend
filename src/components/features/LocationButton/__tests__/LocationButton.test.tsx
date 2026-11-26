import React from 'react';
import { ActivityIndicator } from 'react-native';
import { render, fireEvent, act } from '@testing-library/react-native';
import { LocationButton } from '../LocationButton';
import { logger } from '@lib/logger';

jest.mock('@expo/vector-icons', () => ({ FontAwesome: () => null }));

jest.mock('@lib/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('@components/ui/MapComponent/MapComponent', () => {
  const { Pressable, Text } = jest.requireActual('react-native');
  return {
    MapComponent: ({
      region,
      markerCoords,
      onMapPress,
    }: {
      region: { latitude: number; latitudeDelta: number } | null;
      markerCoords: { latitude: number; longitude: number } | null;
      onMapPress: (event: {
        nativeEvent: { coordinate: { latitude: number; longitude: number } };
      }) => void;
    }) => (
      <Pressable
        testID="mapa"
        onPress={() =>
          onMapPress({
            nativeEvent: { coordinate: { latitude: -10, longitude: -20 } },
          })
        }>
        <Text>{`regiao:${region?.latitude}/${region?.latitudeDelta}`}</Text>
        <Text>{`marcador:${markerCoords?.latitude},${markerCoords?.longitude}`}</Text>
      </Pressable>
    ),
  };
});

type Props = React.ComponentProps<typeof LocationButton>;

const COORDS = { latitude: -23.5, longitude: -47.4 };

const renderButton = (props: Partial<Props> = {}) => {
  const onPress = jest.fn().mockResolvedValue(COORDS);
  const onConfirm = jest.fn();
  const utils = render(
    <LocationButton
      onPress={onPress}
      loading={false}
      onConfirm={onConfirm}
      {...props}
    />,
  );
  return { ...utils, onPress, onConfirm };
};

const openMap = async (getByText: (text: string) => unknown) => {
  await act(async () => {
    fireEvent.press(getByText('Obter Localização Atual') as never);
  });
};

describe('LocationButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve mostrar o botão sem o mapa aberto', () => {
    const { getByText, queryByText } = renderButton();

    expect(getByText('Obter Localização Atual')).toBeTruthy();
    expect(queryByText('Sua Localização')).toBeNull();
  });

  it('deve mostrar o carregamento quando loading é verdadeiro', () => {
    const { queryByText, UNSAFE_getByType } = renderButton({ loading: true });

    expect(queryByText('Obter Localização Atual')).toBeNull();
    expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
  });

  it('deve abrir o mapa centralizado na localização obtida', async () => {
    const { getByText, onPress } = renderButton();

    await openMap(getByText);

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(getByText('Sua Localização')).toBeTruthy();
    expect(getByText('regiao:-23.5/0.01')).toBeTruthy();
    expect(getByText('marcador:-23.5,-47.4')).toBeTruthy();
  });

  it('deve confirmar a posição escolhida no mapa e fechar', async () => {
    const { getByText, getByTestId, queryByText, onConfirm } = renderButton();

    await openMap(getByText);
    fireEvent.press(getByTestId('mapa'));
    expect(getByText('marcador:-10,-20')).toBeTruthy();

    fireEvent.press(getByText('Confirmar Localização'));

    expect(onConfirm).toHaveBeenCalledWith({ latitude: -10, longitude: -20 });
    expect(queryByText('Sua Localização')).toBeNull();
  });

  it('deve confirmar a localização obtida sem mexer no mapa', async () => {
    const { getByText, onConfirm } = renderButton();

    await openMap(getByText);
    fireEvent.press(getByText('Confirmar Localização'));

    expect(onConfirm).toHaveBeenCalledWith(COORDS);
  });

  it('não deve abrir o mapa quando não há localização', async () => {
    const onPress = jest.fn().mockResolvedValue(null);
    const { getByText, queryByText } = renderButton({ onPress });

    await openMap(getByText);

    expect(queryByText('Sua Localização')).toBeNull();
    expect(getByText('Obter Localização Atual')).toBeTruthy();
  });

  it('deve registrar o erro quando obter a localização falha', async () => {
    const error = new Error('sem permissão');
    const onPress = jest.fn().mockRejectedValue(error);
    const { getByText, queryByText } = renderButton({ onPress });

    await openMap(getByText);

    expect(logger.error).toHaveBeenCalledWith(
      'Erro ao obter localização:',
      error,
    );
    expect(queryByText('Sua Localização')).toBeNull();
    expect(getByText('Obter Localização Atual')).toBeTruthy();
  });

  it('não deve buscar a localização quando desabilitado', async () => {
    const { getByText, onPress } = renderButton({ disabled: true });

    await openMap(getByText);

    expect(onPress).not.toHaveBeenCalled();
  });
});
