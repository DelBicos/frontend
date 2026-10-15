import React from 'react';
import { View, Text } from 'react-native';
import { useColors } from '@theme/ThemeProvider';

export const TicketDetailScreen: React.FC = () => {
  const colors = useColors();
  return (
    <View
      style={{ flex: 1, padding: 16, backgroundColor: colors.primaryWhite }}>
      <Text style={{ color: colors.primaryBlack }}>
        Detalhes do chamado (em breve)
      </Text>
    </View>
  );
};

export default TicketDetailScreen;
