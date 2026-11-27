import React from 'react';
import { Platform } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import * as ImagePicker from 'expo-image-picker';
import DadosContaForm from '../DadosContaForm';
import { useUserStore } from '@stores/User';
import { confirmAction } from '@lib/utils/confirmAction';
import type { User } from '@stores/User/types';

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

jest.mock('@lib/helpers/httpClient', () => ({
  backendHttpClient: { get: jest.fn(), post: jest.fn(), put: jest.fn() },
}));

jest.mock('@lib/utils/confirmAction', () => ({
  confirmAction: jest.fn(),
}));

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  requestCameraPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  MediaTypeOptions: { Images: 'Images' },
}));

// O recorte so existe na web; aqui vira dois botoes simples.
jest.mock('@components/ui/ImageCropModal', () => {
  const { Text: RNText, View } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: ({
      visible,
      onCancel,
      onConfirm,
    }: {
      visible: boolean;
      onCancel: () => void;
      onConfirm: (uri: string) => void;
    }) =>
      visible ? (
        <View>
          <RNText onPress={onCancel}>Cancelar recorte</RNText>
          <RNText onPress={() => onConfirm('blob:recortada')}>
            Confirmar recorte
          </RNText>
        </View>
      ) : null,
  };
});

const picker = ImagePicker as jest.Mocked<typeof ImagePicker>;
const mockConfirm = confirmAction as jest.MockedFunction<typeof confirmAction>;

const baseUser = {
  id: 31,
  client_id: 31,
  name: 'Maria Silva Souza',
  email: 'maria@teste.com',
  phone: '11999998888',
  cpf: '12345678901',
} as unknown as User;

describe('DadosContaForm', () => {
  const mockUpdate = jest.fn();
  const mockUpload = jest.fn();
  const mockRemove = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useUserStore.setState({
      user: baseUser,
      avatarBase64: null,
      updateUserProfile: mockUpdate,
      uploadAvatar: mockUpload,
      removeAvatar: mockRemove,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('deve preencher o formulário com os dados da conta', () => {
    const { getByLabelText, getByText } = render(<DadosContaForm />);

    expect(getByLabelText('Nome').props.value).toBe('Maria');
    expect(getByLabelText('Sobrenome').props.value).toBe('Silva Souza');
    expect(getByLabelText('E-mail').props.value).toBe('maria@teste.com');
    expect(getByText('123.456.789-01')).toBeTruthy();
  });

  it('deve usar os dados recebidos por props quando a store não tem usuário', () => {
    useUserStore.setState({ user: null });
    const { getByLabelText, getByText } = render(
      <DadosContaForm
        user={
          {
            userName: 'João',
            userEmail: 'joao@teste.com',
            userPhone: '',
            userCpf: '',
          } as never
        }
      />,
    );

    expect(getByLabelText('Nome').props.value).toBe('João');
    expect(getByLabelText('Sobrenome').props.value).toBe('');
    expect(getByText('—')).toBeTruthy();
  });

  it('deve abrir a central de ajuda pelo link do CPF', () => {
    const { getByText } = render(<DadosContaForm />);
    fireEvent.press(getByText('Central de ajuda'));
    expect(mockNavigate).toHaveBeenCalledWith('Help');
  });

  it('deve salvar os dados normalizados', async () => {
    mockUpdate.mockResolvedValue(undefined);
    const { getByLabelText, getByText, findByText, queryByText } = render(
      <DadosContaForm />,
    );

    fireEvent.changeText(getByLabelText('Nome'), ' Ana ');
    fireEvent.changeText(getByLabelText('E-mail'), 'ANA@Teste.com');
    expect(getByText('Descartar')).toBeTruthy();
    fireEvent.press(getByText('Salvar alterações'));

    expect(await findByText('Dados salvos.')).toBeTruthy();
    expect(mockUpdate).toHaveBeenCalledWith({
      name: 'Ana Silva Souza',
      email: 'ana@teste.com',
      phone: '11999998888',
    });
    expect(queryByText('Descartar')).toBeNull();
  });

  it('deve mostrar o erro quando salvar falha', async () => {
    mockUpdate.mockRejectedValue(new Error('E-mail já cadastrado'));
    const { getByLabelText, getByText, findByText } = render(
      <DadosContaForm />,
    );

    fireEvent.changeText(getByLabelText('Nome'), 'Ana');
    fireEvent.press(getByText('Salvar alterações'));

    expect(await findByText('E-mail já cadastrado')).toBeTruthy();
  });

  it('deve validar os campos obrigatórios e o formato', async () => {
    const { getByLabelText, getByText, findByText } = render(
      <DadosContaForm />,
    );

    fireEvent.changeText(getByLabelText('Nome'), '');
    fireEvent.changeText(getByLabelText('E-mail'), 'email-invalido');
    fireEvent.changeText(getByLabelText('Celular'), '1199');
    fireEvent.press(getByText('Salvar alterações'));

    expect(await findByText('Informe seu nome.')).toBeTruthy();
    expect(getByText('Digite um e-mail válido.')).toBeTruthy();
    expect(getByText('Telefone incompleto.')).toBeTruthy();
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('deve descartar as alterações', async () => {
    const { getByLabelText, getByText, queryByText } = render(
      <DadosContaForm />,
    );

    fireEvent.changeText(getByLabelText('Nome'), 'Outro');
    fireEvent.press(getByText('Descartar'));

    await waitFor(() =>
      expect(getByLabelText('Nome').props.value).toBe('Maria'),
    );
    expect(queryByText('Descartar')).toBeNull();
  });

  describe('foto de perfil', () => {
    it('deve avisar quando a galeria não tem permissão', async () => {
      picker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
        status: 'denied',
      } as never);
      const { getByText, findByText } = render(<DadosContaForm />);

      fireEvent.press(getByText('Galeria'));

      expect(
        await findByText(
          'Permita o acesso às fotos nas configurações do aparelho.',
        ),
      ).toBeTruthy();
      expect(picker.launchImageLibraryAsync).not.toHaveBeenCalled();
    });

    it('deve enviar a foto escolhida na galeria', async () => {
      picker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
        status: 'granted',
      } as never);
      picker.launchImageLibraryAsync.mockResolvedValue({
        canceled: false,
        assets: [{ uri: 'file://foto.jpg' }],
      } as never);
      mockUpload.mockResolvedValue({ erro: false });
      const { getByText, findByText } = render(<DadosContaForm />);

      fireEvent.press(getByText('Galeria'));

      expect(await findByText('Foto atualizada.')).toBeTruthy();
      expect(mockUpload).toHaveBeenCalledWith('file://foto.jpg');
    });

    it('não deve enviar nada quando a escolha é cancelada', async () => {
      picker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
        status: 'granted',
      } as never);
      picker.launchImageLibraryAsync.mockResolvedValue({
        canceled: true,
        assets: [],
      } as never);
      const { getByText } = render(<DadosContaForm />);

      fireEvent.press(getByText('Galeria'));

      await waitFor(() =>
        expect(picker.launchImageLibraryAsync).toHaveBeenCalled(),
      );
      expect(mockUpload).not.toHaveBeenCalled();
    });

    it('deve mostrar o erro do envio', async () => {
      picker.requestCameraPermissionsAsync.mockResolvedValue({
        status: 'granted',
      } as never);
      picker.launchCameraAsync.mockResolvedValue({
        canceled: false,
        assets: [{ uri: 'file://camera.jpg' }],
      } as never);
      mockUpload.mockResolvedValue({ erro: true, mensagem: 'Arquivo grande' });
      const { getByText, findByText } = render(<DadosContaForm />);

      fireEvent.press(getByText('Tirar foto'));

      expect(await findByText('Arquivo grande')).toBeTruthy();
      expect(mockUpload).toHaveBeenCalledWith('file://camera.jpg');
    });

    it('deve usar a mensagem padrão quando o envio falha sem texto', async () => {
      picker.requestCameraPermissionsAsync.mockResolvedValue({
        status: 'granted',
      } as never);
      picker.launchCameraAsync.mockResolvedValue({
        canceled: false,
        assets: [{ uri: 'file://camera.jpg' }],
      } as never);
      mockUpload.mockResolvedValue({ erro: true });
      const { getByText, findByText } = render(<DadosContaForm />);

      fireEvent.press(getByText('Tirar foto'));

      expect(await findByText('Não foi possível enviar a foto.')).toBeTruthy();
    });

    it('deve avisar quando a câmera não tem permissão', async () => {
      picker.requestCameraPermissionsAsync.mockResolvedValue({
        status: 'denied',
      } as never);
      const { getByText, findByText } = render(<DadosContaForm />);

      fireEvent.press(getByText('Tirar foto'));

      expect(
        await findByText(
          'Permita o acesso à câmera nas configurações do aparelho.',
        ),
      ).toBeTruthy();
      expect(picker.launchCameraAsync).not.toHaveBeenCalled();
    });

    it('deve esconder "Remover" quando não há foto', () => {
      const { queryByText } = render(<DadosContaForm />);
      expect(queryByText('Remover')).toBeNull();
    });

    it('deve remover a foto depois de confirmar', async () => {
      useUserStore.setState({ avatarBase64: 'data:image/png;base64,AAA' });
      mockConfirm.mockResolvedValue(true);
      mockRemove.mockResolvedValue({ erro: false });
      const { getByText, findByText } = render(<DadosContaForm />);

      fireEvent.press(getByText('Remover'));

      expect(await findByText('Foto removida.')).toBeTruthy();
      expect(mockRemove).toHaveBeenCalled();
    });

    it('não deve remover a foto sem confirmação', async () => {
      useUserStore.setState({
        user: { ...baseUser, avatar_uri: 'https://foto' } as User,
      });
      mockConfirm.mockResolvedValue(false);
      const { getByText } = render(<DadosContaForm />);

      fireEvent.press(getByText('Remover'));

      await waitFor(() => expect(mockConfirm).toHaveBeenCalled());
      expect(mockRemove).not.toHaveBeenCalled();
    });

    it('deve mostrar o erro ao remover a foto', async () => {
      useUserStore.setState({ avatarBase64: 'data:image/png;base64,AAA' });
      mockConfirm.mockResolvedValue(true);
      mockRemove.mockResolvedValue({ erro: true });
      const { getByText, findByText } = render(<DadosContaForm />);

      fireEvent.press(getByText('Remover'));

      expect(await findByText('Não foi possível remover.')).toBeTruthy();
    });
  });

  describe('na web', () => {
    beforeEach(() => {
      jest.replaceProperty(Platform, 'OS', 'web');
    });

    it('deve abrir o recorte e enviar a foto recortada', async () => {
      const revoke = jest.fn();
      Object.assign(URL, { revokeObjectURL: revoke });
      picker.launchImageLibraryAsync.mockResolvedValue({
        canceled: false,
        assets: [{ uri: 'blob:original' }],
      } as never);
      mockUpload.mockResolvedValue({ erro: false });
      const { getByText, findByText, queryByText } = render(<DadosContaForm />);

      expect(queryByText('Tirar foto')).toBeNull();
      fireEvent.press(getByText('Escolher foto'));
      fireEvent.press(await findByText('Confirmar recorte'));

      expect(await findByText('Foto atualizada.')).toBeTruthy();
      expect(picker.requestMediaLibraryPermissionsAsync).not.toHaveBeenCalled();
      expect(mockUpload).toHaveBeenCalledWith('blob:recortada');
      expect(revoke).toHaveBeenCalledWith('blob:recortada');
    });

    it('deve fechar o recorte ao cancelar', async () => {
      picker.launchImageLibraryAsync.mockResolvedValue({
        canceled: false,
        assets: [{ uri: 'blob:original' }],
      } as never);
      const { getByText, findByText, queryByText } = render(<DadosContaForm />);

      fireEvent.press(getByText('Escolher foto'));
      fireEvent.press(await findByText('Cancelar recorte'));

      expect(queryByText('Confirmar recorte')).toBeNull();
      expect(mockUpload).not.toHaveBeenCalled();
    });
  });
});
