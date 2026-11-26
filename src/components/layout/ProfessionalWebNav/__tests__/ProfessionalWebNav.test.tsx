import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import ProfessionalWebNav from '..';

let mockWidth = 1200;
jest.mock('@lib/hooks/useBreakpoint', () => {
  const actual = jest.requireActual('@lib/hooks/useBreakpoint');
  return {
    ...actual,
    useBreakpoint: () => actual.getBreakpointInfo(mockWidth),
  };
});

const navigate = jest.fn();
const props = (index: number) =>
  ({
    state: {
      index,
      routes: [
        { name: 'ProfessionalHomeTab' },
        { name: 'ProfessionalSchedulesTab' },
      ],
    },
    navigation: { navigate },
  }) as unknown as BottomTabBarProps;

describe('ProfessionalWebNav', () => {
  beforeEach(() => {
    navigate.mockClear();
    mockWidth = 1200;
  });

  it('marca a aba ativa e navega ao tocar', () => {
    const { getAllByRole, getByText } = render(<ProfessionalWebNav {...props(1)} />);
    const tabs = getAllByRole('tab');
    expect(tabs).toHaveLength(4);
    expect(tabs[1].props.accessibilityState).toEqual({ selected: true });
    expect(getByText('Serviços')).toBeTruthy();
    fireEvent.press(tabs[2]);
    expect(navigate).toHaveBeenCalledWith('ProfessionalServicesTab');
  });

  it('no celular mostra so o rotulo da aba ativa', () => {
    mockWidth = 400;
    const { getByText, queryByText } = render(<ProfessionalWebNav {...props(0)} />);
    expect(getByText('Início')).toBeTruthy();
    expect(queryByText('Serviços')).toBeNull();
  });
});
