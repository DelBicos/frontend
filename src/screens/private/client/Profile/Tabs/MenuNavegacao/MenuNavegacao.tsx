import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { ClientProfileSubRoutes } from '@screens/types';
import { useColors } from '@theme/ThemeProvider';
import { useProfileMenu } from './useProfileMenu';
import { createStyles } from './styles';

/** Barra lateral do perfil no web (telas largas). */
const MenuNavegacao = () => {
  const route = useRoute();
  const colors = useColors();
  const styles = createStyles(colors);
  const { sections, open, signOut } = useProfileMenu();
  const current =
    (route.params as { subroute?: string } | undefined)?.subroute ||
    ClientProfileSubRoutes.DadosConta;

  return (
    <View style={styles.menuContainer} {...({ role: 'navigation' } as object)}>
      {sections.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          {section.items.map((item) => {
            const isActive = current === item.id;
            return (
              <Pressable
                key={item.id}
                onPress={() => open(item.id)}
                style={({ hovered }: any) => [
                  styles.menuItem,
                  hovered && !isActive && styles.menuItemHovered,
                  isActive && styles.activeMenuItem,
                ]}
                accessibilityRole="link"
                {...({
                  'aria-current': isActive ? 'page' : undefined,
                } as object)}>
                {isActive ? <View style={styles.activeIndicator} /> : null}
                <MaterialIcons
                  name={item.icon}
                  size={22}
                  color={colors.primaryBlack}
                  style={styles.menuIcon}
                />
                <Text
                  style={[styles.menuText, isActive && styles.activeMenuText]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ))}
      <Pressable
        onPress={signOut}
        style={({ hovered }: any) => [
          styles.menuItem,
          hovered && styles.menuItemHovered,
        ]}
        accessibilityRole="button">
        <MaterialIcons
          name="logout"
          size={22}
          color={colors.errorText}
          style={styles.menuIcon}
        />
        <Text style={[styles.menuText, { color: colors.errorText }]}>
          Sair da conta
        </Text>
      </Pressable>
    </View>
  );
};

export default MenuNavegacao;
