import React, { useMemo } from 'react';
import {
  View,
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

/**
 * Barra de input do chatbot: campo de texto + botão de envio.
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
  const recordingSeconds = Math.floor(recordingDurationMillis / 1000);
  const maxRecordingSeconds = Math.floor(maxRecordingDurationMillis / 1000);

  return (
    <View style={[styles.inputRow, { borderTopColor: colors.borderColor }]}>
      {isRecording && (
        <TouchableOpacity
          style={[
            styles.sendButton,
            {
              backgroundColor: colors.inputBackground,
              borderColor: colors.errorText,
              borderWidth: 1,
            },
          ]}
          onPress={onVoiceCancel}
          disabled={isVoiceDisabled}
          accessibilityRole="button"
          accessibilityLabel="Cancelar gravação de áudio"
          accessibilityHint="Descarta a gravação de áudio sem enviar ao assistente">
          <FontAwesome name="trash" size={16} color={colors.errorText} />
        </TouchableOpacity>
      )}
      <TextInput
        ref={inputRef}
        style={[
          styles.input,
          {
            color: colors.primaryBlack,
            backgroundColor: colors.inputBackground,
            borderColor: colors.borderColor,
          },
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={
          isVoicePreparing
            ? 'Preparando o microfone...'
            : isRecording
              ? `Gravando ${recordingSeconds}s de ${maxRecordingSeconds}s... toque no botão para enviar`
              : 'Digite sua mensagem...'
        }
        placeholderTextColor={colors.placeholder}
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
          isVoicePreparing
            ? 'Preparando o microfone.'
            : isRecording
              ? 'A gravação está em andamento. Toque no microfone para enviar.'
              : 'Digite e pressione enviar ou Enter'
        }
      />
      <TouchableOpacity
        style={[
          styles.sendButton,
          {
            backgroundColor: isRecording
              ? colors.errorText
              : colors.inputBackground,
          },
        ]}
        onPress={onVoicePress}
        disabled={isVoiceDisabled}
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
        }>
        {isVoicePreparing ? (
          <ActivityIndicator size="small" color={colors.primaryOrange} />
        ) : (
          <FontAwesome
            name={isRecording ? 'stop' : 'microphone'}
            size={16}
            color={isRecording ? colors.primaryWhite : colors.primaryOrange}
          />
        )}
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.sendButton,
          {
            backgroundColor:
              value.trim() && !isTextDisabled && !isRecording
                ? colors.primaryOrange
                : colors.inputBackground,
          },
        ]}
        onPress={onSend}
        disabled={!value.trim() || isTextDisabled || isRecording}
        accessibilityRole="button"
        accessibilityLabel="Enviar mensagem">
        {loading ? (
          <ActivityIndicator size="small" color={colors.primaryOrange} />
        ) : (
          <FontAwesome
            name="send"
            size={16}
            color={
              value.trim() && !isTextDisabled && !isRecording
                ? colors.primaryWhite
                : colors.textTertiary
            }
          />
        )}
      </TouchableOpacity>
    </View>
  );
};

