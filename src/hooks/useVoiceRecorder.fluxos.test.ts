import { act, renderHook } from '@testing-library/react-native';
import { Platform } from 'react-native';
import * as ExpoAudio from 'expo-audio';
import { useVoiceRecorder } from './useVoiceRecorder';

const mockRecorder = {
  isRecording: false,
  uri: null as string | null,
  prepareToRecordAsync: jest.fn(),
  record: jest.fn(),
  stop: jest.fn(),
};
const mockRecorderState = {
  isRecording: false,
  durationMillis: 0,
  metering: -30,
};

jest.mock('expo-audio', () => ({
  RecordingPresets: { HIGH_QUALITY: {} },
  requestRecordingPermissionsAsync: jest.fn(),
  setAudioModeAsync: jest.fn(),
  useAudioRecorder: () => mockRecorder,
  useAudioRecorderState: () => ({ ...mockRecorderState }),
}));
jest.mock('@lib/logger', () => ({
  logger: {
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  },
}));

const requestPermission =
  ExpoAudio.requestRecordingPermissionsAsync as jest.Mock;
const setAudioMode = ExpoAudio.setAudioModeAsync as jest.Mock;
const platform = Platform as { OS: string };
const originalOS = platform.OS;
const revokeObjectURL = jest.fn();

beforeAll(() => {
  Object.defineProperty(URL, 'revokeObjectURL', {
    value: revokeObjectURL,
    configurable: true,
    writable: true,
  });
});

beforeEach(() => {
  jest.clearAllMocks();
  platform.OS = originalOS;
  mockRecorder.isRecording = false;
  mockRecorder.uri = 'file://voz.m4a';
  mockRecorder.prepareToRecordAsync.mockResolvedValue(undefined);
  mockRecorder.stop.mockResolvedValue(undefined);
  mockRecorderState.isRecording = false;
  mockRecorderState.durationMillis = 0;
  requestPermission.mockResolvedValue({ granted: true });
  setAudioMode.mockResolvedValue(undefined);
});

afterAll(() => {
  platform.OS = originalOS;
});

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

async function startedRecorder() {
  const hook = renderHook(() => useVoiceRecorder());
  await act(async () => {
    await hook.result.current.startRecording();
  });
  return hook;
}

describe('useVoiceRecorder - fluxos de gravacao', () => {
  it('pede permissao, configura o audio e comeca a gravar', async () => {
    const { result } = await startedRecorder();
    expect(setAudioMode).toHaveBeenCalledWith(
      expect.objectContaining({ allowsRecording: true }),
    );
    expect(mockRecorder.prepareToRecordAsync).toHaveBeenCalled();
    expect(mockRecorder.record).toHaveBeenCalled();
    expect(result.current.isPreparing).toBe(false);
    expect(result.current.meteringDb).toBe(-30);
  });

  it('nao inicia duas gravacoes nem grava quando ja esta gravando', async () => {
    const { result, rerender } = await startedRecorder();
    await act(async () => {
      await result.current.startRecording();
    });
    expect(requestPermission).toHaveBeenCalledTimes(1);

    mockRecorderState.isRecording = true;
    rerender({});
    await act(async () => {
      await result.current.startRecording();
    });
    expect(requestPermission).toHaveBeenCalledTimes(1);
  });

  it('explica quando o microfone nao foi liberado', async () => {
    requestPermission.mockResolvedValue({ granted: false });
    const { result } = renderHook(() => useVoiceRecorder());
    let failure: Error | undefined;
    await act(async () => {
      await result.current.startRecording().catch((e: Error) => {
        failure = e;
      });
    });
    expect(failure?.message).toMatch(/^Permita o uso do microfone/);
    expect(setAudioMode).toHaveBeenLastCalledWith({ allowsRecording: false });
    expect(result.current.isPreparing).toBe(false);
  });

  it('mostra erro generico quando o preparo falha', async () => {
    mockRecorder.prepareToRecordAsync.mockRejectedValue(new Error('hw'));
    setAudioMode
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('sem audio'));
    const { result } = renderHook(() => useVoiceRecorder());
    let failure: Error | undefined;
    await act(async () => {
      await result.current.startRecording().catch((e: Error) => {
        failure = e;
      });
    });
    expect(failure?.message).toMatch(/^Não foi possível iniciar a gravação/);
    expect(mockRecorder.record).not.toHaveBeenCalled();
  });

  it('para sem tocar no recorder quando desmonta durante o preparo', async () => {
    const audioMode = deferred<void>();
    setAudioMode.mockReturnValueOnce(audioMode.promise);
    const { result, unmount } = renderHook(() => useVoiceRecorder());
    let start: Promise<void> = Promise.resolve();
    act(() => {
      start = result.current.startRecording();
    });
    await act(async () => {
      await Promise.resolve();
    });
    unmount();
    await act(async () => {
      audioMode.resolve();
      await start;
    });
    expect(mockRecorder.prepareToRecordAsync).not.toHaveBeenCalled();
  });

  it('para sem gravar quando desmonta enquanto prepara o recorder', async () => {
    const prepare = deferred<void>();
    mockRecorder.prepareToRecordAsync.mockReturnValueOnce(prepare.promise);
    const { result, unmount } = renderHook(() => useVoiceRecorder());
    let start: Promise<void> = Promise.resolve();
    act(() => {
      start = result.current.startRecording();
    });
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    unmount();
    await act(async () => {
      prepare.resolve();
      await start;
    });
    expect(mockRecorder.record).not.toHaveBeenCalled();
  });

  it('nao lanca erro quando a falha acontece depois de desmontar', async () => {
    const prepare = deferred<void>();
    mockRecorder.prepareToRecordAsync.mockReturnValueOnce(
      prepare.promise.then(() => {
        throw new Error('hw');
      }),
    );
    const { result, unmount } = renderHook(() => useVoiceRecorder());
    let start: Promise<void> = Promise.resolve();
    act(() => {
      start = result.current.startRecording();
    });
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    unmount();
    await act(async () => {
      prepare.resolve();
      await expect(start).resolves.toBeUndefined();
    });
  });

  it('nao lanca erro quando desmonta enquanto restaura o audio apos falha', async () => {
    const restore = deferred<void>();
    requestPermission.mockResolvedValue({ granted: false });
    setAudioMode.mockReturnValueOnce(restore.promise);
    const { result, unmount } = renderHook(() => useVoiceRecorder());
    let start: Promise<void> = Promise.resolve();
    act(() => {
      start = result.current.startRecording();
    });
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    unmount();
    await act(async () => {
      restore.resolve();
      await expect(start).resolves.toBeUndefined();
    });
  });

  it('finaliza a gravacao e devolve o arquivo', async () => {
    const { result, rerender } = await startedRecorder();
    mockRecorderState.durationMillis = 2500;
    rerender({});
    let recording:
      Awaited<ReturnType<typeof result.current.stopRecording>> | undefined;
    await act(async () => {
      recording = await result.current.stopRecording();
    });
    expect(recording).toMatchObject({
      uri: 'file://voz.m4a',
      durationMillis: 2500,
    });
    expect(typeof recording?.mimeType).toBe('string');
    recording?.release();
    expect(revokeObjectURL).not.toHaveBeenCalled();
    expect(setAudioMode).toHaveBeenLastCalledWith({ allowsRecording: false });
  });

  it('libera a URL blob da gravacao na web', async () => {
    const { result } = await startedRecorder();
    platform.OS = 'web';
    mockRecorder.uri = 'blob:voz';
    let recording:
      Awaited<ReturnType<typeof result.current.stopRecording>> | undefined;
    await act(async () => {
      recording = await result.current.stopRecording();
    });
    recording?.release();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:voz');
  });

  it('recusa parar sem gravacao em andamento', async () => {
    const { result } = renderHook(() => useVoiceRecorder());
    await expect(result.current.stopRecording()).rejects.toThrow(
      'Nenhuma gravação está em andamento.',
    );
  });

  it('cancela um segundo pedido de parada simultaneo', async () => {
    const stop = deferred<void>();
    mockRecorder.stop.mockReturnValueOnce(stop.promise);
    const { result } = await startedRecorder();
    let first: Promise<unknown> = Promise.resolve();
    act(() => {
      first = result.current.stopRecording();
    });
    await expect(result.current.stopRecording()).rejects.toMatchObject({
      name: 'AbortError',
    });
    await expect(result.current.cancelRecording()).resolves.toBeUndefined();
    await act(async () => {
      stop.resolve();
      await first;
    });
  });

  it('informa falha quando nao ha arquivo apos parar', async () => {
    const { result } = await startedRecorder();
    mockRecorder.uri = null;
    let failure: Error | undefined;
    await act(async () => {
      await result.current.stopRecording().catch((e: Error) => {
        failure = e;
      });
    });
    expect(failure?.message).toBe(
      'Não foi possível preparar o áudio para envio.',
    );
  });

  it('repassa cancelamento do recorder como AbortError', async () => {
    const abort = Object.assign(new Error('abortado'), { name: 'AbortError' });
    mockRecorder.stop.mockRejectedValueOnce(abort);
    const { result } = await startedRecorder();
    let failure: Error | undefined;
    await act(async () => {
      await result.current.stopRecording().catch((e: Error) => {
        failure = e;
      });
    });
    expect(failure?.name).toBe('AbortError');
  });

  it('cancela a parada quando desmonta antes do fim', async () => {
    const stop = deferred<void>();
    mockRecorder.stop.mockReturnValueOnce(stop.promise);
    const { result, unmount } = await startedRecorder();
    let pending: Promise<unknown> = Promise.resolve();
    act(() => {
      pending = result.current.stopRecording().catch((e: Error) => e);
    });
    unmount();
    await act(async () => {
      stop.resolve();
    });
    await expect(pending).resolves.toMatchObject({ name: 'AbortError' });
    await expect(result.current.stopRecording()).rejects.toMatchObject({
      name: 'AbortError',
    });
    await expect(result.current.cancelRecording()).resolves.toBeUndefined();
  });

  it('cancela a gravacao em andamento e libera o blob na web', async () => {
    const { result } = await startedRecorder();
    platform.OS = 'web';
    mockRecorder.uri = 'blob:voz';
    await act(async () => {
      await result.current.cancelRecording();
    });
    expect(mockRecorder.stop).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:voz');
    expect(setAudioMode).toHaveBeenLastCalledWith({ allowsRecording: false });
  });

  it('nao lanca erro quando o cancelamento falha', async () => {
    mockRecorder.stop.mockRejectedValueOnce(new Error('hw'));
    const { result } = await startedRecorder();
    await act(async () => {
      await expect(result.current.cancelRecording()).resolves.toBeUndefined();
    });
  });

  it('encerra o MediaRecorder da web ao desmontar', async () => {
    platform.OS = 'web';
    mockRecorder.isRecording = true;
    mockRecorder.uri = 'blob:voz';
    const { unmount } = renderHook(() => useVoiceRecorder());
    unmount();
    await act(async () => {
      await Promise.resolve();
    });
    expect(mockRecorder.stop).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:voz');
  });

  it('ignora falha ao encerrar o MediaRecorder da web', async () => {
    platform.OS = 'web';
    mockRecorder.isRecording = true;
    mockRecorder.stop.mockRejectedValueOnce(new Error('hw'));
    setAudioMode.mockRejectedValueOnce(new Error('sem audio'));
    const { unmount } = renderHook(() => useVoiceRecorder());
    unmount();
    await act(async () => {
      await Promise.resolve();
    });
    expect(revokeObjectURL).not.toHaveBeenCalled();
  });
});
