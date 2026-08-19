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
}

/**
 * Banner de erro do chatbot.
 * Exibe mensagem de erro genérica ou countdown de rate limit (429).
 * Mostra botão "Tentar novamente" quando há uma última mensagem para reenviar.
 */
export const ChatErrorBanner: React.FC<ChatErrorBannerProps> = ({
  error,
  rateLimitCountdown,
  lastSentText,
  hasRetryableVoiceCommand,
  onRetry,
}) => {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View
      style={[styles.errorBanner, { backgroundColor: colors.errorBackground }]}>
      <Text style={[styles.errorText, { color: colors.errorText }]}>
        {rateLimitCountdown > 0
          ? `Aguarde ${rateLimitCountdown}s antes de enviar outra mensagem.`
          : error}
      </Text>
      {(lastSentText || hasRetryableVoiceCommand) &&
        rateLimitCountdown === 0 && (
          <TouchableOpacity
            onPress={onRetry}
            accessibilityRole="button"
            accessibilityLabel="Tentar novamente">
            <Text style={[styles.retryText, { color: colors.primaryBlue }]}>
              Tentar novamente
            </Text>
          </TouchableOpacity>
        )}
    </View>
  );
};
