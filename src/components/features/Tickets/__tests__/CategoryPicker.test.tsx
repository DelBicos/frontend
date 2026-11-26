import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CategoryPicker } from '../CategoryPicker';

describe('CategoryPicker', () => {
  it('deve renderizar as 7 categorias por padrão', () => {
    const { getByText } = render(
      <CategoryPicker value={null} onChange={jest.fn()} />,
    );

    [
      'Agendamento',
      'Pagamento',
      'Serviço',
      'Prestador',
      'Cliente',
      'Sugestão',
      'Outros',
    ].forEach((label) => expect(getByText(label)).toBeTruthy());
  });

  it('deve renderizar só as categorias disponíveis', () => {
    const { getByText, queryByText } = render(
      <CategoryPicker
        value={null}
        onChange={jest.fn()}
        availableCategories={['AGENDAMENTO', 'CLIENTE']}
      />,
    );

    expect(getByText('Agendamento')).toBeTruthy();
    expect(getByText('Cliente')).toBeTruthy();
    expect(queryByText('Prestador')).toBeNull();
    expect(queryByText('Pagamento')).toBeNull();
  });

  it('deve chamar onChange com o valor do enum', () => {
    const onChange = jest.fn();
    const { getByText } = render(
      <CategoryPicker value={null} onChange={onChange} />,
    );

    fireEvent.press(getByText('Serviço'));
    expect(onChange).toHaveBeenCalledWith('SERVICO');
  });

  it('deve marcar apenas a categoria selecionada', () => {
    const { getAllByRole } = render(
      <CategoryPicker
        value="PAGAMENTO"
        onChange={jest.fn()}
        availableCategories={['AGENDAMENTO', 'PAGAMENTO']}
      />,
    );

    const [agendamento, pagamento] = getAllByRole('button');
    expect(agendamento.props.accessibilityState?.selected).toBe(false);
    expect(pagamento.props.accessibilityState?.selected).toBe(true);
  });

  it('deve exibir a mensagem de erro', () => {
    const { getByText } = render(
      <CategoryPicker
        value={null}
        onChange={jest.fn()}
        error="Selecione uma categoria."
      />,
    );

    expect(getByText('Selecione uma categoria.')).toBeTruthy();
  });

  it('não deve exibir erro quando não houver', () => {
    const { queryByText } = render(
      <CategoryPicker value={null} onChange={jest.fn()} error={null} />,
    );

    expect(queryByText('Selecione uma categoria.')).toBeNull();
  });
});
