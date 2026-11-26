import React from 'react';
import { PanResponder, PanResponderCallbacks } from 'react-native';
import { render, fireEvent, act } from '@testing-library/react-native';
import ImageCropModal from '..';
import ImageCropModalWeb from '../ImageCropModal.web';

type Handlers = Required<
  Pick<PanResponderCallbacks, 'onPanResponderGrant' | 'onPanResponderMove'>
>;

class FakeImage {
  static fail = false;
  static all: FakeImage[] = [];
  naturalWidth = 800;
  naturalHeight = 400;
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  constructor() {
    FakeImage.all.push(this);
  }
  set src(_value: string) {
    // disparado pelo teste
  }
}

const loadImages = () =>
  act(() => {
    FakeImage.all.forEach((img) => (FakeImage.fail ? img.onerror?.() : img.onload?.()));
  });

let toBlobResult: Blob | null = new Blob(['x']);
let hasContext = true;
const context = { fillStyle: '', fillRect: jest.fn(), drawImage: jest.fn() };

const globals = globalThis as unknown as {
  window: { Image: typeof FakeImage };
  document: { createElement: (tag: string) => unknown };
  URL: { createObjectURL: (b: Blob) => string };
};

let handlers: Handlers | null = null;
let createSpy: jest.SpyInstance;

beforeAll(() => {
  globals.window.Image = FakeImage;
  globals.document = {
    createElement: () => ({
      width: 0,
      height: 0,
      getContext: () => (hasContext ? context : null),
      toBlob: (cb: (b: Blob | null) => void) => cb(toBlobResult),
    }),
  };
  globals.URL.createObjectURL = () => 'blob:recorte';
});

beforeEach(() => {
  FakeImage.fail = false;
  FakeImage.all = [];
  toBlobResult = new Blob(['x']);
  hasContext = true;
  context.drawImage.mockClear();
  const realCreate = PanResponder.create.bind(PanResponder);
  createSpy = jest.spyOn(PanResponder, 'create').mockImplementation((config) => {
    handlers = config as Handlers;
    return realCreate(config);
  });
});

afterEach(() => createSpy.mockRestore());

const renderWeb = (props: Partial<React.ComponentProps<typeof ImageCropModalWeb>> = {}) => {
  const onCancel = jest.fn();
  const onConfirm = jest.fn();
  const utils = render(
    <ImageCropModalWeb
      visible
      imageUri="data:image/png;base64,abc"
      onCancel={onCancel}
      onConfirm={onConfirm}
      {...props}
    />,
  );
  return { ...utils, onCancel, onConfirm };
};

const gesture = (dx: number, dy: number) =>
  ({ dx, dy } as unknown as Parameters<Handlers['onPanResponderMove']>[1]);
const evt = {} as unknown as Parameters<Handlers['onPanResponderMove']>[0];

describe('ImageCropModal (nativo)', () => {
  it('nao renderiza nada no app', () => {
    const { toJSON } = render(
      <ImageCropModal visible imageUri="x" onCancel={jest.fn()} onConfirm={jest.fn()} />,
    );
    expect(toJSON()).toBeNull();
  });
});

describe('ImageCropModal (web)', () => {
  it('mostra a foto depois de carregar e recorta ao confirmar', () => {
    const { getByText, getByLabelText, queryByLabelText, onConfirm } = renderWeb();
    expect(getByText('Ajustar foto')).toBeTruthy();
    expect(queryByLabelText('Foto escolhida')).toBeNull();

    loadImages();
    expect(getByLabelText('Foto escolhida')).toBeTruthy();

    fireEvent.press(getByText('Usar foto'));
    expect(context.drawImage).toHaveBeenCalled();
    expect(onConfirm).toHaveBeenCalledWith('blob:recorte');
  });

  it('muda o zoom pelos botoes e pelo controle deslizante', () => {
    const { getByLabelText, UNSAFE_root } = renderWeb();
    loadImages();
    const slider = () =>
      UNSAFE_root.findByType('input' as unknown as React.ElementType);

    fireEvent.press(getByLabelText('Aumentar zoom'));
    expect(slider().props.value).toBe(1.25);
    fireEvent.press(getByLabelText('Diminuir zoom'));
    expect(slider().props.value).toBe(1);

    act(() => {
      slider().props.onChange({ target: { value: '9' } });
    });
    expect(slider().props.value).toBe(3);
  });

  it('arrasta a foto dentro dos limites', () => {
    const { getByLabelText } = renderWeb();
    loadImages();
    const position = () =>
      Object.assign({}, ...[getByLabelText('Foto escolhida').props.style].flat(3));
    expect(position().left).toBe(-160);
    act(() => {
      handlers?.onPanResponderGrant(evt, gesture(0, 0));
      handlers?.onPanResponderMove(evt, gesture(1000, 50));
    });
    expect(position().left).toBe(0);
    expect(position().top).toBe(0);
  });

  it('ignora zoom e arraste antes de carregar', () => {
    const { getByLabelText, onConfirm, getByText } = renderWeb();
    act(() => {
      handlers?.onPanResponderMove(evt, gesture(10, 10));
    });
    fireEvent.press(getByLabelText('Aumentar zoom'));
    fireEvent.press(getByText('Usar foto'));
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('mostra erro quando a imagem nao abre', () => {
    FakeImage.fail = true;
    const { getByText } = renderWeb();
    loadImages();
    expect(getByText('Não foi possível abrir esta imagem.')).toBeTruthy();
  });

  it('mostra erro sem contexto de canvas', () => {
    hasContext = false;
    const { getByText, onConfirm } = renderWeb();
    loadImages();
    fireEvent.press(getByText('Usar foto'));
    expect(getByText('Não foi possível recortar a imagem neste navegador.')).toBeTruthy();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('mostra erro quando o recorte falha', () => {
    toBlobResult = null;
    const { getByText, onConfirm } = renderWeb();
    loadImages();
    fireEvent.press(getByText('Usar foto'));
    expect(getByText('Não foi possível recortar a imagem.')).toBeTruthy();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('cancela e nao carrega quando fechado', () => {
    const { getByText, onCancel } = renderWeb({ visible: true, imageUri: null });
    expect(FakeImage.all).toHaveLength(0);
    fireEvent.press(getByText('Cancelar'));
    expect(onCancel).toHaveBeenCalled();
  });

  it('ignora carregamento de uma imagem antiga', () => {
    const { rerender, queryByLabelText } = renderWeb();
    rerender(
      <ImageCropModalWeb
        visible={false}
        imageUri="data:image/png;base64,abc"
        onCancel={jest.fn()}
        onConfirm={jest.fn()}
      />,
    );
    loadImages();
    expect(queryByLabelText('Foto escolhida')).toBeNull();
  });
});
