import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SettingsSection, SettingsRow } from '..';

describe('SettingsSection', () => {
  it('mostra o titulo e as linhas, ignorando filhos vazios', () => {
    const { getByText, getByRole } = render(
      <SettingsSection title="Conta">
        <SettingsRow icon="person" label="Perfil" />
        {null}
        <SettingsRow icon="lock" label="Senha" />
      </SettingsSection>,
    );
    expect(getByRole('header')).toBeTruthy();
    expect(getByText('Conta')).toBeTruthy();
    expect(getByText('Perfil')).toBeTruthy();
    expect(getByText('Senha')).toBeTruthy();
  });

  it('funciona sem titulo', () => {
    const { queryByRole, getByText } = render(
      <SettingsSection>
        <SettingsRow icon="person" label="Perfil" />
      </SettingsSection>,
    );
    expect(queryByRole('header')).toBeNull();
    expect(getByText('Perfil')).toBeTruthy();
  });
});

describe('SettingsRow', () => {
  it('sem onPress nao e tocavel nem mostra seta', () => {
    const { queryByRole, UNSAFE_getAllByType } = render(
      <SettingsRow icon="person" label="Perfil" hint="Seus dados" />,
    );
    expect(queryByRole('button')).toBeNull();
    expect(UNSAFE_getAllByType(MaterialIcons)).toHaveLength(1);
  });

  it('com onPress chama a acao e mostra a seta', () => {
    const onPress = jest.fn();
    const { getByRole, UNSAFE_getAllByType } = render(
      <SettingsRow icon="person" label="Perfil" hint="Seus dados" onPress={onPress} />,
    );
    fireEvent.press(getByRole('button'));
    expect(onPress).toHaveBeenCalled();
    expect(UNSAFE_getAllByType(MaterialIcons).map((i) => i.props.name)).toContain(
      'chevron-right',
    );
  });

  it('linha de perigo nao mostra seta e aceita papel de link', () => {
    const { getByRole, UNSAFE_getAllByType } = render(
      <SettingsRow icon="logout" label="Sair" onPress={jest.fn()} danger accessibilityRole="link" />,
    );
    expect(getByRole('link')).toBeTruthy();
    expect(UNSAFE_getAllByType(MaterialIcons)).toHaveLength(1);
  });

  it('mostra conteudo a direita e abaixo', () => {
    const { getByText } = render(
      <SettingsRow
        icon="palette"
        label="Tema"
        right={<Text>direita</Text>}
        below={<Text>abaixo</Text>}
      />,
    );
    expect(getByText('direita')).toBeTruthy();
    expect(getByText('abaixo')).toBeTruthy();
  });
});
