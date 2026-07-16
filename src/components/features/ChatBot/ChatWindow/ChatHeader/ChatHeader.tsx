import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useColors } from '@theme/ThemeProvider';
import { createStyles } from '../styles';

interface ChatHeaderProps {
  /** Limpa todas as mensagens e reinicia a sessão. */
  onClear: () => void;
  /** Fecha o painel. Opcional — não exibido no ChatBotScreen. */
  onClose?: () => void;
}

/**
 * Cabeçalho do painel do chatbot:
 * avatar animado, nome, subtítulo, botão reiniciar e botão fechar (opcional).
 */
export const ChatHeader: React.FC<ChatHeaderProps> = ({ onClear, onClose }) => {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.header} accessibilityRole="header">
      <View style={styles.botInfo}>
        <View style={[styles.botAvatar, { backgroundColor: colors.primaryOrange }]}>
          <FontAwesome name="commenting" size={16} color={colors.primaryWhite} />
        </View>
        <View>
          <Text style={styles.botName}>Assistente DelBicos</Text>
          <Text style={styles.botSubtitle}>Agendamentos via chat</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <TouchableOpacity
          onPress={onClear}
          style={{ flexDirection: 'row', alignItems: 'center', padding: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Reiniciar chat">
          <FontAwesome
            name="refresh"
            size={15}
            color={colors.primaryOrange}
            style={{ marginRight: 4 }}
          />
          <Text style={{ color: colors.primaryOrange, fontFamily: 'Afacad-SemiBold', fontSize: 14 }}>
            Reiniciar
          </Text>
        </TouchableOpacity>

        {onClose && (
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            accessibilityRole="button"
            accessibilityLabel="Fechar chat">
            <FontAwesome name="times" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
