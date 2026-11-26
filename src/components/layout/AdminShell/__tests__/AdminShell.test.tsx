import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import AdminShell from '..';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate, goBack: jest.fn() }),
  useRoute: () => ({ name: 'AdminDashboard', params: {} }),
}));

describe('AdminShell', () => {
  beforeEach(() => mockNavigate.mockClear());

  it('mostra titulo, subtitulo, secoes e conteudo', () => {
    const { getByText, getByRole } = render(
      <AdminShell title="Painel" subtitle="Resumo do dia">
        <Text>conteudo</Text>
      </AdminShell>,
    );
    expect(getByRole('header').props.children).toBe('Painel');
    expect(getByText('Administração')).toBeTruthy();
    expect(getByText('Resumo do dia')).toBeTruthy();
    expect(getByText('Disputas')).toBeTruthy();
    expect(getByText('conteudo')).toBeTruthy();
  });

  it('navega para outra secao e ignora a secao atual', () => {
    const { getAllByText, getByText } = render(
      <AdminShell title="Painel" subtitle="Resumo">
        <Text>x</Text>
      </AdminShell>,
    );
    fireEvent.press(getAllByText('Painel')[1]);
    expect(mockNavigate).not.toHaveBeenCalled();
    fireEvent.press(getByText('Verificações'));
    expect(mockNavigate).toHaveBeenCalledWith('AdminVerifications');
  });
});
