import React, { useMemo } from 'react';
import { Platform, View, Text, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useColors } from '@theme/ThemeProvider';
import { createStyles } from '../styles';

interface ChatHeaderProps {
  /** Limpa todas as mensagens e reinicia a sessão. */
  onClear: () => void;
  /** Impede reinício enquanto outra ação está em andamento. */
  restartDisabled?: boolean;
  /** Fecha ou minimiza o painel atual. */
  onClose?: () => void;
  /** Rótulo visível da ação de saída no mobile. */
  closeLabel?: 'Fechar' | 'Minimizar';
}

/**
 * Cabeçalho do painel do chatbot:
 * avatar na cor da marca, nome, status, botão reiniciar, botão fechar
 * (opcional) e a divisória que separa o cabeçalho da conversa.
 */
export const ChatHeader: React.FC<ChatHeaderProps> = ({
  onClear,
  restartDisabled = false,
  onClose,
  closeLabel = 'Fechar',
}) => {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const isNative = Platform.OS !== 'web';

  return (
    <>
      <View style={[styles.header, isNative && styles.headerMobile]}>
        <View style={styles.botInfo}>
          <View
            style={styles.botAvatar}
            accessible={false}
            importantForAccessibility="no-hide-descendants">
            <FontAwesome
              name="comment-o"
              size={12}
              color={colors.chat.iconOnAccent}
            />
          </View>
          <View style={styles.botText}>
            <Text
              style={styles.botName}
              numberOfLines={1}
              accessibilityRole="header">
              Assistente DelBicos
            </Text>
            <Text style={styles.botStatus} numberOfLines={1}>
              online agora
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.headerActions,
            isNative && styles.headerActionsMobile,
          ]}>
          <TouchableOpacity
            onPress={onClear}
            style={[
              styles.headerActionButton,
              styles.restartButton,
              restartDisabled && styles.headerActionDisabled,
            ]}
            disabled={restartDisabled}
            accessibilityRole="button"
            accessibilityLabel="Reiniciar conversa"
            accessibilityHint="Apaga o andamento atual e inicia uma nova conversa"
            accessibilityState={{ disabled: restartDisabled }}>
            <FontAwesome
              name="refresh"
              size={14}
              color={colors.chat.accentText}
            />
            <Text style={styles.restartText}>Reiniciar</Text>
          </TouchableOpacity>

          {onClose && (
            <TouchableOpacity
              onPress={onClose}
              style={[styles.headerActionButton, styles.closeButton]}
              hitSlop={4}
              accessibilityRole="button"
              accessibilityLabel={`${closeLabel} chat`}
              accessibilityHint={
                closeLabel === 'Minimizar'
                  ? 'Fecha o painel sem apagar a conversa'
                  : 'Sai da tela do assistente'
              }>
              <FontAwesome
                name={closeLabel === 'Minimizar' ? 'chevron-down' : 'times'}
                size={16}
                color={colors.chat.textPrimary}
              />
              {isNative && <Text style={styles.closeText}>{closeLabel}</Text>}
            </TouchableOpacity>
          )}
        </View>
      </View>
      <View style={styles.headerDivider} />
    </>
  );
};
