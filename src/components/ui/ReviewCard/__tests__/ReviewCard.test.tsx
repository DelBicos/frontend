import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ReviewCard } from '..';

describe('ReviewCard', () => {
  it('mostra pessoa, servico, nota e comentario', () => {
    const { getByText, getByLabelText, queryByText } = render(
      <ReviewCard
        rating={5}
        serviceTitle="Pintura"
        personName="Ana Souza"
        date="10/10/2026"
        review="  Otimo trabalho  "
      />,
    );
    expect(getByText('Ana Souza')).toBeTruthy();
    expect(getByText('Pintura · 10/10/2026')).toBeTruthy();
    expect(getByLabelText('Nota 5 de 5, Excelente')).toBeTruthy();
    expect(getByText('“Otimo trabalho”')).toBeTruthy();
    expect(queryByText('Editar avaliação')).toBeNull();
  });

  it('sem comentario avisa e permite editar', () => {
    const onEdit = jest.fn();
    const { getByText, getByLabelText } = render(
      <ReviewCard
        rating={7}
        serviceTitle="Faxina"
        personName="Bia"
        date="hoje"
        review="   "
        onEdit={onEdit}
      />,
    );
    expect(getByText('Sem comentário.')).toBeTruthy();
    expect(getByLabelText('Nota 7 de 5, ')).toBeTruthy();
    fireEvent.press(getByText('Editar avaliação'));
    expect(onEdit).toHaveBeenCalled();
  });
});
