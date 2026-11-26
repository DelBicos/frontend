import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

import { ReviewCard } from '../ReviewCard';
import Stars from '@components/ui/Stars';

type Node = ReturnType<typeof render>['UNSAFE_root'];

describe('ReviewCard', () => {
  it('deve exibir nota, comentário e editar', () => {
    const onEdit = jest.fn();
    const { getByText, getByLabelText } = render(
      <ReviewCard
        rating={5}
        serviceTitle="Instalação"
        personName="Maria Silva"
        date="10/11/2026"
        review="  Ótimo serviço  "
        onEdit={onEdit}
      />,
    );
    expect(getByText('Maria Silva')).toBeTruthy();
    expect(getByText('Instalação · 10/11/2026')).toBeTruthy();
    expect(getByText('“Ótimo serviço”')).toBeTruthy();
    expect(getByLabelText('Nota 5 de 5, Excelente')).toBeTruthy();
    fireEvent.press(getByText('Editar avaliação'));
    expect(onEdit).toHaveBeenCalled();
  });

  it('deve indicar ausência de comentário e esconder editar', () => {
    const { getByText, queryByText } = render(
      <ReviewCard
        rating={2}
        serviceTitle="Pintura"
        personName="João"
        date="01/01/2026"
        review="   "
      />,
    );
    expect(getByText('Sem comentário.')).toBeTruthy();
    expect(getByText('Regular')).toBeTruthy();
    expect(queryByText('Editar avaliação')).toBeNull();
  });

  it('deve tolerar nota fora da escala', () => {
    const { getByLabelText } = render(
      <ReviewCard rating={7} serviceTitle="X" personName="Y" date="Z" />,
    );
    expect(getByLabelText('Nota 7 de 5, ')).toBeTruthy();
  });
});

describe('Stars', () => {
  it.each([
    [5, ['star', 'star', 'star', 'star', 'star']],
    [3.5, ['star', 'star', 'star', 'star-half-o', 'star-o']],
    [0, ['star-o', 'star-o', 'star-o', 'star-o', 'star-o']],
  ])('nota %p gera os ícones certos', (value, names) => {
    const { UNSAFE_root } = render(<Stars value={value} />);
    const icons = UNSAFE_root.findAll(
      (n: Node) => typeof n.props.name === 'string' && n.props.size === 16,
      { deep: false },
    );
    expect(icons.map((n: Node) => n.props.name)).toEqual(names);
  });
});
