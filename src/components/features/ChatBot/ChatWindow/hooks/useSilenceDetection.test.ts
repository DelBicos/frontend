import {
  MIN_RECORDING_BEFORE_AUTO_SEND_MS,
  SILENCE_AFTER_SPEECH_MS,
  createSilenceState,
  updateSilenceState,
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
