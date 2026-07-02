import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { useColors } from '@theme/ThemeProvider';
import { ChatWindow } from '@components/features/ChatBot/ChatWindow';
import { useNavigation } from '@react-navigation/native';

/**
 * Tela dedicada ao chatbot de agendamentos.
 * Usada na navegação quando o usuário acessa via rota direta
 * (ex: deep link ou tab bar em versão futura).
 * O ChatWidget (FAB flutuante) é alternativa para acesso inline nas telas.
 */
const ChatBotScreen: React.FC = () => {
  const colors = useColors();
  const navigation = useNavigation();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.backgroundElevated }]}>
      <ChatWindow onClose={() => navigation.goBack()} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ChatBotScreen;
