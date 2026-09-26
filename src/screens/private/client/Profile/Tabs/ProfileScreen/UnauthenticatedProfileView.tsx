import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useColors } from '@theme/ThemeProvider';
import { ColorsType } from '@theme/types';
import { useBreakpoint } from '@lib/hooks/useBreakpoint';
import { ProfileExtras } from '../ProfileWrapper/ProfileMobileHome';

/** Aba Perfil sem login: convite para entrar + tema e ajuda. */
export const UnauthenticatedProfileView: React.FC = () => {
  const colors = useColors();
  const styles = createStyles(colors);
  const navigation = useNavigation<any>();
  const { gutter } = useBreakpoint();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingHorizontal: gutter }]}
      showsVerticalScrollIndicator={false}>
      <View style={styles.inner}>
        <Text
          style={styles.title}
          accessibilityRole="header"
          {...({ 'aria-level': 1 } as object)}>
          Perfil
        </Text>

        <View style={styles.card}>
          <View style={styles.cardIcon}>
            <MaterialIcons name="person-outline" size={32} color="#000000" />
          </View>
          <Text style={styles.cardTitle}>Entre na sua conta</Text>
          <Text style={styles.cardText}>
            Para agendar serviços, conversar com profissionais e acompanhar seus
            pedidos.
          </Text>
          <Pressable
            onPress={() => navigation.navigate('Login')}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && { opacity: 0.85 },
            ]}
            accessibilityRole="button">
            <Text style={styles.primaryButtonText}>Entrar</Text>
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate('Register')}
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && { opacity: 0.7 },
            ]}
            accessibilityRole="button">
            <Text style={styles.secondaryButtonText}>Criar conta</Text>
          </Pressable>
        </View>

        <ProfileExtras />
      </View>
    </ScrollView>
  );
};

const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.secondaryGray,
    },
    content: {
      paddingTop: 20,
      paddingBottom: 40,
    },
    inner: {
      width: '100%',
      maxWidth: 640,
      alignSelf: 'center',
    },
    title: {
      marginBottom: 16,
      fontFamily: 'Afacad-Bold',
      fontSize: 30,
      lineHeight: 36,
      color: colors.primaryBlack,
    },
    card: {
      alignItems: 'stretch',
      gap: 10,
      padding: 20,
      marginBottom: 24,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.borderColor,
      backgroundColor: colors.cardBackground,
    },
    cardIcon: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignSelf: 'center',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primaryOrange,
    },
    cardTitle: {
      fontFamily: 'Afacad-Bold',
      fontSize: 22,
      textAlign: 'center',
      color: colors.primaryBlack,
    },
    cardText: {
      marginBottom: 6,
      fontFamily: 'Afacad-Regular',
      fontSize: 16,
      lineHeight: 22,
      textAlign: 'center',
      color: colors.textSecondary,
    },
    primaryButton: {
      minHeight: 50,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primaryOrange,
    },
    primaryButtonText: {
      fontFamily: 'Afacad-Bold',
      fontSize: 18,
      color: '#000000',
    },
    secondaryButton: {
      minHeight: 50,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.primaryBlack,
      alignItems: 'center',
      justifyContent: 'center',
    },
    secondaryButtonText: {
      fontFamily: 'Afacad-Bold',
      fontSize: 18,
      color: colors.primaryBlack,
    },
  });
