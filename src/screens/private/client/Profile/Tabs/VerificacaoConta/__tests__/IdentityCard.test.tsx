import React from 'react';
import { Platform } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import * as ImagePicker from 'expo-image-picker';
import IdentityCard from '../IdentityCard';
import { useVerificationStore } from '@stores/Verification';
import type {
  IdentityRequest,
  VerificationStatus,
} from '@stores/Verification/types';

jest.mock('@lib/helpers/httpClient', () => ({
  backendHttpClient: { get: jest.fn(), post: jest.fn(), put: jest.fn() },
}));

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  requestCameraPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  MediaTypeOptions: { Images: 'Images' },
}));

const picker = ImagePicker as jest.Mocked<typeof ImagePicker>;

const makeStatus = (
  overrides: Partial<VerificationStatus> = {},
): VerificationStatus => ({
  email_verified: true,
  mfa_enabled: false,
  is_professional: true,
  identity: null,
  verified: false,
  verified_at: null,
  ...overrides,
});

const rejected = (reason: string | null): IdentityRequest => ({
  id: 1,
  status: 'rejected',
  document_type: 'cnh',
  reject_reason: reason,
  submitted_at: '2026-01-01T00:00:00.000Z',
});

describe('IdentityCard', () => {
  const mockSubmit = jest.fn();
  const mockUpload = jest.fn();
  const onChanged = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    picker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
      status: 'granted',
    } as never);
    picker.requestCameraPermissionsAsync.mockResolvedValue({
      status: 'granted',
    } as never);
    mockUpload.mockImplementation(async (kind: string) => `chave-${kind}`);
    useVerificationStore.setState({
      submitIdentity: mockSubmit,
      uploadIdentityFile: mockUpload,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const pickFrom = async (
    getByLabelText: (l: string) => unknown,
    label: string,
    uri: string,
    camera = false,
  ) => {
    const launch = camera
      ? picker.launchCameraAsync
      : picker.launchImageLibraryAsync;
    launch.mockResolvedValueOnce({
      canceled: false,
      assets: [{ uri }],
    } as never);
    fireEvent.press(
      getByLabelText(
        `${camera ? 'Tirar foto' : 'Escolher foto'}: ${label}`,
      ) as never,
    );
    await waitFor(() =>
      expect(getByLabelText(`Prévia: ${label}`)).toBeTruthy(),
    );
  };

  it('deve mostrar o selo quando já é verificado, sem formulário', () => {
    const { getByText, queryByText } = render(
      <IdentityCard
        status={makeStatus({ verified: true })}
        onChanged={onChanged}
      />,
    );

    expect(
      getByText('Seu perfil exibe o selo de verificado para os clientes.'),
    ).toBeTruthy();
    expect(queryByText('Enviar para análise')).toBeNull();
  });

  it('deve avisar que os documentos estão em análise', () => {
    const { getByText, queryByText } = render(
      <IdentityCard
        status={makeStatus({
          identity: { ...rejected(null), status: 'pending' },
        })}
        onChanged={onChanged}
      />,
    );

    expect(getByText(/estão em análise/)).toBeTruthy();
    expect(queryByText('Enviar para análise')).toBeNull();
  });

  it('deve exigir frente e selfie antes de enviar', () => {
    const { getByText } = render(
      <IdentityCard status={makeStatus()} onChanged={onChanged} />,
    );

    fireEvent.press(getByText('Enviar para análise'));
    expect(getByText('Envie a frente do documento e a selfie.')).toBeTruthy();
    expect(mockUpload).not.toHaveBeenCalled();
  });

  it('deve avisar quando não há permissão', async () => {
    picker.requestCameraPermissionsAsync.mockResolvedValue({
      status: 'denied',
    } as never);
    const { getByLabelText, findByText } = render(
      <IdentityCard status={makeStatus()} onChanged={onChanged} />,
    );

    fireEvent.press(getByLabelText('Tirar foto: Frente do documento'));

    expect(
      await findByText('Permita o acesso nas configurações do aparelho.'),
    ).toBeTruthy();
    expect(picker.launchCameraAsync).not.toHaveBeenCalled();
  });

  it('não deve guardar nada quando a escolha é cancelada', async () => {
    picker.launchImageLibraryAsync.mockResolvedValue({
      canceled: true,
      assets: [],
    } as never);
    const { getByLabelText, queryByLabelText } = render(
      <IdentityCard status={makeStatus()} onChanged={onChanged} />,
    );

    fireEvent.press(getByLabelText('Escolher foto: Frente do documento'));

    await waitFor(() =>
      expect(picker.launchImageLibraryAsync).toHaveBeenCalled(),
    );
    expect(queryByLabelText('Prévia: Frente do documento')).toBeNull();
  });

  it('deve enviar documento RG com verso e selfie', async () => {
    mockSubmit.mockResolvedValue(rejected(null));
    const { getByLabelText, getByText, queryByLabelText } = render(
      <IdentityCard status={makeStatus()} onChanged={onChanged} />,
    );

    fireEvent.press(getByText('RG'));
    await pickFrom(getByLabelText, 'Frente do documento', 'file://frente');
    await pickFrom(getByLabelText, 'Verso (opcional)', 'file://verso');
    await pickFrom(
      getByLabelText,
      'Selfie com o documento',
      'file://selfie',
      true,
    );
    fireEvent.press(getByText('Enviar para análise'));

    await waitFor(() => expect(onChanged).toHaveBeenCalled());
    expect(mockUpload).toHaveBeenCalledWith('front', 'file://frente');
    expect(mockUpload).toHaveBeenCalledWith('back', 'file://verso');
    expect(mockUpload).toHaveBeenCalledWith('selfie', 'file://selfie');
    expect(mockSubmit).toHaveBeenCalledWith({
      document_type: 'rg',
      front_key: 'chave-front',
      back_key: 'chave-back',
      selfie_key: 'chave-selfie',
    });
    expect(queryByLabelText('Prévia: Frente do documento')).toBeNull();
  });

  it('deve enviar sem verso e mostrar o erro do envio', async () => {
    mockSubmit.mockRejectedValue(new Error('falha'));
    const { getByLabelText, getByText, findByText } = render(
      <IdentityCard status={makeStatus()} onChanged={onChanged} />,
    );

    fireEvent.press(getByText('RG'));
    fireEvent.press(getByText('CNH'));
    await pickFrom(getByLabelText, 'Frente do documento', 'file://frente');
    await pickFrom(getByLabelText, 'Selfie com o documento', 'file://selfie');
    fireEvent.press(getByText('Enviar para análise'));

    expect(
      await findByText('Não foi possível enviar. Tente de novo.'),
    ).toBeTruthy();
    expect(mockSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ document_type: 'cnh', back_key: null }),
    );
    expect(onChanged).not.toHaveBeenCalled();
  });

  it('deve mostrar o motivo da recusa e permitir reenviar', () => {
    const { getByText, queryByText } = render(
      <IdentityCard
        status={makeStatus({ identity: rejected('foto ilegível') })}
        onChanged={onChanged}
      />,
    );

    expect(
      getByText('Não conseguimos verificar seus documentos: foto ilegível.'),
    ).toBeTruthy();
    fireEvent.press(getByText('Enviar novamente'));
    expect(queryByText('Enviar novamente')).toBeNull();
    expect(queryByText(/Não conseguimos verificar/)).toBeNull();
    expect(getByText('Enviar para análise')).toBeTruthy();
  });

  it('deve usar o motivo padrão quando a recusa não tem motivo', () => {
    const { getByText } = render(
      <IdentityCard
        status={makeStatus({ identity: rejected(null) })}
        onChanged={onChanged}
      />,
    );

    expect(getByText(/motivo não informado/)).toBeTruthy();
  });

  it('na web deve abrir a galeria sem pedir permissão e sem câmera', async () => {
    jest.replaceProperty(Platform, 'OS', 'web');
    const { getByLabelText, queryByLabelText } = render(
      <IdentityCard status={makeStatus()} onChanged={onChanged} />,
    );

    expect(queryByLabelText('Tirar foto: Frente do documento')).toBeNull();
    await pickFrom(getByLabelText, 'Frente do documento', 'blob:frente');
    expect(picker.requestMediaLibraryPermissionsAsync).not.toHaveBeenCalled();
  });
});
