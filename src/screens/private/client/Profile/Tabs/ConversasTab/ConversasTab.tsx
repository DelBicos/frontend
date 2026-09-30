import React from 'react';
import { View } from 'react-native';
import ChatInbox from '@screens/private/chat/components/ChatInbox';

/** Aba "Conversas" do perfil: a mesma caixa de entrada da rota /chats. */
const ConversasTab: React.FC = () => (
  <View style={{ flex: 1, minHeight: 560 }}>
    <ChatInbox />
  </View>
);

export default ConversasTab;
