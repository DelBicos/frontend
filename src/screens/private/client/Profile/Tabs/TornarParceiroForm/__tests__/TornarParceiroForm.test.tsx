import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import TornarParceiroForm from '../TornarParceiroForm';
import { useUserStore } from '@stores/User';
import type { User } from '@stores/User/types';

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

jest.mock('@lib/helpers/httpClient', () => ({
  backendHttpClient: { get: jest.fn(), post: jest.fn(), put: jest.fn() },
}));

// CPF valido (digitos verificadores corretos).
const VALID_CPF = '52998224725';
const DESCRIPTION =
  'Sou eletricista há 10 anos e faço instalações residenciais.';

describe('TornarParceiroForm', () => {
  const mockBecome = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useUserStore.setState({
      user: { id: 31, cpf: '' } as unknown as User,
      becomeProfessional: mockBecome,
    });
  });

  it('deve avisar quem já é colaborador e abrir o painel', () => {
    useUserStore.setState({
      user: { id: 31, professional_id: 3 } as unknown as User,
    });
    const { getByText } = render(<TornarParceiroForm />);

    expect(getByText('Você já é colaborador')).toBeTruthy();
    fireEvent.press(getByText('Abrir painel do colaborador'));
    expect(mockNavigate).toHaveBeenCalledWith('ProfessionalTabs', {
      screen: 'ProfessionalHomeTab',
    });
  });

  it('deve mostrar o CPF da conta só para leitura', () => {
    useUserStore.setState({
      user: { id: 31, cpf: VALID_CPF } as unknown as User,
    });
    const { getByText, queryByLabelText } = render(<TornarParceiroForm />);

    expect(getByText('CPF da sua conta')).toBeTruthy();
    expect(getByText('529.982.247-25')).toBeTruthy();
    expect(queryByLabelText('CPF')).toBeNull();
  });

  it('deve validar documento e apresentação', () => {
    const { getByText } = render(<TornarParceiroForm />);

    fireEvent.press(getByText('Quero ser colaborador'));

    expect(getByText('Informe o CPF ou o CNPJ.')).toBeTruthy();
    expect(
      getByText('Escreva pelo menos 30 caracteres sobre você.'),
    ).toBeTruthy();
    expect(mockBecome).not.toHaveBeenCalled();
  });

  it('deve recusar CPF inválido e CNPJ incompleto', () => {
    const { getByText, getByLabelText, getByPlaceholderText } = render(
      <TornarParceiroForm />,
    );

    fireEvent.changeText(getByLabelText('CPF'), '11111111111');
    fireEvent.changeText(getByPlaceholderText('00.000.000/0000-00'), '1234');
    fireEvent.press(getByText('Quero ser colaborador'));

    expect(getByText('CPF inválido.')).toBeTruthy();
    expect(getByText('CNPJ incompleto.')).toBeTruthy();
  });

  it('deve limitar a apresentação a 1500 caracteres', () => {
    const { getByLabelText, getByText } = render(<TornarParceiroForm />);

    fireEvent.changeText(getByLabelText('Apresentação'), 'a'.repeat(1600));
    expect(getByText('1500/1500')).toBeTruthy();
  });

  it('deve enviar o cadastro com CNPJ e raio escolhido', async () => {
    mockBecome.mockResolvedValue(undefined);
    const { getByText, getByLabelText, getByPlaceholderText, findByText } =
      render(<TornarParceiroForm />);

    fireEvent.changeText(getByLabelText('CPF'), VALID_CPF);
    fireEvent.changeText(
      getByPlaceholderText('00.000.000/0000-00'),
      '11222333000181',
    );
    expect(getByPlaceholderText('00.000.000/0000-00').props.value).toBe(
      '11.222.333/0001-81',
    );
    fireEvent.changeText(getByLabelText('Apresentação'), `  ${DESCRIPTION}  `);
    fireEvent.press(getByText('Sem limite'));
    fireEvent.press(getByText('Quero ser colaborador'));

    expect(await findByText('Cadastro concluído!')).toBeTruthy();
    expect(mockBecome).toHaveBeenCalledWith({
      cpf: VALID_CPF,
      cnpj: '11222333000181',
      description: DESCRIPTION,
      service_radius_km: 0,
    });
  });

  it('deve enviar só com CNPJ e mostrar o erro do servidor', async () => {
    mockBecome.mockRejectedValue(new Error('CNPJ já cadastrado'));
    const { getByText, getByLabelText, getByPlaceholderText, findByText } =
      render(<TornarParceiroForm />);

    fireEvent.changeText(
      getByPlaceholderText('00.000.000/0000-00'),
      '11222333000181',
    );
    fireEvent.changeText(getByLabelText('Apresentação'), DESCRIPTION);
    fireEvent.press(getByText('Quero ser colaborador'));

    expect(await findByText('CNPJ já cadastrado')).toBeTruthy();
    expect(mockBecome).toHaveBeenCalledWith({
      cpf: '',
      cnpj: '11222333000181',
      description: DESCRIPTION,
      service_radius_km: 10,
    });
  });

  it('deve enviar sem CNPJ quando ele não é informado', async () => {
    mockBecome.mockResolvedValue(undefined);
    const { getByText, getByLabelText, findByText } = render(
      <TornarParceiroForm />,
    );

    fireEvent.changeText(getByLabelText('CPF'), VALID_CPF);
    fireEvent.changeText(getByLabelText('Apresentação'), DESCRIPTION);
    fireEvent.press(getByText('Quero ser colaborador'));

    expect(await findByText('Cadastro concluído!')).toBeTruthy();
    expect(mockBecome).toHaveBeenCalledWith(
      expect.objectContaining({ cnpj: undefined }),
    );
  });
});
