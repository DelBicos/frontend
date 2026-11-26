import React from 'react';
import { Platform } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';

import Autocomplete from '../Autocomplete';

type Node = ReturnType<typeof render>['UNSAFE_root'];

const data = [
  { label: 'Curitiba', value: 'cwb' },
  { label: 'Campinas', value: 'cps' },
  { label: 'Salvador', value: 'ssa' },
];

const renderAuto = (
  props: Partial<React.ComponentProps<typeof Autocomplete>> = {},
) =>
  render(
    <Autocomplete
      label="Cidade"
      data={data}
      value=""
      onChange={jest.fn()}
      {...props}
    />,
  );

describe('Autocomplete', () => {
  it('deve listar opções ao focar e filtrar ao digitar', () => {
    const onChange = jest.fn();
    const { getByLabelText, getByText, queryByText } = renderAuto({ onChange });
    const input = getByLabelText('Cidade');
    fireEvent(input, 'focus');
    expect(getByText('Salvador')).toBeTruthy();
    fireEvent.changeText(input, 'cu');
    expect(onChange).toHaveBeenCalledWith('');
    expect(getByText('Curitiba')).toBeTruthy();
    expect(queryByText('Salvador')).toBeNull();
  });

  it('deve selecionar uma opção e fechar a lista', () => {
    const onChange = jest.fn();
    const { getByLabelText, getByText, queryByText } = renderAuto({ onChange });
    fireEvent(getByLabelText('Cidade'), 'focus');
    fireEvent.press(getByText('Campinas'));
    expect(onChange).toHaveBeenCalledWith('cps');
    expect(queryByText('Salvador')).toBeNull();
  });

  it('deve avisar quando nada é encontrado', () => {
    const { getByLabelText, getByText } = renderAuto();
    fireEvent.changeText(getByLabelText('Cidade'), 'xyz');
    expect(getByText('Nenhuma opção encontrada')).toBeTruthy();
  });

  it('deve mostrar carregando', () => {
    const { getByLabelText, getByText } = renderAuto({ loading: true });
    fireEvent(getByLabelText('Cidade'), 'focus');
    expect(getByText('Carregando...')).toBeTruthy();
  });

  it('não deve abrir a lista quando desabilitado', () => {
    const { getByLabelText, queryByText } = renderAuto({ disabled: true });
    fireEvent(getByLabelText('Cidade'), 'focus');
    expect(queryByText('Curitiba')).toBeNull();
  });

  it('deve sincronizar o texto quando o valor externo muda', () => {
    const { getByLabelText, rerender } = renderAuto();
    rerender(
      <Autocomplete
        label="Cidade"
        data={data}
        value="Recife"
        onChange={jest.fn()}
      />,
    );
    expect(getByLabelText('Cidade').props.value).toBe('Recife');
  });

  describe('no web', () => {
    beforeEach(() => {
      jest.replaceProperty(Platform, 'OS', 'web');
    });
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('deve fechar a lista ao tocar fora', () => {
      const { getByLabelText, queryByText, UNSAFE_root } = renderAuto();
      fireEvent(getByLabelText('Cidade'), 'focus');
      expect(queryByText('Curitiba')).toBeTruthy();
      const overlay = UNSAFE_root.findAll(
        (n: Node) =>
          typeof n.props.onPress === 'function' && n.props.activeOpacity === 1,
      )[0];
      fireEvent.press(overlay);
      expect(queryByText('Curitiba')).toBeNull();
    });
  });
});
