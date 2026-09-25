import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useColors } from '@theme/ThemeProvider';
import { ColorsType } from '@theme/types';
import { Conversation } from '@stores/Chat';
import { useBreakpoint } from '@lib/hooks/useBreakpoint';
import ChatRoomListPanel from './ChatRoomListPanel';
import ChatThreadPanel from './ChatThreadPanel';

/** Largura a partir da qual lista e conversa ficam lado a lado. */
const SPLIT_MIN_WIDTH = 768;

/**
 * Caixa de entrada de conversas. Em telas largas (web ou tablet), lista e
 * conversa lado a lado; em telas estreitas, a lista abre a conversa em tela
 * cheia (rota ChatThread).
 */
function ChatInbox() {
  const colors = useColors();
  const styles = createStyles(colors);
  const navigation = useNavigation<any>();
  const { width } = useBreakpoint();
  const isSplit = width >= SPLIT_MIN_WIDTH;
  const [selected, setSelected] = useState<Conversation | null>(null);

  const handleSelect = (room: Conversation) => {
    if (isSplit) {
      setSelected(room);
      return;
    }
    navigation.navigate('ChatThread', {
      roomId: room.room_id,
      correspondent: room.correspondent,
      serviceTitle: room.service_title,
      roomStatus: room.status,
    });
  };

  if (!isSplit) {
    return (
      <View style={styles.single}>
        <ChatRoomListPanel selectedRoomId={null} onSelectRoom={handleSelect} />
      </View>
    );
  }

  return (
    <View style={styles.split}>
      <View style={styles.listColumn}>
        <ChatRoomListPanel
          selectedRoomId={selected?.room_id ?? null}
          onSelectRoom={handleSelect}
        />
      </View>
      <View style={styles.threadColumn}>
        {selected ? (
          <ChatThreadPanel
            key={selected.room_id}
            roomId={selected.room_id}
            correspondent={selected.correspondent}
            roomStatus={selected.status}
            serviceTitle={selected.service_title}
          />
        ) : (
          <View style={styles.placeholder}>
            <FontAwesome
              name="comments-o"
              size={48}
              color={colors.textSecondary}
            />
            <Text style={styles.placeholderTitle}>Selecione uma conversa</Text>
            <Text style={styles.placeholderText}>
              As conversas são criadas quando um serviço é agendado e ficam
              abertas até o atendimento ser concluído.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    single: {
      flex: 1,
      minHeight: 400,
    },
    split: {
      flex: 1,
      flexDirection: 'row',
      minHeight: 520,
      borderRadius: 16,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.borderColor,
      backgroundColor: colors.cardBackground,
    },
    listColumn: {
      width: 340,
      borderRightWidth: 1,
      borderRightColor: colors.borderColor,
      minHeight: 0,
    },
    threadColumn: {
      flex: 1,
      minWidth: 0,
      minHeight: 0,
    },
    placeholder: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      padding: 40,
      backgroundColor: colors.secondaryGray,
    },
    placeholderTitle: {
      fontFamily: 'Afacad-Bold',
      fontSize: 20,
      color: colors.primaryBlack,
    },
    placeholderText: {
      fontFamily: 'Afacad-Regular',
      fontSize: 16,
      lineHeight: 22,
      textAlign: 'center',
      maxWidth: 360,
      color: colors.textSecondary,
    },
  });

export default ChatInbox;
