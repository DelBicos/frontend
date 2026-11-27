import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ConfirmationModal from '../ConfirmationModal';

describe('ConfirmationModal', () => {
  it('deve exibir título, mensagem e textos padrão', () => {
    const { getByText } = render(
      <ConfirmationModal
        visible
        title="Cancelar agendamento?"
        message="Essa ação não pode ser desfeita."
        onCancel={jest.fn()}
        onConfirm={jest.fn()}
      />,
    );
    expect(getByText('Cancelar agendamento?')).toBeTruthy();
    expect(getByText('Essa ação não pode ser desfeita.')).toBeTruthy();
    expect(getByText('Cancelar')).toBeTruthy();
    expect(getByText('Confirmar')).toBeTruthy();
  });

  it('deve chamar os callbacks com textos personalizados', () => {
    const onCancel = jest.fn();
    const onConfirm = jest.fn();
    const { getByLabelText } = render(
      <ConfirmationModal
        visible
        title="Sair"
        message="Deseja sair?"
        onCancel={onCancel}
        onConfirm={onConfirm}
        cancelText="Ficar"
        confirmText="Sair agora"
        variant="info"
      />,
    );
    fireEvent.press(getByLabelText('Ficar'));
    fireEvent.press(getByLabelText('Sair agora'));
    expect(onCancel).toHaveBeenCalled();
    expect(onConfirm).toHaveBeenCalled();
  });
});
