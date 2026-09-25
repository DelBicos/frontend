import React from 'react';
import { View } from 'react-native';
import { useColors } from '@theme/ThemeProvider';
import { useThemeStore, ThemeMode } from '@stores/Theme';
import { CONTENT_MAX_WIDTH, useBreakpoint } from '@lib/hooks/useBreakpoint';
import ChatInbox from './components/ChatInbox';

/** Rota /chats: caixa de entrada ocupando a altura da tela. */
const ChatListScreen: React.FC = () => {
  const colors = useColors();
  const theme = useThemeStore((s) => s.theme);
  const { gutter, isCompact } = useBreakpoint();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor:
          theme === ThemeMode.LIGHT_HI_CONTRAST
            ? colors.primaryWhite
            : colors.secondaryGray,
        paddingHorizontal: isCompact ? 0 : gutter,
        paddingVertical: isCompact ? 0 : 24,
      }}>
      <View
        style={{
          flex: 1,
          width: '100%',
          maxWidth: CONTENT_MAX_WIDTH,
          alignSelf: 'center',
        }}>
        <ChatInbox />
      </View>
    </View>
  );
};

export default ChatListScreen;
