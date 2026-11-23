import React, { useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useColors } from '@theme/ThemeProvider';
import { ChatBotState } from '@stores/ChatBot/types';
import { createStyles } from '../styles';

interface ChatInputBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  loading: boolean;
  rateLimitCountdown: number;
  conversationState: ChatBotState | null;
  inputRef: React.RefObject<TextInput | null>;
  isRecording: boolean;
  isVoicePreparing: boolean;
  recordingDurationMillis: number;
  maxRecordingDurationMillis: number;
  onVoicePress: () => void;
  onVoiceCancel: () => void;
}

export const VOICE_HINT = 'por texto ou por voz, em português';

/**
 * Rodapé do chatbot: linha de voz (microfone + dica) e linha de texto
 * (campo + botão de envio).
 * Teclado muda para numérico quando o bot aguarda um ID de agendamento.
 */
export const ChatInputBar: React.FC<ChatInputBarProps> = ({
  value,
  onChangeText,
  onSend,
  loading,
  rateLimitCountdown,
  conversationState,
  inputRef,
  isRecording,
  isVoicePreparing,
  recordingDurationMillis,
  maxRecordingDurationMillis,
  onVoicePress,
  onVoiceCancel,
}) => {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const isVoiceDisabled = loading || rateLimitCountdown > 0 || isVoicePreparing;
  const isTextDisabled = loading;
  const canSend = !!value.trim() && !isTextDisabled && !isRecording;
  const recordingSeconds = Math.floor(recordingDurationMillis / 1000);
  const maxRecordingSeconds = Math.floor(maxRecordingDurationMillis / 1000);

  const voiceHint = isVoicePreparing
    ? 'Preparando o microfone...'
    : isRecording
      ? `Gravando ${recordingSeconds}s de ${maxRecordingSeconds}s... toque no microfone para enviar`
      : VOICE_HINT;

  return (
    <View style={styles.footer}>
      <View style={styles.voiceRow}>
        <TouchableOpacity
          testID="chat-voice-button"
          style={[styles.micButton, isRecording && styles.micButtonRecording]}
          onPress={onVoicePress}
          disabled={isVoiceDisabled}
          // 28 px circle + 8 px on each side = 44 px touch target.
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={
            isVoicePreparing
              ? 'Preparando o microfone'
              : isRecording
                ? `Parar e enviar comando de voz, ${recordingSeconds} segundos gravados`
                : 'Gravar comando de voz'
          }
          accessibilityHint={
            isVoicePreparing
              ? 'Aguarde a preparação terminar'
              : isRecording
                ? 'Toque para transcrever e enviar o áudio'
                : 'Toque para começar a gravar'
          }
          accessibilityState={{
            disabled: isVoiceDisabled,
            busy: isVoicePreparing,
          }}>
          {isVoicePreparing ? (
            <ActivityIndicator size="small" color={colors.chat.micIcon} />
          ) : (
            <FontAwesome
              name={isRecording ? 'stop' : 'microphone'}
              size={13}
              color={
                isRecording ? colors.chat.textOnAccent : colors.chat.micIcon
              }
            />
          )}
        </TouchableOpacity>

        <Text
          style={styles.voiceHint}
          numberOfLines={2}
          accessibilityLiveRegion={isRecording ? 'polite' : 'none'}>
          {voiceHint}
        </Text>

        {isRecording && (
          <TouchableOpacity
            testID="chat-voice-cancel-button"
            style={styles.voiceCancel}
            onPress={onVoiceCancel}
            disabled={isVoiceDisabled}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel="Cancelar gravação de áudio"
            accessibilityHint="Descarta a gravação de áudio sem enviar ao assistente">
            <FontAwesome
              name="trash"
              size={12}
              color={colors.chat.textPrimary}
            />
            <Text style={styles.voiceCancelText}>Descartar</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.inputRow}>
        <TextInput
          testID="chat-message-input"
          ref={inputRef}
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder="Digite sua mensagem..."
          placeholderTextColor={colors.chat.placeholder}
          returnKeyType="send"
          onSubmitEditing={onSend}
          blurOnSubmit={false}
          multiline={false}
          maxLength={2000}
          editable={!isTextDisabled && !isRecording}
          keyboardType={
            conversationState === 'AGUARDANDO_ID_AGENDAMENTO'
              ? 'numeric'
              : 'default'
          }
          accessibilityLabel="Campo de mensagem"
          accessibilityHint={
            isRecording
              ? 'A gravação está em andamento. Toque no microfone para enviar.'
              : 'Digite e pressione enviar ou Enter'
          }
        />
        <TouchableOpacity
          testID="chat-send-button"
          style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
          onPress={onSend}
          disabled={!canSend}
          accessibilityRole="button"
          accessibilityLabel="Enviar mensagem"
          accessibilityState={{ disabled: !canSend, busy: loading }}>
          {loading ? (
            <ActivityIndicator size="small" color={colors.chat.accentText} />
          ) : (
            <FontAwesome
              name="send"
              size={15}
              color={
                canSend ? colors.chat.textOnAccent : colors.chat.textSecondary
              }
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};
