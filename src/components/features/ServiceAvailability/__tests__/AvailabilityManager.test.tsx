import React, { useState } from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import AvailabilityManager, {
  type AvailabilityItem,
} from '../AvailabilityManager';

/** Formulario minimo para o componente: guarda a lista em estado. */
function Harness({
  initial = [],
  onChange,
}: {
  initial?: AvailabilityItem[];
  onChange: jest.Mock;
}) {
  const [items, setItems] = useState<AvailabilityItem[] | undefined>(initial);
  return (
    <AvailabilityManager
      watch={() => items}
      setValue={(_name, value) => {
        onChange(value);
        setItems(value);
      }}
    />
  );
}

const renderManager = (initial?: AvailabilityItem[]) => {
  const onChange = jest.fn();
  const utils = render(<Harness initial={initial} onChange={onChange} />);
  const [startInput, endInput] = [
    utils.getByPlaceholderText('09:00'),
    utils.getByPlaceholderText('18:00'),
  ];
  return { ...utils, onChange, startInput, endInput };
};

describe('AvailabilityManager', () => {
  it('deve começar com segunda marcada e lista vazia', () => {
    const { getByLabelText, getByText, startInput, endInput } = renderManager();

    expect(getByLabelText('Segunda').props.accessibilityState).toEqual({
      selected: true,
    });
    expect(getByLabelText('Terça').props.accessibilityState).toEqual({
      selected: false,
    });
    expect(startInput.props.value).toBe('09:00');
    expect(endInput.props.value).toBe('12:00');
    expect(getByText('Nenhuma disponibilidade adicionada.')).toBeTruthy();
  });

  it('deve tratar a lista indefinida como vazia', () => {
    const onChange = jest.fn();
    const { getByText } = render(
      <AvailabilityManager watch={() => undefined} setValue={onChange} />,
    );

    expect(getByText('Nenhuma disponibilidade adicionada.')).toBeTruthy();
  });

  it('deve adicionar o horário para os dias escolhidos e voltar ao padrão', () => {
    const { getByLabelText, getByText, onChange, startInput, endInput } =
      renderManager();

    fireEvent.press(getByLabelText('Quarta'));
    fireEvent.changeText(startInput, '8:0');
    fireEvent.changeText(endInput, '17:30');
    fireEvent.press(getByText('+  Adicionar'));

    expect(onChange).toHaveBeenLastCalledWith([
      { day: 1, start: '08:00', end: '17:30' },
      { day: 3, start: '08:00', end: '17:30' },
    ]);
    expect(getByText('Segunda')).toBeTruthy();
    expect(getByText('Quarta')).toBeTruthy();
    expect(startInput.props.value).toBe('09:00');
    expect(getByLabelText('Quarta').props.accessibilityState).toEqual({
      selected: false,
    });
  });

  it('deve rejeitar formato de hora inválido', () => {
    const { getByText, onChange, startInput } = renderManager();

    fireEvent.changeText(startInput, '25:00');
    fireEvent.press(getByText('+  Adicionar'));

    expect(getByText('Use o formato HH:MM (ex: 09:00)')).toBeTruthy();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('deve rejeitar texto que não é hora', () => {
    const { getByText, endInput } = renderManager();

    fireEvent.changeText(endInput, 'meio-dia');
    fireEvent.press(getByText('+  Adicionar'));

    expect(getByText('Use o formato HH:MM (ex: 09:00)')).toBeTruthy();
  });

  it('deve rejeitar início depois do fim', () => {
    const { getByText, onChange, startInput } = renderManager();

    fireEvent.changeText(startInput, '13:00');
    fireEvent.press(getByText('+  Adicionar'));

    expect(
      getByText('Hora de início deve ser antes da hora de término.'),
    ).toBeTruthy();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('deve exigir ao menos um dia e limpar o erro ao corrigir', () => {
    const { getByLabelText, getByText, queryByText, onChange } =
      renderManager();

    fireEvent.press(getByLabelText('Segunda'));
    fireEvent.press(getByText('+  Adicionar'));
    expect(getByText('Selecione ao menos um dia da semana.')).toBeTruthy();
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.press(getByLabelText('Sexta'));
    fireEvent.press(getByText('+  Adicionar'));

    expect(queryByText('Selecione ao menos um dia da semana.')).toBeNull();
    expect(onChange).toHaveBeenLastCalledWith([
      { day: 5, start: '09:00', end: '12:00' },
    ]);
  });

  it('deve ignorar horários duplicados ou sobrepostos no mesmo dia', () => {
    const { getByLabelText, getByText, onChange, startInput, endInput } =
      renderManager([
        { day: 1, start: '09:00', end: '12:00' },
        { day: 2, start: '10:00', end: '11:00' },
      ]);

    fireEvent.press(getByLabelText('Terça'));
    fireEvent.press(getByLabelText('Quinta'));
    fireEvent.changeText(startInput, '09:00');
    fireEvent.changeText(endInput, '12:00');
    fireEvent.press(getByText('+  Adicionar'));

    expect(onChange).toHaveBeenLastCalledWith([
      { day: 1, start: '09:00', end: '12:00' },
      { day: 2, start: '10:00', end: '11:00' },
      { day: 4, start: '09:00', end: '12:00' },
    ]);
  });

  it('deve listar em ordem de dia e horário', () => {
    const { getAllByText } = renderManager([
      { day: 3, start: '14:00', end: '15:00' },
      { day: 3, start: '08:00', end: '09:00' },
      { day: 9, start: '08:00', end: '09:00' },
    ]);

    expect(getAllByText(/→ /).map((n) => n.props.children.join(''))).toEqual([
      '08:00 → 09:00',
      '14:00 → 15:00',
      '08:00 → 09:00',
    ]);
    expect(getAllByText('Dia 9')).toHaveLength(1);
  });

  it('deve remover um horário', () => {
    const { getAllByText, onChange, getByText } = renderManager([
      { day: 1, start: '09:00', end: '12:00' },
    ]);

    fireEvent.press(getAllByText('✕')[0]);

    expect(onChange).toHaveBeenLastCalledWith([]);
    expect(getByText('Nenhuma disponibilidade adicionada.')).toBeTruthy();
  });

  it('deve editar um horário existente', () => {
    const { getAllByText, getByText, onChange, startInput, endInput } =
      renderManager([
        { day: 1, start: '09:00', end: '12:00' },
        { day: 2, start: '09:00', end: '12:00' },
      ]);

    fireEvent.press(getAllByText('Editar')[1]);
    expect(startInput.props.value).toBe('09:00');
    expect(getByText('✓  Salvar alteração')).toBeTruthy();

    fireEvent.changeText(startInput, '13:00');
    fireEvent.changeText(endInput, '18:00');
    fireEvent.press(getByText('✓  Salvar alteração'));

    expect(onChange).toHaveBeenLastCalledWith([
      { day: 1, start: '09:00', end: '12:00' },
      { day: 2, start: '13:00', end: '18:00' },
    ]);
    expect(getByText('+  Adicionar')).toBeTruthy();
  });

  it('deve recusar a edição que sobrepõe outro horário do mesmo dia', () => {
    const { getAllByText, getByText, onChange, endInput } = renderManager([
      { day: 1, start: '09:00', end: '12:00' },
      { day: 1, start: '13:00', end: '15:00' },
    ]);

    fireEvent.press(getAllByText('Editar')[0]);
    fireEvent.changeText(endInput, '14:00');
    fireEvent.press(getByText('✓  Salvar alteração'));

    expect(
      getByText('Já existe uma disponibilidade que se sobrepõe neste dia.'),
    ).toBeTruthy();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('deve destacar o dia e o item ao passar o mouse', () => {
    const { getByLabelText, getByText } = renderManager([
      { day: 1, start: '09:00', end: '12:00' },
    ]);

    fireEvent(getByLabelText('Terça'), 'hoverIn');
    fireEvent(getByLabelText('Terça'), 'hoverOut');
    expect(getByText('Ter')).toBeTruthy();

    // O evento sobe do texto do dia ate o card do item.
    fireEvent(getByText('Segunda'), 'hoverIn');
    fireEvent(getByText('Segunda'), 'hoverOut');
    expect(getByText('09:00 → 12:00')).toBeTruthy();
  });
});
