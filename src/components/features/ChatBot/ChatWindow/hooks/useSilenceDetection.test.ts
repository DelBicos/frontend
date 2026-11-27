import { Platform } from 'react-native';
import { act, renderHook } from '@testing-library/react-native';
import {
  MIN_RECORDING_BEFORE_AUTO_SEND_MS,
  SILENCE_AFTER_SPEECH_MS,
  createSilenceState,
  updateSilenceState,
  useSilenceDetection,
} from './useSilenceDetection';

const QUIET = -60;
const SPEECH = -20;

describe('updateSilenceState', () => {
  it('nunca envia se a pessoa ainda não falou', () => {
    const state = createSilenceState(0);
    const result = updateSilenceState(state, QUIET, 10_000);
    expect(result.silenceDetected).toBe(false);
  });

  it('envia depois da pausa que segue a fala', () => {
    let state = createSilenceState(0);
    state = updateSilenceState(state, SPEECH, 500).state;
    expect(
      updateSilenceState(state, QUIET, 500 + SILENCE_AFTER_SPEECH_MS - 100)
        .silenceDetected,
    ).toBe(false);
    expect(
      updateSilenceState(state, QUIET, 500 + SILENCE_AFTER_SPEECH_MS)
        .silenceDetected,
    ).toBe(true);
  });

  it('volta a contar a pausa quando a fala recomeça', () => {
    let state = createSilenceState(0);
    state = updateSilenceState(state, SPEECH, 500).state;
    state = updateSilenceState(state, SPEECH, 1_800).state;
    expect(updateSilenceState(state, QUIET, 2_100).silenceDetected).toBe(false);
  });

  it('respeita a gravação mínima antes de enviar', () => {
    let state = createSilenceState(0);
    state = updateSilenceState(state, SPEECH, 0).state;
    const tooEarly = MIN_RECORDING_BEFORE_AUTO_SEND_MS - 1;
    expect(
      updateSilenceState(
        { ...state, lastSpeechAt: tooEarly - SILENCE_AFTER_SPEECH_MS },
        QUIET,
        tooEarly,
      ).silenceDetected,
    ).toBe(false);
  });
});

describe('useSilenceDetection no app nativo', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(0);
  });

  afterEach(() => jest.useRealTimers());

  const render = (isRecording: boolean, level: number | undefined) =>
    renderHook(
      ({ rec, db }: { rec: boolean; db: number | undefined }) =>
        useSilenceDetection(rec, db),
      { initialProps: { rec: isRecording, db: level } },
    );

  it('detecta a pausa a partir do nível medido pelo gravador', () => {
    const { result, rerender } = render(true, SPEECH);
    expect(result.current).toBe(false);

    jest.setSystemTime(SILENCE_AFTER_SPEECH_MS);
    rerender({ rec: true, db: QUIET });

    expect(result.current).toBe(true);
  });

  it('ignora o nível quando não está gravando ou sem medição', () => {
    const { result, rerender } = render(false, SPEECH);
    jest.setSystemTime(SILENCE_AFTER_SPEECH_MS);
    rerender({ rec: false, db: QUIET });
    expect(result.current).toBe(false);

    rerender({ rec: true, db: undefined });
    expect(result.current).toBe(false);
  });

  it('recomeça a contagem ao iniciar uma nova gravação', () => {
    const { result, rerender } = render(true, SPEECH);
    jest.setSystemTime(SILENCE_AFTER_SPEECH_MS);
    rerender({ rec: true, db: QUIET });
    expect(result.current).toBe(true);

    rerender({ rec: false, db: QUIET });
    expect(result.current).toBe(false);
  });
});

describe('useSilenceDetection na web', () => {
  const originalOS = Platform.OS;
  // O Node 20 (usado no CI) nao tem navigator global; o 21+ tem.
  const globalScope = globalThis as { navigator?: object };
  const originalNavigator = Object.getOwnPropertyDescriptor(
    globalScope,
    'navigator',
  );
  const originalAudioContext = (globalThis as { AudioContext?: unknown })
    .AudioContext;

  let level = 0.5;
  const stopTrack = jest.fn();
  const closeContext = jest.fn(() => Promise.resolve());
  const getUserMedia = jest.fn();

  class FakeAudioContext {
    createAnalyser() {
      return {
        fftSize: 0,
        getFloatTimeDomainData: (samples: Float32Array) => samples.fill(level),
      };
    }

    createMediaStreamSource() {
      return { connect: jest.fn() };
    }

    close = closeContext;
  }

  const stream = { getTracks: () => [{ stop: stopTrack }] };

  const setMediaDevices = (value: unknown) =>
    Object.defineProperty(globalScope, 'navigator', {
      value: { mediaDevices: value },
      configurable: true,
      writable: true,
    });

  beforeAll(() => {
    Platform.OS = 'web';
    (globalThis as { AudioContext?: unknown }).AudioContext = FakeAudioContext;
  });

  afterAll(() => {
    Platform.OS = originalOS;
    (globalThis as { AudioContext?: unknown }).AudioContext =
      originalAudioContext;
    if (originalNavigator) {
      Object.defineProperty(globalScope, 'navigator', originalNavigator);
    } else {
      delete globalScope.navigator;
    }
  });

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(0);
    level = 0.5;
    stopTrack.mockClear();
    closeContext.mockClear();
    getUserMedia.mockReset();
    getUserMedia.mockResolvedValue(stream);
    setMediaDevices({ getUserMedia });
  });

  afterEach(() => jest.useRealTimers());

  const flush = async () => {
    await act(async () => {
      await Promise.resolve();
    });
  };

  it('analisa o microfone e detecta a pausa depois da fala', async () => {
    const { result, unmount } = renderHook(() =>
      useSilenceDetection(true, undefined),
    );
    await flush();
    expect(getUserMedia).toHaveBeenCalledWith({ audio: true });

    act(() => jest.advanceTimersByTime(100));
    level = 0;
    act(() => jest.advanceTimersByTime(SILENCE_AFTER_SPEECH_MS + 100));

    expect(result.current).toBe(true);

    unmount();
    expect(stopTrack).toHaveBeenCalled();
    expect(closeContext).toHaveBeenCalled();
  });

  it('não analisa nada fora da gravação', async () => {
    renderHook(() => useSilenceDetection(false, undefined));
    await flush();
    expect(getUserMedia).not.toHaveBeenCalled();
  });

  it('segue sem análise quando o navegador não tem microfone', async () => {
    setMediaDevices(undefined);
    const { result } = renderHook(() => useSilenceDetection(true, undefined));
    await flush();
    expect(result.current).toBe(false);
  });

  it('segue com envio manual quando o acesso ao microfone é negado', async () => {
    getUserMedia.mockRejectedValue(new Error('negado'));
    const { result } = renderHook(() => useSilenceDetection(true, undefined));
    await flush();
    act(() => jest.advanceTimersByTime(5_000));
    expect(result.current).toBe(false);
  });

  it('registra o comportamento atual: o microfone fica aberto se a gravação acaba antes da permissão (#212)', async () => {
    let grant: (value: unknown) => void = () => {};
    getUserMedia.mockReturnValue(new Promise((r) => (grant = r)));
    const { unmount } = renderHook(() => useSilenceDetection(true, undefined));
    unmount();

    await act(async () => {
      grant(stream);
      await Promise.resolve();
    });

    expect(closeContext).not.toHaveBeenCalled();
    // Bug #212: as faixas deveriam ser paradas aqui.
    expect(stopTrack).not.toHaveBeenCalled();
  });
});
