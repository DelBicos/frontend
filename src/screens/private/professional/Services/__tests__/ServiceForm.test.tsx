import React from 'react';
import { Switch } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import * as ImagePicker from 'expo-image-picker';
import ServiceForm from '../ServiceForm';
import { useServicesStore, ServiceItem } from '@stores/Services/Services';
import { useSubCategoryStore } from '@stores/SubCategory';
import { useCategoryStore } from '@stores/Category';
import type { Category } from '@stores/Category/types';
import { backendHttpClient } from '@lib/helpers/httpClient';
import { uploadToStorage } from '@lib/uploadFile';
import { logger } from '@lib/logger';

jest.mock('@lib/helpers/httpClient', () => ({
  backendHttpClient: { get: jest.fn(), post: jest.fn() },
}));

jest.mock('@lib/uploadFile', () => ({ uploadToStorage: jest.fn() }));

jest.mock('@lib/logger', () => ({
  logger: { error: jest.fn(), warn: jest.fn(), info: jest.fn() },
}));

jest.mock('expo-image-picker', () => ({
  MediaTypeOptions: { Images: 'Images' },
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));

const mockedPicker = ImagePicker as jest.Mocked<typeof ImagePicker>;
const mockedPost = backendHttpClient.post as jest.Mock;
const mockedUpload = uploadToStorage as jest.Mock;

const categories = [
  { id: 1, title: 'Elétrica' },
  { id: 2, title: 'Pintura' },
] as unknown as Category[];

const subCategories = [
  { id: 11, title: 'Chuveiro', category_id: 1 },
  { id: 21, title: 'Parede', category_id: 2 },
];

const choose = (
  getByText: (t: string) => ReturnType<ReturnType<typeof render>['getByText']>,
  placeholder: string,
  option: string,
) => {
  fireEvent.press(getByText(placeholder));
  fireEvent.press(getByText(option));
};

// Tela pesada: com a maquina carregada (CI ou suite inteira) montar e validar
// o formulario passa dos 5 s padrao do Jest. O prazo maior nao muda o que e verificado.
jest.setTimeout(20000);

describe('ServiceForm', () => {
  const onClose = jest.fn();
  const mockCreate = jest.fn();
  const mockUpdate = jest.fn();
  const mockReloadMine = jest.fn();
  const mockFetchCategories = jest.fn();
  const mockFetchSubs = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockCreate.mockResolvedValue({ id: 1 });
    mockUpdate.mockResolvedValue({ id: 1 });
    mockReloadMine.mockResolvedValue([]);
    useServicesStore.setState({
      createService: mockCreate,
      updateService: mockUpdate,
      reloadMyServices: mockReloadMine,
    });
    useCategoryStore.setState({
      categories,
      fetchCategories: mockFetchCategories,
    });
    useSubCategoryStore.setState({
      subCategories,
      fetchAllSubCategories: mockFetchSubs,
    });
  });

  const fillRequired = (utils: ReturnType<typeof render>) => {
    const { getByLabelText, getByText } = utils;
    fireEvent.changeText(getByLabelText('Título *'), 'Troca de chuveiro');
    fireEvent.changeText(getByLabelText('Descrição *'), 'Com instalação');
    choose(getByText, 'Selecione a categoria', 'Elétrica');
    choose(getByText, 'Selecione o tipo de serviço', 'Chuveiro');
    fireEvent.changeText(getByLabelText('Preço *'), '12345');
    choose(getByText, 'Selecione', '1h');
  };

  it('deve buscar categorias e tipos ao abrir', () => {
    const { getByText } = render(<ServiceForm onClose={onClose} />);

    expect(getByText('Novo serviço')).toBeTruthy();
    expect(mockFetchCategories).toHaveBeenCalled();
    expect(mockFetchSubs).toHaveBeenCalled();
  });

  it('deve exigir os campos obrigatórios', async () => {
    const { getByText, findAllByText } = render(
      <ServiceForm onClose={onClose} />,
    );

    fireEvent.press(getByText('Cadastrar serviço'));

    expect((await findAllByText('Campo obrigatório')).length).toBeGreaterThan(
      0,
    );
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('deve cadastrar o serviço com o preço em reais e fechar', async () => {
    const utils = render(<ServiceForm onClose={onClose} />);
    fillRequired(utils);
    expect(utils.getByLabelText('Preço *').props.value).toMatch(/123,45/);

    fireEvent(utils.UNSAFE_getAllByType(Switch)[0], 'valueChange', false);
    fireEvent.press(utils.getByText('Cadastrar serviço'));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(mockCreate).toHaveBeenCalledWith({
      title: 'Troca de chuveiro',
      description: 'Com instalação',
      price: 123.45,
      duration: 60,
      category_id: 1,
      subcategory_id: 11,
      banner_uri: undefined,
      active: false,
      availabilities: [],
    });
    expect(mockReloadMine).toHaveBeenCalled();
  });

  it('deve fechar mesmo se a lista não recarregar', async () => {
    mockReloadMine.mockRejectedValueOnce(new Error('offline'));
    const utils = render(<ServiceForm onClose={onClose} />);
    fillRequired(utils);

    fireEvent.press(utils.getByText('Cadastrar serviço'));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(logger.warn).toHaveBeenCalled();
  });

  it('deve recarregar a lista pública quando não há a lista própria', async () => {
    const mockReloadPublic = jest.fn().mockResolvedValue([]);
    useServicesStore.setState({
      reloadMyServices: undefined as unknown as () => Promise<ServiceItem[]>,
      reloadServices: mockReloadPublic,
    });
    const utils = render(<ServiceForm onClose={onClose} />);
    fillRequired(utils);

    fireEvent.press(utils.getByText('Cadastrar serviço'));

    await waitFor(() => expect(mockReloadPublic).toHaveBeenCalled());
  });

  it('deve mostrar o erro do servidor e manter o formulário aberto', async () => {
    mockCreate.mockRejectedValueOnce(new Error('Título já usado'));
    const utils = render(<ServiceForm onClose={onClose} />);
    fillRequired(utils);

    fireEvent.press(utils.getByText('Cadastrar serviço'));

    expect(await utils.findByText('Título já usado')).toBeTruthy();
    expect(onClose).not.toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalled();
  });

  it('deve editar um serviço existente com os valores preenchidos', async () => {
    const initial: ServiceItem = {
      id: 9,
      title: 'Pintar sala',
      description: 'Tinta inclusa',
      price_cents: 5000,
      duration: 120,
      category_id: 2,
      subcategory_id: 21,
      banner_uri: 'https://arquivos.exemplo.com/sala.jpg',
      active: true,
      availabilities: [{ day: 1, start: '08:00', end: '12:00' }],
    };
    const { getByText, getByLabelText } = render(
      <ServiceForm initial={initial} onClose={onClose} />,
    );

    expect(getByText('Editar serviço')).toBeTruthy();
    expect(getByLabelText('Preço *').props.value).toMatch(/50,00/);
    expect(getByText('Trocar foto')).toBeTruthy();

    fireEvent.press(getByText('Salvar alterações'));

    await waitFor(() =>
      expect(mockUpdate).toHaveBeenCalledWith(
        9,
        expect.objectContaining({
          price: 50,
          duration: 120,
          banner_uri: 'https://arquivos.exemplo.com/sala.jpg',
          availabilities: [{ day: 1, start: '08:00', end: '12:00' }],
        }),
      ),
    );
  });

  it('deve recusar subcategoria de outra categoria', async () => {
    const initial: ServiceItem = {
      id: 9,
      title: 'Pintar sala',
      description: 'Tinta inclusa',
      price_cents: 5000,
      duration: 60,
      category_id: 1,
      subcategory_id: 21,
    };
    const { getByText, getAllByText, findAllByText } = render(
      <ServiceForm initial={initial} onClose={onClose} />,
    );

    const msg = 'A subcategoria não pertence à categoria selecionada';
    expect((await findAllByText(msg)).length).toBe(1);

    fireEvent.press(getByText('Salvar alterações'));

    // A mensagem aparece no campo e tambem no aviso do formulario. A validacao
    // do formulario e assincrona e, com a suite inteira rodando, passa de 1 s.
    await waitFor(() => expect(getAllByText(msg)).toHaveLength(2), {
      timeout: 15000,
    });
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('deve avisar quando a subcategoria não existe', async () => {
    const { findByText } = render(
      <ServiceForm
        initial={{ id: 9, title: 'X', subcategory_id: 99 }}
        onClose={onClose}
      />,
    );

    expect(await findByText('Subcategoria inválida')).toBeTruthy();
  });

  it('deve limpar o tipo de serviço ao trocar a categoria', () => {
    const { getByText, queryByText } = render(
      <ServiceForm onClose={onClose} />,
    );

    choose(getByText, 'Selecione a categoria', 'Elétrica');
    choose(getByText, 'Selecione o tipo de serviço', 'Chuveiro');
    choose(getByText, 'Elétrica', 'Pintura');

    expect(getByText('Selecione o tipo de serviço')).toBeTruthy();
    expect(queryByText('Chuveiro')).toBeNull();
  });

  it('deve fechar sem salvar pelo X ou por Cancelar', () => {
    const { getByText, getByLabelText } = render(
      <ServiceForm onClose={onClose} />,
    );

    fireEvent.press(getByLabelText('Fechar sem salvar'));
    fireEvent.press(getByText('Cancelar'));
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  describe('foto do serviço', () => {
    const fetchSpy = jest.fn();

    beforeEach(() => {
      fetchSpy.mockResolvedValue({ blob: () => Promise.resolve('blob') });
      global.fetch = fetchSpy as unknown as typeof fetch;
      mockedPicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
        status: 'granted',
      } as unknown as ImagePicker.MediaLibraryPermissionResponse);
      mockedPicker.launchImageLibraryAsync.mockResolvedValue({
        canceled: false,
        assets: [{ uri: 'file:///foto.PNG', mimeType: undefined }],
      } as unknown as ImagePicker.ImagePickerResult);
      mockedPost.mockResolvedValue({
        data: {
          presignedUrl: 'https://upload.exemplo.com/put',
          fileUrl: 'https://arquivos.exemplo.com/foto.png',
        },
      });
      mockedUpload.mockResolvedValue('https://arquivos.exemplo.com/foto.png');
    });

    it('deve pedir permissão da galeria', async () => {
      mockedPicker.requestMediaLibraryPermissionsAsync.mockResolvedValueOnce({
        status: 'denied',
      } as unknown as ImagePicker.MediaLibraryPermissionResponse);
      const { getByText, findByText } = render(
        <ServiceForm onClose={onClose} />,
      );

      fireEvent.press(getByText('Adicionar foto'));

      expect(
        await findByText('Permita acesso à galeria para adicionar uma foto.'),
      ).toBeTruthy();
      expect(mockedPicker.launchImageLibraryAsync).not.toHaveBeenCalled();
    });

    it('não deve enviar nada quando a escolha é cancelada', async () => {
      mockedPicker.launchImageLibraryAsync.mockResolvedValueOnce({
        canceled: true,
        assets: null,
      } as unknown as ImagePicker.ImagePickerResult);
      const { getByText } = render(<ServiceForm onClose={onClose} />);

      fireEvent.press(getByText('Adicionar foto'));

      await waitFor(() =>
        expect(mockedPicker.launchImageLibraryAsync).toHaveBeenCalled(),
      );
      expect(mockedPost).not.toHaveBeenCalled();
    });

    it('deve enviar a foto e mostrar a prévia', async () => {
      const { getByText, findByText } = render(
        <ServiceForm onClose={onClose} />,
      );

      fireEvent.press(getByText('Adicionar foto'));

      expect(await findByText('Trocar foto')).toBeTruthy();
      expect(mockedPost).toHaveBeenCalledWith('/api/uploads', {
        filename: 'service-banner.png',
        contentType: 'image/png',
      });
      expect(fetchSpy).toHaveBeenCalledWith('file:///foto.PNG');
      expect(mockedUpload).toHaveBeenCalledWith(
        {
          uploadUrl: 'https://upload.exemplo.com/put',
          fileUrl: 'https://arquivos.exemplo.com/foto.png',
          uploadHeaders: undefined,
        },
        'blob',
        'image/png',
      );
    });

    it('deve avisar quando o envio da foto falha', async () => {
      mockedPost.mockRejectedValueOnce(new Error('offline'));
      const { getByText, findByText } = render(
        <ServiceForm onClose={onClose} />,
      );

      fireEvent.press(getByText('Adicionar foto'));

      expect(
        await findByText('Não foi possível enviar a foto. Tente novamente.'),
      ).toBeTruthy();
      expect(getByText('Adicionar foto')).toBeTruthy();
    });
  });
});
