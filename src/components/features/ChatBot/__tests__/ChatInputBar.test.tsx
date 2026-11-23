import React from 'react';
import { TextInput } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import {
  ChatInputBar,
  VOICE_HINT,
} from '../ChatWindow/ChatInputBar/ChatInputBar';

const renderBar = (
  props: Partial<React.ComponentProps<typeof ChatInputBar>> = {},
) => {
  const handlers = {
    onChangeText: jest.fn(),
    onSend: jest.fn(),
    onVoicePress: jest.fn(),
    onVoiceCancel: jest.fn(),
  };
  const utils = render(
    <ChatInputBar
      value=""
      loading={false}
      rateLimitCountdown={0}
      conversationState={null}
      inputRef={React.createRef<TextInput>()}
      isRecording={false}
      isVoicePreparing={false}
      recordingDurationMillis={0}
      maxRecordingDurationMillis={60_000}
      {...handlers}
      {...props}
    />,
  );
  return { ...utils, ...handlers };
};

const isDisabled = (getByTestId: (id: string) => any, id: string) =>
  getByTestId(id).props.accessibilityState?.disabled;

describe('ChatInputBar', () => {
  // ─── RODAPÉ DE VOZ ───────────────────────────────────
  it('deve exibir a dica "por texto ou por voz, em português"', () => {
    const { getByText } = renderBar();

    expect(getByText(VOICE_HINT)).toBeTruthy();
  });

  it('deve começar a gravar ao tocar no microfone', () => {
    const { getByLabelText, onVoicePress } = renderBar();

    fireEvent.press(getByLabelText('Gravar comando de voz'));

    expect(onVoicePress).toHaveBeenCalledTimes(1);
  });

  it('deve mostrar o tempo e a opção de descartar durante a gravação', () => {
    const { getByText, getByTestId, onVoiceCancel } = renderBar({
      isRecording: true,
      recordingDurationMillis: 12_400,
    });

    expect(
      getByText('Gravando 12s de 60s... toque no microfone para enviar'),
    ).toBeTruthy();
    expect(getByTestId('chat-message-input').props.editable).toBe(false);

    fireEvent.press(getByTestId('chat-voice-cancel-button'));
    expect(onVoiceCancel).toHaveBeenCalledTimes(1);
  });

  it('não deve exibir "Descartar" fora da gravação', () => {
    const { queryByTestId } = renderBar();

    expect(queryByTestId('chat-voice-cancel-button')).toBeNull();
  });

  it('deve avisar enquanto prepara o microfone e bloquear o botão', () => {
    const { getByText, getByTestId } = renderBar({ isVoicePreparing: true });

    expect(getByText('Preparando o microfone...')).toBeTruthy();
    expect(isDisabled(getByTestId, 'chat-voice-button')).toBe(true);
  });

  it('deve bloquear o microfone durante o limite de mensagens', () => {
    const { getByTestId } = renderBar({ rateLimitCountdown: 10 });

    expect(isDisabled(getByTestId, 'chat-voice-button')).toBe(true);
  });

  // ─── TEXTO ───────────────────────────────────────────
  it.each(['', '   '])('deve bloquear o envio com o texto "%s"', (value) => {
    const { getByTestId, onSend } = renderBar({ value });

    fireEvent.press(getByTestId('chat-send-button'));

    expect(isDisabled(getByTestId, 'chat-send-button')).toBe(true);
    expect(onSend).not.toHaveBeenCalled();
  });

  it('deve enviar quando houver texto', () => {
    const { getByTestId, onSend } = renderBar({ value: 'quero uma limpeza' });

    fireEvent.press(getByTestId('chat-send-button'));

    expect(onSend).toHaveBeenCalledTimes(1);
  });

  it('deve bloquear campo e envio enquanto o assistente responde', () => {
    const { getByTestId } = renderBar({ value: 'oi', loading: true });

    expect(getByTestId('chat-message-input').props.editable).toBe(false);
    expect(isDisabled(getByTestId, 'chat-send-button')).toBe(true);
  });

  it('deve repassar o que o usuário digita', () => {
    const { getByTestId, onChangeText } = renderBar();

    fireEvent.changeText(getByTestId('chat-message-input'), 'sexta às 14h');

    expect(onChangeText).toHaveBeenCalledWith('sexta às 14h');
  });

  it('deve usar teclado numérico quando o bot aguarda o ID do agendamento', () => {
    const { getByTestId } = renderBar({
      conversationState: 'AGUARDANDO_ID_AGENDAMENTO',
    });

    expect(getByTestId('chat-message-input').props.keyboardType).toBe(
      'numeric',
    );
  });
});
