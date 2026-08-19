import { useCallback, useEffect, useState } from 'react';
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

/**
 * Captura áudio no navegador e nos aplicativos nativos com a mesma API.
 * O preset gera WebM na web e AAC/M4A no mobile, ambos aceitos pelo backend.
 */
export function useVoiceRecorder() {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 250);
  const [isPreparing, setIsPreparing] = useState(false);

  // Fecha a captura ao minimizar ou sair do chatbot sem enviar o áudio.
  useEffect(
    () => () => {
      if (recorder.isRecording) {
        recorder.stop().catch(() => undefined);
      }
      setAudioModeAsync({ allowsRecording: false }).catch(() => undefined);
    },
    [recorder],
  );

  const startRecording = useCallback(async () => {
    if (isPreparing || recorderState.isRecording) return;
    setIsPreparing(true);

    try {
      const permission = await requestRecordingPermissionsAsync();
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
      await recorder.prepareToRecordAsync();
      recorder.record();
    } catch (error) {
      console.warn(
        '[useVoiceRecorder] Não foi possível iniciar a gravação:',
        error,
      );
      await setAudioModeAsync({ allowsRecording: false }).catch(
        () => undefined,
      );
      if (error instanceof Error && error.message.startsWith('Permita')) {
        throw error;
      }
      throw new Error(
        'Não foi possível iniciar a gravação. Verifique a permissão do microfone e tente novamente.',
      );
    } finally {
      setIsPreparing(false);
    }
  }, [isPreparing, recorder, recorderState.isRecording]);

  const stopRecording = useCallback(async (): Promise<VoiceRecording> => {
    if (!recorderState.isRecording) {
      throw new Error('Nenhuma gravação está em andamento.');
    }

    const durationMillis = recorderState.durationMillis;
    try {
      await recorder.stop();
      if (!recorder.uri) {
        throw new Error('Arquivo de áudio indisponível após a gravação.');
      }
      const uri = recorder.uri;

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
      console.warn(
        '[useVoiceRecorder] Não foi possível finalizar a gravação:',
        error,
      );
      throw new Error('Não foi possível preparar o áudio para envio.');
    } finally {
      await setAudioModeAsync({ allowsRecording: false }).catch(
        () => undefined,
      );
    }
  }, [recorder, recorderState.durationMillis, recorderState.isRecording]);

  return {
    isRecording: recorderState.isRecording,
    isPreparing,
    durationMillis: recorderState.durationMillis,
    startRecording,
    stopRecording,
  };
}
