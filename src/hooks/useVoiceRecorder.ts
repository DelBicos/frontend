import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { Platform } from 'react-native';
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';

const VOICE_MIME_TYPE = Platform.OS === 'web' ? 'audio/webm' : 'audio/m4a';
/** Mantém o áudio curto, rápido de transcrever e muito abaixo do limite do backend. */
export const MAX_VOICE_RECORDING_DURATION_MS = 60_000;

export interface VoiceRecording {
  uri: string;
  mimeType: string;
  durationMillis: number;
  /** Libera recursos temporários do navegador depois do envio definitivo. */
  release: () => void;
}

type RecorderOperation = 'idle' | 'starting' | 'recording' | 'stopping';

function recordingCancelledError(): Error {
  const error = new Error('A gravação foi cancelada.');
  error.name = 'AbortError';
  return error;
}

/**
 * Captura áudio no navegador e nos aplicativos nativos com a mesma API.
 * O preset gera WebM na web e AAC/M4A no mobile, ambos aceitos pelo backend.
 */
export function useVoiceRecorder() {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 250);
  const [isPreparing, setIsPreparing] = useState(false);
  // Começa ativo porque o ChatWindow pode existir dentro de um Modal ainda
  // oculto; alguns ciclos do Modal preservam a instância antes do layout effect.
  // O cleanup abaixo continua marcando `false` antes do release nativo.
  const mountedRef = useRef(true);
  const operationRef = useRef<RecorderOperation>('idle');

  // O cleanup de layout ocorre antes dos cleanups passivos do Expo. Assim,
  // continuações de permissão/preparo/parada sabem que não podem mais tocar
  // no SharedObject nativo que será liberado durante o mesmo unmount.
  useLayoutEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      operationRef.current = 'idle';
    };
  }, []);

  // No Android/iOS, `useAudioRecorder` libera (e encerra) o objeto nativo antes
  // deste cleanup. Não acesse o recorder nesses ambientes depois do unmount:
  // qualquer getter ou método lança "shared object already released".
  // A implementação web não faz o mesmo release, então precisa encerrar o
  // MediaRecorder explicitamente para apagar o indicador do microfone.
  useEffect(
    () => () => {
      if (Platform.OS === 'web' && recorder.isRecording) {
        void recorder
          .stop()
          .then(() => {
            const uri = recorder.uri;
            if (uri?.startsWith('blob:')) URL.revokeObjectURL(uri);
          })
          .catch(() => undefined);
      }

      void setAudioModeAsync({ allowsRecording: false }).catch(() => undefined);
    },
    [recorder],
  );

  const startRecording = useCallback(async () => {
    if (
      !mountedRef.current ||
      operationRef.current !== 'idle' ||
      recorderState.isRecording
    ) {
      return;
    }

    operationRef.current = 'starting';
    setIsPreparing(true);

    try {
      const permission = await requestRecordingPermissionsAsync();
      if (!mountedRef.current) return;

      if (!permission.granted) {
        throw new Error(
          'Permita o uso do microfone para enviar um comando de voz.',
        );
      }

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
        interruptionMode: 'duckOthers',
        shouldPlayInBackground: false,
        shouldRouteThroughEarpiece: false,
      });
      if (!mountedRef.current) return;

      await recorder.prepareToRecordAsync();
      if (!mountedRef.current) return;

      recorder.record();
      operationRef.current = 'recording';
    } catch (error) {
      if (!mountedRef.current) return;

      console.warn(
        '[useVoiceRecorder] Não foi possível iniciar a gravação:',
        error,
      );
      await setAudioModeAsync({ allowsRecording: false }).catch(
        () => undefined,
      );
      if (!mountedRef.current) return;

      if (error instanceof Error && error.message.startsWith('Permita')) {
        throw error;
      }
      throw new Error(
        'Não foi possível iniciar a gravação. Verifique a permissão do microfone e tente novamente.',
      );
    } finally {
      if (operationRef.current === 'starting') {
        operationRef.current = 'idle';
      }
      if (mountedRef.current) {
        setIsPreparing(false);
      } else {
        void setAudioModeAsync({ allowsRecording: false }).catch(
          () => undefined,
        );
      }
    }
  }, [recorder, recorderState.isRecording]);

  const stopRecording = useCallback(async (): Promise<VoiceRecording> => {
    if (!mountedRef.current) throw recordingCancelledError();
    if (operationRef.current === 'stopping') {
      throw recordingCancelledError();
    }
    if (operationRef.current !== 'recording' && !recorderState.isRecording) {
      throw new Error('Nenhuma gravação está em andamento.');
    }

    operationRef.current = 'stopping';
    const durationMillis = recorderState.durationMillis;
    try {
      await recorder.stop();
      if (!mountedRef.current) throw recordingCancelledError();

      const uri = recorder.uri;
      if (!uri) {
        throw new Error('Arquivo de áudio indisponível após a gravação.');
      }

      return {
        uri,
        mimeType: VOICE_MIME_TYPE,
        durationMillis,
        release: () => {
          if (Platform.OS === 'web' && uri.startsWith('blob:')) {
            URL.revokeObjectURL(uri);
          }
        },
      };
    } catch (error) {
      if (
        !mountedRef.current ||
        (error instanceof Error && error.name === 'AbortError')
      ) {
        throw recordingCancelledError();
      }

      console.warn(
        '[useVoiceRecorder] Não foi possível finalizar a gravação:',
        error,
      );
      throw new Error('Não foi possível preparar o áudio para envio.');
    } finally {
      if (operationRef.current === 'stopping') {
        operationRef.current = 'idle';
      }
      await setAudioModeAsync({ allowsRecording: false }).catch(
        () => undefined,
      );
    }
  }, [recorder, recorderState.durationMillis, recorderState.isRecording]);

  const cancelRecording = useCallback(async (): Promise<void> => {
    if (!mountedRef.current) return;
    if (operationRef.current === 'stopping') return;
    if (operationRef.current !== 'recording' && !recorderState.isRecording) {
      return;
    }

    operationRef.current = 'stopping';
    try {
      await recorder.stop();
      const uri = recorder.uri;
      if (Platform.OS === 'web' && uri?.startsWith('blob:')) {
        URL.revokeObjectURL(uri);
      }
    } catch (error) {
      console.warn(
        '[useVoiceRecorder] Não foi possível cancelar a gravação:',
        error,
      );
    } finally {
      if (operationRef.current === 'stopping') {
        operationRef.current = 'idle';
      }
      await setAudioModeAsync({ allowsRecording: false }).catch(
        () => undefined,
      );
    }
  }, [recorder, recorderState.isRecording]);

  return {
    isRecording: recorderState.isRecording,
    isPreparing,
    durationMillis: recorderState.durationMillis,
    startRecording,
    stopRecording,
    cancelRecording,
  };
}
