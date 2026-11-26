import React from 'react';
import { Image, Keyboard, Platform } from 'react-native';
import type { KeyboardEvent, KeyboardEventListener } from 'react-native';
import { render, fireEvent, act } from '@testing-library/react-native';
import type { NavigationState } from '@react-navigation/native';
import { navigationRef } from '@screens/navigationRef';
import { useUserStore } from '@stores/User';
import type { User } from '@stores/User/types';
import BottomNav from '..';

jest.mock('@lib/helpers/httpClient', () => ({
  backendHttpClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
  registerTokenProvider: jest.fn(),
}));

jest.mock('@screens/navigationRef', () => ({
  navigationRef: {
    isReady: jest.fn(),
    getRootState: jest.fn(),
    dispatch: jest.fn(),
    navigate: jest.fn(),
  },
}));

const ref = navigationRef as unknown as Record<string, jest.Mock>;

const stateWith = (names: string[], nestedTab = 'FeedTab') =>
  ({
    index: names.length - 1,
    routes: names.map((name) =>
      name === 'MainTabs' || name === 'Home'
        ? { name, key: name, state: { index: 0, routes: [{ name: nestedTab }] } }
        : { name, key: name },
    ),
  }) as unknown as NavigationState;

describe('BottomNav', () => {
  const originalOS = Platform.OS;
  beforeEach(() => {
    jest.clearAllMocks();
    ref.isReady.mockReturnValue(true);
    useUserStore.setState({ user: null });
  });
  afterEach(() => {
    Platform.OS = originalOS;
  });

  it('nao aparece sem estado ou em rota de tela cheia', () => {
    const { toJSON, rerender } = render(<BottomNav state={undefined} />);
    expect(toJSON()).toBeNull();
    rerender(<BottomNav state={stateWith(['MainTabs', 'Login'])} />);
    expect(toJSON()).toBeNull();
  });

  it('mostra as abas de cliente com a aba ativa', () => {
    const { getAllByRole, getByLabelText } = render(
      <BottomNav state={stateWith(['MainTabs'])} />,
    );
    expect(getAllByRole('tab')).toHaveLength(4);
    expect(getByLabelText('Início').props.accessibilityState).toEqual({
      selected: true,
    });
  });

  it('troca de aba sem fechar telas quando ja esta nas abas', () => {
    const state = stateWith(['MainTabs']);
    ref.getRootState.mockReturnValue(state);
    const { getByLabelText } = render(<BottomNav state={state} />);
    fireEvent.press(getByLabelText('Agenda'));
    expect(ref.dispatch).not.toHaveBeenCalled();
    expect(ref.navigate).toHaveBeenCalledWith('MainTabs', { screen: 'SchedulesTab' });
  });

  it('fecha as telas empilhadas antes de trocar de aba', () => {
    const state = stateWith(['MainTabs', 'PartnerProfile']);
    ref.getRootState.mockReturnValue(state);
    const { getByLabelText } = render(<BottomNav state={state} />);
    fireEvent.press(getByLabelText('Buscar'));
    expect(ref.dispatch).toHaveBeenCalled();
    expect(ref.navigate).toHaveBeenCalledWith('MainTabs', { screen: 'CategoryTab' });
  });

  it('nao navega quando a navegacao nao esta pronta ou sem estado raiz', () => {
    const state = stateWith(['MainTabs']);
    const { getByLabelText } = render(<BottomNav state={state} />);
    ref.isReady.mockReturnValue(false);
    fireEvent.press(getByLabelText('Agenda'));
    ref.isReady.mockReturnValue(true);
    ref.getRootState.mockReturnValue(undefined);
    fireEvent.press(getByLabelText('Agenda'));
    expect(ref.navigate).not.toHaveBeenCalled();
  });

  it('mostra as abas do profissional e a foto no perfil', () => {
    useUserStore.setState({
      user: {
        id: 1,
        name: 'Ana',
        professional_id: 5,
        avatar_uri: 'https://img/ana.png',
      } as unknown as User,
    });
    const { getByLabelText, UNSAFE_getByType } = render(
      <BottomNav state={stateWith(['Home'], 'ProfessionalHomeTab')} />,
    );
    expect(getByLabelText('Serviços')).toBeTruthy();
    expect(UNSAFE_getByType(Image).props.source).toEqual({
      uri: 'https://img/ana.png',
    });
  });

  it('no Android some enquanto o teclado esta aberto', () => {
    Platform.OS = 'android';
    const listeners: Record<string, KeyboardEventListener> = {};
    const keyboardEvent = {} as unknown as KeyboardEvent;
    const remove = jest.fn();
    const spy = jest
      .spyOn(Keyboard, 'addListener')
      .mockImplementation((event, cb) => {
        listeners[event] = cb;
        return { remove } as unknown as ReturnType<typeof Keyboard.addListener>;
      });
    const { toJSON, unmount } = render(<BottomNav state={stateWith(['MainTabs'])} />);
    expect(toJSON()).not.toBeNull();
    act(() => listeners.keyboardDidShow(keyboardEvent));
    expect(toJSON()).toBeNull();
    act(() => listeners.keyboardDidHide(keyboardEvent));
    expect(toJSON()).not.toBeNull();
    unmount();
    expect(remove).toHaveBeenCalledTimes(2);
    spy.mockRestore();
  });
});
