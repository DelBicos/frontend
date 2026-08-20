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
 * avatar animado, nome, subtítulo, botão reiniciar e botão fechar (opcional).
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
    <View
      style={[styles.header, isNative && styles.headerMobile]}
      accessibilityRole="header">
      <View style={styles.botInfo}>
        <View
          style={[styles.botAvatar, { backgroundColor: colors.primaryOrange }]}>
          <FontAwesome
            name="commenting"
            size={16}
            color={colors.primaryWhite}
          />
        </View>
        <View style={styles.botText}>
          <Text style={styles.botName} numberOfLines={1}>
            Assistente DelBicos
          </Text>
          <Text style={styles.botSubtitle} numberOfLines={1}>
            Agendamentos via chat
          </Text>
        </View>
      </View>

      <View
        style={[styles.headerActions, isNative && styles.headerActionsMobile]}>
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
          <FontAwesome name="refresh" size={16} color={colors.primaryOrange} />
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
              size={18}
              color={colors.textSecondary}
            />
            {isNative && <Text style={styles.closeText}>{closeLabel}</Text>}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
