import React, { useMemo } from 'react';
import { View, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
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
}) => {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const isDisabled = loading || rateLimitCountdown > 0;

  return (
    <View style={[styles.inputRow, { borderTopColor: colors.borderColor }]}>
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
        placeholder="Digite sua mensagem..."
        placeholderTextColor={colors.placeholder}
        returnKeyType="send"
        onSubmitEditing={onSend}
        blurOnSubmit={false}
        multiline={false}
        maxLength={2000}
        editable={!isDisabled}
        keyboardType={
          conversationState === 'AGUARDANDO_ID_AGENDAMENTO' ? 'numeric' : 'default'
        }
        accessibilityLabel="Campo de mensagem"
        accessibilityHint="Digite e pressione enviar ou Enter"
      />
      <TouchableOpacity
        style={[
          styles.sendButton,
          {
            backgroundColor:
              value.trim() && !loading ? colors.primaryOrange : colors.inputBackground,
          },
        ]}
        onPress={onSend}
        disabled={!value.trim() || loading}
        accessibilityRole="button"
        accessibilityLabel="Enviar mensagem">
        {loading ? (
          <ActivityIndicator size="small" color={colors.primaryOrange} />
        ) : (
          <FontAwesome
            name="send"
            size={16}
            color={value.trim() ? colors.primaryWhite : colors.textTertiary}
          />
        )}
      </TouchableOpacity>
    </View>
  );
};
