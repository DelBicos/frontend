import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

  const closeChat = React.useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' as never }],
    });
  }, [navigation]);

  return (
    <SafeAreaView
      edges={['left', 'right']}
      style={[
        styles.container,
        { backgroundColor: colors.backgroundElevated },
      ]}>
      <ChatWindow onClose={closeChat} closeLabel="Fechar" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ChatBotScreen;
