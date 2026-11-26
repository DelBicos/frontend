import React from 'react';
import { Platform } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import CustomSelect from '..';

const options = [
  { label: 'Manhã', value: 'M' },
  { label: 'Tarde', value: 'T' },
];

describe('CustomSelect', () => {
  const originalOS = Platform.OS;
  afterEach(() => {
    Platform.OS = originalOS;
  });

  it('mostra o placeholder e escolhe uma opcao pelo modal', () => {
    const onChange = jest.fn();
    const { getByText, getAllByText } = render(
      <CustomSelect
        label="Turno"
        value=""
        options={options}
        onChange={onChange}
      />,
    );
    expect(getByText('Selecione...')).toBeTruthy();
    fireEvent.press(getByText('Selecione...'));
    expect(getAllByText('Turno').length).toBeGreaterThan(1);
    fireEvent.press(getByText('Tarde'));
    expect(onChange).toHaveBeenCalledWith('T');
  });

  it('mostra o rotulo da opcao escolhida e fecha pelo Cancelar', () => {
    const { getByText, getAllByText } = render(
      <CustomSelect
        value="M"
        options={options}
        onChange={jest.fn()}
        placeholder="Escolha"
      />,
    );
    fireEvent.press(getByText('Manhã'));
    expect(getByText('Escolha')).toBeTruthy();
    expect(getAllByText('Manhã')).toHaveLength(2);
    fireEvent.press(getByText('Cancelar'));
  });

  it('mostra as mensagens de erro', () => {
    const { getByText, rerender } = render(
      <CustomSelect
        value=""
        options={options}
        onChange={jest.fn()}
        error="Obrigatorio"
      />,
    );
    expect(getByText('Obrigatorio')).toBeTruthy();
    rerender(
      <CustomSelect
        value=""
        options={options}
        onChange={jest.fn()}
        error={{ type: 'required', message: 'Escolha um turno' }}
      />,
    );
    expect(getByText('Escolha um turno')).toBeTruthy();
    rerender(
      <CustomSelect value="" options={options} onChange={jest.fn()} error />,
    );
    expect(getByText('Campo inválido')).toBeTruthy();
  });

  it('nao abre quando desabilitado ou carregando', () => {
    const { getByText, queryByText, rerender } = render(
      <CustomSelect value="" options={options} onChange={jest.fn()} disabled />,
    );
    fireEvent.press(getByText('Selecione...'));
    expect(queryByText('Cancelar')).toBeNull();
    rerender(
      <CustomSelect value="" options={options} onChange={jest.fn()} loading />,
    );
    expect(queryByText('Selecione...')).toBeNull();
  });

  it('usa o select nativo do navegador no web', () => {
    Platform.OS = 'web';
    const onChange = jest.fn();
    const { UNSAFE_root } = render(
      <CustomSelect value="" options={options} onChange={onChange} />,
    );
    const select = UNSAFE_root.findByType(
      'select' as unknown as React.ElementType,
    );
    select.props.onChange({ target: { value: 'M' } });
    expect(onChange).toHaveBeenCalledWith('M');
  });
});
