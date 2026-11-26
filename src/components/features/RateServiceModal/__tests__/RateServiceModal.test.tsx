import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { RateServiceModal } from '..';
import { useAppointmentStore } from '@stores/Appointment';

jest.mock('@lib/helpers/httpClient', () => ({
  backendHttpClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('@expo/vector-icons', () => ({ FontAwesome: () => null }));

type Props = React.ComponentProps<typeof RateServiceModal>;
type ReviewFn = ReturnType<
  typeof useAppointmentStore.getState
>['reviewAppointment'];

const reviewAppointment = jest.fn();

const renderModal = (props: Partial<Props> = {}) => {
  const onClose = jest.fn();
  const onSuccess = jest.fn();
  const utils = render(
    <RateServiceModal
      visible
      appointmentId={42}
      professionalName="Ana Paula"
      serviceTitle="Faxina"
      onClose={onClose}
      onSuccess={onSuccess}
      {...props}
    />,
  );
  return { ...utils, onClose, onSuccess };
};

describe('RateServiceModal', () => {
  beforeEach(() => {
    reviewAppointment.mockReset();
    useAppointmentStore.setState({
      reviewAppointment: reviewAppointment as unknown as ReviewFn,
    });
  });

  it('deve abrir para uma nova avaliação', () => {
    const { getByText } = renderModal();

    expect(getByText('Avaliar atendimento')).toBeTruthy();
    expect(getByText('Toque nas estrelas')).toBeTruthy();
    expect(getByText('0/500')).toBeTruthy();
  });

  it('deve exigir uma nota antes de enviar', async () => {
    const { getByText } = renderModal();

    await act(async () => {
      fireEvent.press(getByText('Enviar avaliação'));
    });

    expect(getByText('Escolha de 1 a 5 estrelas.')).toBeTruthy();
    expect(reviewAppointment).not.toHaveBeenCalled();
  });

  it('deve enviar a nota e o comentário e mostrar o agradecimento', async () => {
    reviewAppointment.mockResolvedValue(true);
    const { getByText, getByLabelText, getByPlaceholderText, onSuccess, onClose } =
      renderModal();

    fireEvent.press(getByLabelText('4 estrelas, Muito bom'));
    expect(getByText('Muito bom')).toBeTruthy();
    fireEvent.changeText(
      getByPlaceholderText('Conte o que achou do atendimento'),
      '  Ótimo serviço  ',
    );

    await act(async () => {
      fireEvent.press(getByText('Enviar avaliação'));
    });

    expect(reviewAppointment).toHaveBeenCalledWith(42, 4, 'Ótimo serviço');
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(getByText('Obrigado!')).toBeTruthy();
    expect(
      getByText('Sua avaliação foi publicada no perfil de Ana Paula.'),
    ).toBeTruthy();

    fireEvent.press(getByText('Fechar'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('deve limitar o comentário a 500 caracteres', () => {
    const { getByText, getByPlaceholderText } = renderModal();

    fireEvent.changeText(
      getByPlaceholderText('Conte o que achou do atendimento'),
      'a'.repeat(600),
    );

    expect(getByText('500/500')).toBeTruthy();
  });

  it('deve mostrar erro quando a API recusa a avaliação', async () => {
    reviewAppointment.mockResolvedValue(false);
    const { getByText, getByLabelText, onSuccess } = renderModal();

    fireEvent.press(getByLabelText('1 estrela, Ruim'));
    await act(async () => {
      fireEvent.press(getByText('Enviar avaliação'));
    });

    expect(
      getByText('Não foi possível enviar a avaliação. Tente de novo.'),
    ).toBeTruthy();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('deve mostrar erro quando o envio lança exceção', async () => {
    reviewAppointment.mockRejectedValue(new Error('rede'));
    const { getByText, getByLabelText } = renderModal();

    fireEvent.press(getByLabelText('5 estrelas, Excelente'));
    await act(async () => {
      fireEvent.press(getByText('Enviar avaliação'));
    });

    expect(
      getByText('Não foi possível enviar a avaliação. Tente de novo.'),
    ).toBeTruthy();
  });

  it('deve abrir em modo edição com a avaliação existente', () => {
    const { getByText, getByDisplayValue } = renderModal({
      existingRating: 3,
      existingReview: 'Bom atendimento',
    });

    expect(getByText('Editar avaliação')).toBeTruthy();
    expect(getByText('Bom')).toBeTruthy();
    expect(getByDisplayValue('Bom atendimento')).toBeTruthy();
  });

  it('deve fechar pelo botão do cabeçalho e pelo cancelar', () => {
    const { getByLabelText, getByText, onClose } = renderModal();

    fireEvent.press(getByLabelText('Fechar'));
    fireEvent.press(getByText('Cancelar'));

    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
