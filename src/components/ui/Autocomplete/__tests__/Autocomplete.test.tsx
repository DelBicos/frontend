import React from 'react';
import { Keyboard, Platform } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import type { ReactTestInstance } from 'react-test-renderer';
import Autocomplete from '..';

const data = [
  { label: 'São Paulo', value: 'SP' },
  { label: 'Sorocaba', value: 'SOR' },
  { label: 'Campinas', value: 'CAM' },
];

describe('Autocomplete', () => {
  const originalOS = Platform.OS;
  afterEach(() => {
    Platform.OS = originalOS;
  });

  it('abre a lista ao focar e seleciona uma opcao', () => {
    const dismiss = jest.spyOn(Keyboard, 'dismiss').mockImplementation(() => {});
    const onChange = jest.fn();
    const { getByLabelText, getByText, queryByText } = render(
      <Autocomplete label="Cidade" data={data} value="" onChange={onChange} />,
    );
    fireEvent(getByLabelText('Cidade'), 'focus');
    expect(getByText('Campinas')).toBeTruthy();

    fireEvent.press(getByText('Sorocaba'));
    expect(onChange).toHaveBeenCalledWith('SOR');
    expect(dismiss).toHaveBeenCalled();
    expect(queryByText('Campinas')).toBeNull();
    expect(getByLabelText('Cidade').props.value).toBe('Sorocaba');
    dismiss.mockRestore();
  });

  it('filtra pelo texto digitado e limpa o valor', () => {
    const onChange = jest.fn();
    const { getByLabelText, getByText, queryByText } = render(
      <Autocomplete label="Cidade" data={data} value="" onChange={onChange} />,
    );
    fireEvent.changeText(getByLabelText('Cidade'), 'so');
    expect(onChange).toHaveBeenCalledWith('');
    expect(getByText('Sorocaba')).toBeTruthy();
    expect(queryByText('Campinas')).toBeNull();
  });

  it('avisa quando nada combina', () => {
    const { getByLabelText, getByText } = render(
      <Autocomplete label="Cidade" data={data} value="" onChange={jest.fn()} />,
    );
    fireEvent.changeText(getByLabelText('Cidade'), 'xyz');
    expect(getByText('Nenhuma opção encontrada')).toBeTruthy();
  });

  it('mostra carregando', () => {
    const { getByLabelText, getByText } = render(
      <Autocomplete label="Cidade" data={data} value="" onChange={jest.fn()} loading />,
    );
    fireEvent(getByLabelText('Cidade'), 'focus');
    expect(getByText('Carregando...')).toBeTruthy();
  });

  it('nao abre quando desabilitado', () => {
    const { getByLabelText, queryByText } = render(
      <Autocomplete label="Cidade" data={data} value="" onChange={jest.fn()} disabled />,
    );
    fireEvent(getByLabelText('Cidade'), 'focus');
    expect(queryByText('Campinas')).toBeNull();
  });

  it('sincroniza o texto quando o valor muda por fora', () => {
    const { getByLabelText, rerender } = render(
      <Autocomplete label="Cidade" data={data} value="" onChange={jest.fn()} />,
    );
    rerender(
      <Autocomplete label="Cidade" data={data} value="Campinas" onChange={jest.fn()} />,
    );
    expect(getByLabelText('Cidade').props.value).toBe('Campinas');
  });

  it('no web fecha a lista ao tocar fora', () => {
    Platform.OS = 'web';
    const { getByLabelText, queryByText, UNSAFE_root } = render(
      <Autocomplete label="Cidade" data={data} value="" onChange={jest.fn()} />,
    );
    fireEvent(getByLabelText('Cidade'), 'focus');
    expect(queryByText('Campinas')).toBeTruthy();
    const overlay = UNSAFE_root.findAll(
      (n: ReactTestInstance) => typeof n.props.onPress === 'function' && n.props.activeOpacity === 1,
    )[0];
    fireEvent.press(overlay);
    expect(queryByText('Campinas')).toBeNull();
  });
});
