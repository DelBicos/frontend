import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import {
  View,
  TouchableOpacity,
  Modal,
  Platform,
  Animated,
  Dimensions,
  Text,
  SafeAreaView,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useColors } from '@theme/ThemeProvider';
import { useChatBotStore } from '@stores/ChatBot';
import { ChatWindow } from '../ChatWindow';
import { createStyles } from './styles';

const PANEL_MAX_WIDTH = 400;

interface ChatWidgetProps {
  /** Posição vertical do FAB em relação ao bottom. Default: 80 (acima do tab bar). */
  bottomOffset?: number;
}

/**
 * Botão flutuante que abre o painel do chatbot.
 * - Web: painel lateral fixo (drawer-style) animado.
 * - Mobile: Modal em tela cheia com SafeAreaView.
 */
export const ChatWidget: React.FC<ChatWidgetProps> = ({
  bottomOffset = 80,
}) => {
  const colors = useColors();
  const [open, setOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const { messages } = useChatBotStore();

  // Conta mensagens do bot após a última mensagem do usuário (passagem única)
  const unreadCount = useMemo(() => {
    if (open) return 0;
    let lastUserIdx = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') { lastUserIdx = i; break; }
    }
    if (lastUserIdx === -1) return 0;
    let count = 0;
    for (let i = lastUserIdx + 1; i < messages.length; i++) {
      if (messages[i].role === 'bot') count++;
    }
    return count;
  }, [messages, open]);

  const openPanel = useCallback(() => {
    setOpen(true);
    if (Platform.OS === 'web') {
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 80,
        friction: 12,
      }).start();
    }
  }, [slideAnim]);

  const closePanel = useCallback(() => {
    if (Platform.OS === 'web') {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setOpen(false));
    } else {
      setOpen(false);
    }
  }, [slideAnim]);

  // Web: fechar com Escape
  useEffect(() => {
    if (Platform.OS !== 'web' || !open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePanel();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, closePanel]);

  // Memoiza o StyleSheet — evita recriar em cada render
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { width: screenWidth } = Dimensions.get('window');

  // ── Web: Drawer lateral animado ──────────────────────────────────────────
  if (Platform.OS === 'web') {
    const panelWidth = Math.min(PANEL_MAX_WIDTH, screenWidth * 0.95);
    const translateX = slideAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [panelWidth, 0],
    });

    return (
      <>
        {/* Backdrop */}
        {open && (
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            onPress={closePanel}
            activeOpacity={1}
            accessible={false}>
            <View
              style={[
                StyleSheet.absoluteFillObject,
                { backgroundColor: colors.overlay },
              ]}
            />
          </TouchableOpacity>
        )}

        {/* Drawer panel */}
        {open && (
          <Animated.View
            style={[
              styles.webPanel,
              { width: panelWidth, transform: [{ translateX }] },
            ]}
            accessibilityViewIsModal
            accessibilityLabel="Painel de chat">
            <SafeAreaView style={{ flex: 1 }}>
              <ChatWindow onClose={closePanel} />
            </SafeAreaView>
          </Animated.View>
        )}

        {/* FAB */}
        <View style={[styles.fab, { bottom: bottomOffset }]}>
          {unreadCount > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.primaryRed }]}>
              <Text style={styles.badgeText}>
                {unreadCount > 9 ? '9+' : String(unreadCount)}
              </Text>
            </View>
          )}
          <TouchableOpacity
            style={[styles.fabButton, { backgroundColor: colors.primaryOrange }]}
            onPress={open ? closePanel : openPanel}
            accessibilityRole="button"
            accessibilityLabel={open ? 'Fechar assistente' : 'Abrir assistente de agendamentos'}>
            <FontAwesome
              name={open ? 'times' : 'commenting'}
              size={22}
              color={colors.primaryWhite}
            />
          </TouchableOpacity>
        </View>
      </>
    );
  }

  // ── Mobile: Modal tela cheia ──────────────────────────────────────────────
  return (
    <>
      {/* FAB */}
      <View style={[styles.fab, { bottom: bottomOffset }]}>
        {unreadCount > 0 && (
          <View style={[styles.badge, { backgroundColor: colors.primaryRed }]}>
            <Text style={styles.badgeText}>
              {unreadCount > 9 ? '9+' : String(unreadCount)}
            </Text>
          </View>
        )}
        <TouchableOpacity
          style={[styles.fabButton, { backgroundColor: colors.primaryOrange }]}
          onPress={openPanel}
          accessibilityRole="button"
          accessibilityLabel="Abrir assistente de agendamentos">
          <FontAwesome name="commenting" size={22} color={colors.primaryWhite} />
        </TouchableOpacity>
      </View>

      {/* Modal */}
      <Modal
        visible={open}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closePanel}
        statusBarTranslucent>
        <SafeAreaView
          style={[styles.modalContainer, { backgroundColor: colors.backgroundElevated }]}>
          <ChatWindow onClose={closePanel} />
        </SafeAreaView>
      </Modal>
    </>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

