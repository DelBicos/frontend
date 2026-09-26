import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useColors } from '@theme/ThemeProvider';
import { ColorsType } from '@theme/types';
import { ClientProfileSubRoutes } from '@screens/types';
import Avatar from '@components/ui/Avatar';
import { ThemeToggle } from '@components/ui/ThemeToggle';
import { SettingsRow, SettingsSection } from '@components/ui/SettingsList';
import { useProfileMenu } from '../MenuNavegacao/useProfileMenu';

/** Preferencias e ajuda: iguais para quem esta ou nao logado. */
export function ProfileExtras() {
  const navigation = useNavigation<any>();
  return (
    <>
      <SettingsSection title="Preferências">
        <SettingsRow icon="palette" label="Tema" below={<ThemeToggle fill />} />
      </SettingsSection>
      <SettingsSection title="Ajuda">
        <SettingsRow
          icon="help-outline"
          label="Central de ajuda"
          onPress={() => navigation.navigate('Help')}
          accessibilityRole="link"
        />
        <SettingsRow
          icon="info-outline"
          label="Quem somos"
          onPress={() => navigation.navigate('AboutUs')}
          accessibilityRole="link"
        />
      </SettingsSection>
    </>
  );
}

interface ProfileMobileHomeProps {
  name: string;
  email?: string;
  avatarUri?: string | null;
}

/** Aba Perfil no celular: quem e voce + opcoes agrupadas. */
function ProfileMobileHome({ name, email, avatarUri }: ProfileMobileHomeProps) {
  const colors = useColors();
  const styles = createStyles(colors);
  const { sections, open, signOut, user } = useProfileMenu();

  return (
    <>
      <Text
        style={styles.title}
        accessibilityRole="header"
        {...({ 'aria-level': 1 } as object)}>
        Perfil
      </Text>

      <Pressable
        onPress={() => open(ClientProfileSubRoutes.DadosConta)}
        style={({ pressed }) => [styles.identity, pressed && { opacity: 0.85 }]}
        accessibilityRole="button"
        accessibilityLabel={`${name}. Ver e editar dados da conta`}>
        <Avatar uri={avatarUri} name={name} size={64} />
        <View style={styles.identityTexts}>
          <Text style={styles.name} numberOfLines={2}>
            {name}
          </Text>
          {email ? (
            <Text style={styles.email} numberOfLines={1}>
              {email}
            </Text>
          ) : null}
          {user?.professional_id ? (
            <View style={styles.badge}>
              <MaterialIcons name="work" size={13} color="#000000" />
              <Text style={styles.badgeText}>Colaborador</Text>
            </View>
          ) : null}
        </View>
        <MaterialIcons
          name="chevron-right"
          size={24}
          color={colors.textSecondary}
        />
      </Pressable>

      {sections.map((section) => (
        <SettingsSection key={section.title} title={section.title}>
          {section.items.map((item) => (
            <SettingsRow
              key={item.id}
              icon={item.icon}
              label={item.label}
              hint={item.hint}
              onPress={() => open(item.id)}
            />
          ))}
        </SettingsSection>
      ))}

      <ProfileExtras />

      <SettingsSection>
        <SettingsRow
          icon="logout"
          label="Sair da conta"
          onPress={signOut}
          danger
        />
      </SettingsSection>
    </>
  );
}

const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    title: {
      marginBottom: 16,
      fontFamily: 'Afacad-Bold',
      fontSize: 30,
      lineHeight: 36,
      color: colors.primaryBlack,
    },
    identity: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      padding: 16,
      marginBottom: 24,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.borderColor,
      backgroundColor: colors.cardBackground,
    },
    identityTexts: {
      flex: 1,
      minWidth: 0,
      gap: 2,
    },
    name: {
      fontFamily: 'Afacad-Bold',
      fontSize: 20,
      lineHeight: 24,
      color: colors.primaryBlack,
    },
    email: {
      fontFamily: 'Afacad-Regular',
      fontSize: 15,
      color: colors.textSecondary,
    },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      gap: 4,
      marginTop: 4,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 999,
      backgroundColor: colors.primaryOrange,
    },
    badgeText: {
      fontFamily: 'Afacad-SemiBold',
      fontSize: 13,
      color: '#000000',
    },
  });

export default ProfileMobileHome;
