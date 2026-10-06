import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useColors } from '@theme/ThemeProvider';
import { createStyles } from '../styles';

interface ChatErrorBannerProps {
  error: string;
  rateLimitCountdown: number;
  lastSentText: string | null;
  hasRetryableVoiceCommand: boolean;
  onRetry: () => void;
  onSwitchToText?: () => void;
}

/**
 * Banner de erro do chatbot.
 * Exibe mensagem de erro genérica ou countdown de rate limit (429).
 * Mostra botão "Tentar novamente" quando há uma última mensagem para reenviar
 * e opção de "Digitar por texto" para transição de fallback suave.
 */
export const ChatErrorBanner: React.FC<ChatErrorBannerProps> = ({
  error,
  rateLimitCountdown,
  lastSentText,
  hasRetryableVoiceCommand,
  onRetry,
  onSwitchToText,
}) => {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const hasActions =
    rateLimitCountdown === 0 &&
    (Boolean(lastSentText) ||
      hasRetryableVoiceCommand ||
      Boolean(onSwitchToText));

  return (
    <View
      style={[styles.errorBanner, { backgroundColor: colors.errorBackground }]}>
      <Text style={[styles.errorText, { color: colors.errorText }]}>
        {rateLimitCountdown > 0
          ? `Aguarde ${rateLimitCountdown}s antes de enviar outra mensagem.`
          : error}
      </Text>
      {hasActions && (
        <View style={styles.errorActionsRow}>
          {(lastSentText || hasRetryableVoiceCommand) && (
            <TouchableOpacity
              onPress={onRetry}
              accessibilityRole="button"
              accessibilityLabel="Tentar novamente">
              <Text style={[styles.retryText, { color: colors.primaryBlue }]}>
                Tentar novamente
              </Text>
            </TouchableOpacity>
          )}
          {onSwitchToText && (
            <TouchableOpacity
              onPress={onSwitchToText}
              accessibilityRole="button"
              accessibilityLabel="Digitar por texto">
              <Text style={[styles.retryText, { color: colors.primaryOrange }]}>
                Digitar por texto
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};
