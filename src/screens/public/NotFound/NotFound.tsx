import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import { createStyles } from './styles';
import { useColors } from '@theme/ThemeProvider';

const NotFoundScreen = () => {
  const navigation = useNavigation();
  const colors = useColors();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <FontAwesome
        name="exclamation-triangle"
        size={80}
        color={colors.primaryWhite}
        style={styles.icon}
      />

      <Text style={styles.errorText}>Ops!</Text>

      <Text style={styles.descriptionText}>
        A página que você está procurando não está disponível ou não existe.
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Home' as never)}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Voltar para o início">
        <Text style={styles.buttonText}>Voltar para o início</Text>
      </TouchableOpacity>
    </View>
  );
};

export default NotFoundScreen;
