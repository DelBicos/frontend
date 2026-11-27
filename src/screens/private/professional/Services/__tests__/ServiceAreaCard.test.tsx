import React from 'react';
import { ActivityIndicator } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ServiceAreaCard from '../ServiceAreaCard';
import { useProfessionalStore } from '@stores/Professional';

jest.mock('@lib/helpers/httpClient', () => ({
  backendHttpClient: { get: jest.fn(), post: jest.fn(), put: jest.fn() },
}));

describe('ServiceAreaCard', () => {
  const mockFetchById = jest.fn();
  const mockUpdateRadius = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchById.mockResolvedValue({ service_radius_km: 10 });
    mockUpdateRadius.mockResolvedValue(undefined);
    useProfessionalStore.setState({
      fetchProfessionalById: mockFetchById,
      updateRadius: mockUpdateRadius,
    });
  });

  it('deve carregar o raio atual do profissional', async () => {
    const { UNSAFE_queryByType, findByText } = render(
      <ServiceAreaCard professionalId={3} />,
    );

    expect(UNSAFE_queryByType(ActivityIndicator)).toBeTruthy();
    expect(await findByText('Atualmente até 10 km.')).toBeTruthy();
    expect(mockFetchById).toHaveBeenCalledWith(3);
  });

  it('deve tratar a falta de raio como sem limite', async () => {
    mockFetchById.mockResolvedValueOnce(null);
    const { findByText } = render(<ServiceAreaCard professionalId={3} />);

    expect(
      await findByText('Atualmente sem limite de distância.'),
    ).toBeTruthy();
  });

  it('deve salvar ao escolher outro raio pronto', async () => {
    const { findByText, getByText } = render(
      <ServiceAreaCard professionalId={3} />,
    );
    await findByText('Atualmente até 10 km.');

    // Tocar no raio atual nao salva de novo.
    fireEvent.press(getByText('10 km'));
    expect(mockUpdateRadius).not.toHaveBeenCalled();

    fireEvent.press(getByText('Sem limite'));
    expect(
      await findByText('Salvo: você atende sem limite de distância.'),
    ).toBeTruthy();
    expect(mockUpdateRadius).toHaveBeenCalledWith(3, 0);

    fireEvent.press(getByText('20 km'));
    expect(await findByText('Salvo: você atende até 20 km.')).toBeTruthy();
  });

  it('deve aplicar um raio digitado só com números', async () => {
    const { findByText, getByLabelText, getByText } = render(
      <ServiceAreaCard professionalId={3} />,
    );
    await findByText('Atualmente até 10 km.');

    const input = getByLabelText('Outro raio de atendimento em quilômetros');
    fireEvent.changeText(input, '3a5');
    expect(input.props.value).toBe('35');

    fireEvent.press(getByText('Aplicar'));

    expect(await findByText('Salvo: você atende até 35 km.')).toBeTruthy();
    expect(mockUpdateRadius).toHaveBeenCalledWith(3, 35);
    // Raio fora dos prontos aparece como opcao selecionada.
    expect(getByText('35 km')).toBeTruthy();
    expect(input.props.value).toBe('');
  });

  it('deve salvar o raio digitado ao confirmar no teclado', async () => {
    const { findByText, getByLabelText } = render(
      <ServiceAreaCard professionalId={3} />,
    );
    await findByText('Atualmente até 10 km.');

    const input = getByLabelText('Outro raio de atendimento em quilômetros');
    fireEvent(input, 'submitEditing');
    expect(mockUpdateRadius).not.toHaveBeenCalled();

    fireEvent.changeText(input, '15');
    fireEvent(input, 'submitEditing');
    await waitFor(() => expect(mockUpdateRadius).toHaveBeenCalledWith(3, 15));
  });

  it('deve avisar quando não consegue salvar', async () => {
    mockUpdateRadius.mockRejectedValueOnce(new Error('falhou'));
    const { findByText, getByText } = render(
      <ServiceAreaCard professionalId={3} />,
    );
    await findByText('Atualmente até 10 km.');

    fireEvent.press(getByText('5 km'));

    expect(
      await findByText('Não foi possível salvar. Tente novamente.'),
    ).toBeTruthy();
  });
});
