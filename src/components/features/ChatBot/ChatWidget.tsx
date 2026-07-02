import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Platform,
  Animated,
  Dimensions,
  Text,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useColors } from '@theme/ThemeProvider';
import { useChatBotStore } from '@stores/ChatBot';
import { ChatWindow } from './ChatWindow';

const PANEL_MAX_WIDTH = 400;
const PANEL_HEIGHT_RATIO = 0.75;

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

  // Conta mensagens não lidas (mensagens do bot após a última mensagem do usuário)
  const unreadCount = React.useMemo(() => {
    if (open) return 0;
    const lastUserIdx = [...messages]
      .map((m, i) => (m.role === 'user' ? i : -1))
      .filter((i) => i >= 0)
      .pop();
    if (lastUserIdx === undefined) return 0;
    return messages.slice(lastUserIdx + 1).filter((m) => m.role === 'bot').length;
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

  const styles = createStyles(colors);
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

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

const createStyles = (colors: ReturnType<typeof import('@theme/ThemeProvider').useColors>) =>
  StyleSheet.create({
    fab: {
      position: 'absolute',
      right: 20,
      zIndex: 999,
    },
    fabButton: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 8,
    },
    badge: {
      position: 'absolute',
      top: -4,
      right: -4,
      minWidth: 20,
      height: 20,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1,
      paddingHorizontal: 4,
    },
    badgeText: {
      color: '#fff',
      fontSize: 11,
      fontFamily: 'Afacad-SemiBold',
    },
    // Web only
    webPanel: {
      position: 'absolute',
      right: 0,
      top: 0,
      bottom: 0,
      zIndex: 998,
      shadowColor: '#000',
      shadowOffset: { width: -4, height: 0 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 16,
    },
    // Mobile only
    modalContainer: {
      flex: 1,
    },
  });
