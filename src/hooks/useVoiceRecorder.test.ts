// @ts-nocheck
/// <reference types="jest" />

import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Platform } from 'react-native';
import * as ExpoAudio from 'expo-audio';
import { useVoiceRecorder } from './useVoiceRecorder';

jest.mock('expo-audio', () => {
  // O factory do Jest precisa carregar a mesma instância do React usada pelo
  // renderer para que o efeito simulado participe do ciclo de desmontagem.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  let released = false;
  let isRecordingReads = 0;
  const stop = jest.fn().mockResolvedValue(undefined);
  const prepareToRecordAsync = jest.fn().mockResolvedValue(undefined);
  const record = jest.fn();
  const requestRecordingPermissionsAsync = jest
    .fn()
    .mockResolvedValue({ granted: true });

  const recorder = {
    id: 1,
    get isRecording() {
      isRecordingReads += 1;
      if (released) {
        throw new Error('Cannot use shared object that was already released');
      }
      return false;
    },
    get uri() {
      if (released) {
        throw new Error('Cannot use shared object that was already released');
      }
      return null;
    },
    prepareToRecordAsync,
    record,
    stop,
  };

  return {
    RecordingPresets: { HIGH_QUALITY: {} },
    requestRecordingPermissionsAsync,
    setAudioModeAsync: jest.fn().mockResolvedValue(undefined),
    useAudioRecorder: () => {
      // Reproduz a ordem real do Expo: o efeito interno libera o SharedObject
      // antes que o cleanup do hook consumidor seja executado.
      React.useEffect(
        () => () => {
          released = true;
        },
        [],
      );
      return recorder;
    },
    useAudioRecorderState: () => ({
      isRecording: false,
      durationMillis: 0,
    }),
    __mockRecorder: {
      reset: () => {
        released = false;
        isRecordingReads = 0;
        stop.mockClear();
        prepareToRecordAsync.mockClear();
        record.mockClear();
        requestRecordingPermissionsAsync
          .mockReset()
          .mockResolvedValue({ granted: true });
      },
      wasReleased: () => released,
      isRecordingReads: () => isRecordingReads,
      stop,
      prepareToRecordAsync,
      record,
      requestRecordingPermissionsAsync,
    },
  };
});

const mockRecorderLifecycle = (
  jest.requireMock('expo-audio') as {
    __mockRecorder: {
      reset: () => void;
      wasReleased: () => boolean;
      isRecordingReads: () => number;
      stop: jest.Mock;
      prepareToRecordAsync: jest.Mock;
      record: jest.Mock;
      requestRecordingPermissionsAsync: jest.Mock;
    };
  }
).__mockRecorder;

function Harness({ onRender }: { onRender?: (value: unknown) => void }) {
  const voiceRecorder = useVoiceRecorder();
  onRender?.(voiceRecorder);
  return null;
}

describe('useVoiceRecorder', () => {
  beforeEach(() => {
    mockRecorderLifecycle.reset();
  });

  it('does not access the native recorder after Expo releases it', async () => {
    expect(Platform.OS).not.toBe('web');

    let root: TestRenderer.ReactTestRenderer;
    await act(async () => {
      root = TestRenderer.create(React.createElement(Harness));
    });

    expect(() => {
      act(() => root.unmount());
    }).not.toThrow();

    expect(mockRecorderLifecycle.wasReleased()).toBe(true);
    expect(mockRecorderLifecycle.isRecordingReads()).toBe(0);
    expect(mockRecorderLifecycle.stop).not.toHaveBeenCalled();
    expect(ExpoAudio.setAudioModeAsync).toHaveBeenCalledWith({
      allowsRecording: false,
    });
  });

  it('does not prepare or record after unmount while permission is pending', async () => {
    let resolvePermission: (permission: { granted: boolean }) => void;
    mockRecorderLifecycle.requestRecordingPermissionsAsync.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolvePermission = resolve;
        }),
    );

    let root: TestRenderer.ReactTestRenderer;
    let voiceRecorder: ReturnType<typeof useVoiceRecorder>;
    await act(async () => {
      root = TestRenderer.create(
        React.createElement(Harness, {
          onRender: (value) => {
            voiceRecorder = value as ReturnType<typeof useVoiceRecorder>;
          },
        }),
      );
    });

    let startPromise: Promise<void>;
    await act(async () => {
      startPromise = voiceRecorder.startRecording();
      await Promise.resolve();
    });
    act(() => root.unmount());

    await act(async () => {
      resolvePermission({ granted: true });
      await startPromise;
    });

    expect(mockRecorderLifecycle.prepareToRecordAsync).not.toHaveBeenCalled();
    expect(mockRecorderLifecycle.record).not.toHaveBeenCalled();
  });
});
