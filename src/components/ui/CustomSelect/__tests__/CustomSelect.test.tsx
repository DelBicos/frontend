import React from 'react';
import { Platform } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';

import CustomSelect from '../CustomSelect';

type Node = ReturnType<typeof render>['UNSAFE_root'];

const options = [
  { label: 'Manhã', value: 'am' },
  { label: 'Tarde', value: 'pm' },
];

describe('CustomSelect', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('deve exibir o placeholder e abrir a lista ao tocar', () => {
    const onChange = jest.fn();
    const { getAllByText, getByText } = render(
      <CustomSelect
        label="Período"
        value=""
        options={options}
        onChange={onChange}
      />,
    );
    fireEvent.press(getByText('Selecione...'));
    fireEvent.press(getByText('Tarde'));
    expect(onChange).toHaveBeenCalledWith('pm');
    expect(getAllByText('Período').length).toBeGreaterThan(0);
  });

  it('deve exibir a opção selecionada e fechar com Cancelar', () => {
    const onChange = jest.fn();
    const { getAllByText, getByText } = render(
      <CustomSelect value="am" options={options} onChange={onChange} />,
    );
    fireEvent.press(getAllByText('Manhã')[0]);
    fireEvent.press(getByText('Cancelar'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it.each([
    ['Campo obrigatório', 'Campo obrigatório'],
    [{ type: 'required', message: 'Escolha um período' }, 'Escolha um período'],
    [{ type: 'required' }, 'Campo inválido'],
    [true, 'Campo inválido'],
  ])('deve exibir a mensagem de erro para %p', (error, message) => {
    const { getByText } = render(
      <CustomSelect
        value=""
        options={options}
        onChange={jest.fn()}
        error={error as never}
      />,
    );
    expect(getByText(message)).toBeTruthy();
  });

  it('não deve abrir quando carregando ou desabilitado', () => {
    const { queryByText, rerender, getByText } = render(
      <CustomSelect value="" options={options} onChange={jest.fn()} loading />,
    );
    expect(queryByText('Selecione...')).toBeNull();
    rerender(
      <CustomSelect value="" options={options} onChange={jest.fn()} disabled />,
    );
    fireEvent.press(getByText('Selecione...'));
    expect(queryByText('Cancelar')).toBeNull();
  });

  it('deve fechar o modal pelo botão voltar', () => {
    const { getByText, UNSAFE_root } = render(
      <CustomSelect value="" options={options} onChange={jest.fn()} />,
    );
    fireEvent.press(getByText('Selecione...'));
    const modal = UNSAFE_root.findAll(
      (n: Node) => typeof n.props.onRequestClose === 'function',
    )[0];
    fireEvent(modal, 'requestClose');
    expect(modal).toBeTruthy();
  });

  it('deve usar um select nativo no web', () => {
    jest.replaceProperty(Platform, 'OS', 'web');
    const onChange = jest.fn();
    const { UNSAFE_root } = render(
      <CustomSelect value="" options={options} onChange={onChange} />,
    );
    const select = UNSAFE_root.findAll((n: Node) => n.type === 'select')[0];
    select.props.onChange({ target: { value: 'am' } });
    expect(onChange).toHaveBeenCalledWith('am');
  });
});
