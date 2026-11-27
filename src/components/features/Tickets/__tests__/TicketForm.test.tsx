import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TicketForm } from '../TicketForm';

const TITLE_PLACEHOLDER = 'Resuma o problema em poucas palavras';
const DESCRIPTION_PLACEHOLDER = /Descreva o que aconteceu/;

const renderForm = (
  props: Partial<React.ComponentProps<typeof TicketForm>> = {},
) => {
  const onSubmit = jest.fn();
  const onCancel = jest.fn();
  const utils = render(
    <TicketForm
      isSubmitting={false}
      onSubmit={onSubmit}
      onCancel={onCancel}
      {...props}
    />,
  );
  return { ...utils, onSubmit, onCancel };
};

const isSubmitDisabled = (getByTestId: (id: string) => any) =>
  getByTestId('ticket-submit-button').props.accessibilityState?.disabled;

describe('TicketForm', () => {
  // ─── VALORES INICIAIS ────────────────────────────────
  it('deve começar vazio e com o botão desabilitado', () => {
    const { getByTestId, getByText } = renderForm();

    expect(getByTestId('ticket-title-input').props.value).toBe('');
    expect(getByTestId('ticket-description-input').props.value).toBe('');
    expect(getByText('0/100')).toBeTruthy();
    expect(getByText('0/2000')).toBeTruthy();
    expect(isSubmitDisabled(getByTestId)).toBe(true);
  });

  it('deve aplicar os valores iniciais', () => {
    const { getByTestId } = renderForm({
      initialValues: {
        title: 'Problema com agendamento #6BDOKZ',
        description: 'Descrição pré-preenchida',
        category: 'AGENDAMENTO',
        priority: 'ALTA',
      },
    });

    expect(getByTestId('ticket-title-input').props.value).toBe(
      'Problema com agendamento #6BDOKZ',
    );
    expect(
      getByTestId('ticket-priority-ALTA').props.accessibilityState?.selected,
    ).toBe(true);
    expect(isSubmitDisabled(getByTestId)).toBe(false);
  });

  it('deve exibir o banner de contexto quando informado', () => {
    const { getByText } = renderForm({
      contextBanner: 'Chamado relacionado ao agendamento #6BDOKZ',
    });

    expect(
      getByText('Chamado relacionado ao agendamento #6BDOKZ'),
    ).toBeTruthy();
  });

  it('deve limitar o tamanho de título e descrição', () => {
    const { getByTestId } = renderForm();

    expect(getByTestId('ticket-title-input').props.maxLength).toBe(100);
    expect(getByTestId('ticket-description-input').props.maxLength).toBe(2000);
  });

  it('deve atualizar os contadores ao digitar', () => {
    const { getByPlaceholderText, getByText } = renderForm();

    fireEvent.changeText(getByPlaceholderText(TITLE_PLACEHOLDER), 'Olá');
    fireEvent.changeText(
      getByPlaceholderText(DESCRIPTION_PLACEHOLDER),
      'Dez letras',
    );

    expect(getByText('3/100')).toBeTruthy();
    expect(getByText('10/2000')).toBeTruthy();
  });

  // ─── VALIDAÇÃO ───────────────────────────────────────
  it('deve considerar o título sem os espaços das pontas', () => {
    const { getByPlaceholderText, getByText, getByTestId } = renderForm();

    fireEvent.changeText(getByPlaceholderText(TITLE_PLACEHOLDER), '   Erro   ');
    fireEvent.changeText(
      getByPlaceholderText(DESCRIPTION_PLACEHOLDER),
      'Descrição suficientemente longa',
    );
    fireEvent.press(getByText('Agendamento'));
    fireEvent.press(getByTestId('ticket-priority-BAIXA'));

    expect(isSubmitDisabled(getByTestId)).toBe(true);
  });

  it('deve aceitar os valores mínimos (5 e 10 caracteres)', () => {
    const { getByPlaceholderText, getByText, getByTestId } = renderForm();

    fireEvent.changeText(getByPlaceholderText(TITLE_PLACEHOLDER), 'Erros');
    fireEvent.changeText(
      getByPlaceholderText(DESCRIPTION_PLACEHOLDER),
      '0123456789',
    );
    fireEvent.press(getByText('Agendamento'));
    fireEvent.press(getByTestId('ticket-priority-BAIXA'));

    expect(isSubmitDisabled(getByTestId)).toBe(false);
  });

  // ─── ENVIO ───────────────────────────────────────────
  it('deve enviar os valores sem espaços nas pontas', () => {
    const { getByPlaceholderText, getByText, getByTestId, onSubmit } =
      renderForm();

    fireEvent.changeText(
      getByPlaceholderText(TITLE_PLACEHOLDER),
      '  Pagamento não confirmado  ',
    );
    fireEvent.changeText(
      getByPlaceholderText(DESCRIPTION_PLACEHOLDER),
      '  Paguei e o agendamento continua pendente.  ',
    );
    fireEvent.press(getByText('Pagamento'));
    fireEvent.press(getByTestId('ticket-priority-CRITICA'));
    fireEvent.press(getByTestId('ticket-submit-button'));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({
      title: 'Pagamento não confirmado',
      description: 'Paguei e o agendamento continua pendente.',
      category: 'PAGAMENTO',
      priority: 'CRITICA',
    });
  });

  it('deve recusar título e descrição acima do limite que passem do maxLength', () => {
    const { getByPlaceholderText, getByText, getByTestId, onSubmit } =
      renderForm();

    fireEvent.changeText(
      getByPlaceholderText(TITLE_PLACEHOLDER),
      'a'.repeat(101),
    );
    fireEvent.changeText(
      getByPlaceholderText(DESCRIPTION_PLACEHOLDER),
      'b'.repeat(2001),
    );
    fireEvent.press(getByText('Pagamento'));
    fireEvent.press(getByTestId('ticket-priority-BAIXA'));
    fireEvent.press(getByTestId('ticket-submit-button'));

    expect(
      getByText('O título deve ter no máximo 100 caracteres.'),
    ).toBeTruthy();
    expect(
      getByText('A descrição deve ter no máximo 2000 caracteres.'),
    ).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('deve trocar a prioridade quando o usuário escolhe outra', () => {
    const { getByTestId, onSubmit } = renderForm({
      initialValues: {
        title: 'Título válido',
        description: 'Descrição suficientemente longa',
        category: 'OUTROS',
        priority: 'BAIXA',
      },
    });

    fireEvent.press(getByTestId('ticket-priority-ALTA'));
    fireEvent.press(getByTestId('ticket-submit-button'));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ priority: 'ALTA' }),
    );
  });

  // ─── ENVIANDO ────────────────────────────────────────
  it('deve bloquear os campos e os botões enquanto envia', () => {
    const { getByTestId, queryByText, onCancel } = renderForm({
      isSubmitting: true,
      initialValues: {
        title: 'Título válido',
        description: 'Descrição suficientemente longa',
        category: 'OUTROS',
        priority: 'BAIXA',
      },
    });

    expect(getByTestId('ticket-title-input').props.editable).toBe(false);
    expect(getByTestId('ticket-description-input').props.editable).toBe(false);
    expect(isSubmitDisabled(getByTestId)).toBe(true);
    expect(queryByText('Enviar chamado')).toBeNull();

    fireEvent.press(getByTestId('ticket-cancel-button'));
    expect(onCancel).not.toHaveBeenCalled();
  });

  // ─── ERRO / CANCELAR ─────────────────────────────────
  it('deve exibir o erro externo', () => {
    const { getByText } = renderForm({
      externalError: 'Agendamento com código 6BDOKZ não encontrado.',
    });

    expect(
      getByText('Agendamento com código 6BDOKZ não encontrado.'),
    ).toBeTruthy();
  });

  it('deve chamar onCancel ao tocar em Cancelar', () => {
    const { getByTestId, onCancel } = renderForm();

    fireEvent.press(getByTestId('ticket-cancel-button'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
