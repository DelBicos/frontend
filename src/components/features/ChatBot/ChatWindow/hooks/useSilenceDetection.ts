import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

/** Nível (dBFS) a partir do qual o som conta como fala. */
export const SPEECH_LEVEL_DB = -40;
/** Pausa na fala que encerra a gravação. */
export const SILENCE_AFTER_SPEECH_MS = 1_500;
/** Gravação mínima antes de aceitar o envio automático. */
export const MIN_RECORDING_BEFORE_AUTO_SEND_MS = 800;

export interface SilenceState {
  startedAt: number;
  hasSpoken: boolean;
  lastSpeechAt: number;
}

export function createSilenceState(now: number): SilenceState {
  return { startedAt: now, hasSpoken: false, lastSpeechAt: now };
}

/**
 * Atualiza o estado com um novo nível de áudio e diz se a pessoa já falou e
 * fez uma pausa longa o bastante para enviar. Sem fala nenhuma, nunca envia.
 */
export function updateSilenceState(
  state: SilenceState,
  levelDb: number,
  now: number,
): { state: SilenceState; silenceDetected: boolean } {
  const isSpeech = levelDb >= SPEECH_LEVEL_DB;
  const next: SilenceState = isSpeech
    ? { ...state, hasSpoken: true, lastSpeechAt: now }
    : state;
  const silenceDetected =
    next.hasSpoken &&
    now - next.startedAt >= MIN_RECORDING_BEFORE_AUTO_SEND_MS &&
    now - next.lastSpeechAt >= SILENCE_AFTER_SPEECH_MS;
  return { state: next, silenceDetected };
}

const WEB_SAMPLE_INTERVAL_MS = 100;

function rmsToDb(samples: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < samples.length; i += 1) sum += samples[i] * samples[i];
  const rms = Math.sqrt(sum / samples.length);
  return 20 * Math.log10(rms || 1e-8);
}

/**
 * Detecta a pausa depois da fala durante a gravação de voz.
 * No app nativo usa o nível que o próprio gravador mede (`metering`). Na web o
 * gravador do Expo não mede o nível, então o áudio do microfone é analisado
 * com a Web Audio API enquanto a gravação dura.
 */
export function useSilenceDetection(
  isRecording: boolean,
  nativeMeteringDb: number | undefined,
): boolean {
  const [silenceDetected, setSilenceDetected] = useState(false);
  const stateRef = useRef<SilenceState>(createSilenceState(Date.now()));

  const feedRef = useRef((levelDb: number) => {
    const result = updateSilenceState(stateRef.current, levelDb, Date.now());
    stateRef.current = result.state;
    if (result.silenceDetected) setSilenceDetected(true);
  });

  useEffect(() => {
    stateRef.current = createSilenceState(Date.now());
    setSilenceDetected(false);
  }, [isRecording]);

  useEffect(() => {
    if (Platform.OS === 'web' || !isRecording) return;
    if (nativeMeteringDb === undefined) return;
    feedRef.current(nativeMeteringDb);
  }, [isRecording, nativeMeteringDb]);

  useEffect(() => {
    if (Platform.OS !== 'web' || !isRecording) return;
    if (typeof navigator === 'undefined' || !navigator.mediaDevices) return;

    let cancelled = false;
    let stream: MediaStream | null = null;
    let context: AudioContext | null = null;
    let timer: ReturnType<typeof setInterval> | null = null;

    void navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((mediaStream) => {
        stream = mediaStream;
        if (cancelled) return;
        context = new AudioContext();
        const analyser = context.createAnalyser();
        analyser.fftSize = 2048;
        context.createMediaStreamSource(mediaStream).connect(analyser);
        const samples = new Float32Array(analyser.fftSize);
        timer = setInterval(() => {
          analyser.getFloatTimeDomainData(samples);
          feedRef.current(rmsToDb(samples));
        }, WEB_SAMPLE_INTERVAL_MS);
      })
      .catch(() => {
        // Sem análise do microfone: a gravação segue com envio manual.
      });

    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
      stream?.getTracks().forEach((track) => track.stop());
      void context?.close().catch(() => undefined);
    };
  }, [isRecording]);

  return silenceDetected;
}
