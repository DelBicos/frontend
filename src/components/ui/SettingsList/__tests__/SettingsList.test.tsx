import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { SettingsSection, SettingsRow } from '../SettingsList';

describe('SettingsSection', () => {
  it('deve exibir título e linhas, ignorando filhos vazios', () => {
    const { getByRole, getByText } = render(
      <SettingsSection title="Conta">
        <SettingsRow icon="person" label="Perfil" />
        {false}
        <SettingsRow icon="lock" label="Senha" />
      </SettingsSection>,
    );
    expect(getByRole('header')).toBeTruthy();
    expect(getByText('Perfil')).toBeTruthy();
    expect(getByText('Senha')).toBeTruthy();
  });

  it('deve renderizar sem título', () => {
    const { queryByRole } = render(
      <SettingsSection>
        <SettingsRow icon="person" label="Perfil" />
      </SettingsSection>,
    );
    expect(queryByRole('header')).toBeNull();
  });
});

describe('SettingsRow', () => {
  it('deve ser tocável com dica', () => {
    const onPress = jest.fn();
    const { getByRole, getByText } = render(
      <SettingsRow
        icon="help"
        label="Ajuda"
        hint="Perguntas frequentes"
        onPress={onPress}
        accessibilityRole="link"
      />,
    );
    expect(getByText('Perguntas frequentes')).toBeTruthy();
    fireEvent.press(getByRole('link'));
    expect(onPress).toHaveBeenCalled();
  });

  it('deve renderizar perigo, conteúdo à direita e abaixo', () => {
    const { getByText } = render(
      <SettingsRow
        icon="logout"
        label="Sair"
        danger
        onPress={jest.fn()}
        right={<Text>direita</Text>}
        below={<Text>abaixo</Text>}
      />,
    );
    expect(getByText('direita')).toBeTruthy();
    expect(getByText('abaixo')).toBeTruthy();
  });

  it('deve aplicar o estilo de pressionado', () => {
    const { getByRole } = render(
      <SettingsRow icon="logout" label="Sair" danger onPress={jest.fn()} />,
    );
    const style = getByRole('button').props.style;
    expect(style).toBeTruthy();
  });
});
