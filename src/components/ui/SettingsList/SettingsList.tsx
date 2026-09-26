import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useColors } from '@theme/ThemeProvider';
import { ColorsType } from '@theme/types';

type IconName = React.ComponentProps<typeof MaterialIcons>['name'];

/** Grupo de opcoes com titulo (lista de configuracoes do app). */
export function SettingsSection({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  const colors = useColors();
  const styles = createStyles(colors);
  const rows = React.Children.toArray(children).filter(Boolean);
  return (
    <View style={styles.section}>
      {title ? (
        <Text
          style={styles.sectionTitle}
          accessibilityRole="header"
          {...({ 'aria-level': 2 } as object)}>
          {title}
        </Text>
      ) : null}
      <View style={styles.card}>
        {rows.map((row, i) => (
          <View key={i}>
            {i > 0 ? <View style={styles.divider} /> : null}
            {row}
          </View>
        ))}
      </View>
    </View>
  );
}

interface SettingsRowProps {
  icon: IconName;
  label: string;
  hint?: string;
  onPress?: () => void;
  danger?: boolean;
  /** Conteudo a direita no lugar da seta (ex.: seletor). */
  right?: React.ReactNode;
  /** Conteudo abaixo do rotulo, na largura toda (ex.: seletor de tema). */
  below?: React.ReactNode;
  accessibilityRole?: 'button' | 'link';
}

/** Linha de opcao: icone, rotulo, apoio e seta. */
export function SettingsRow({
  icon,
  label,
  hint,
  onPress,
  danger,
  right,
  below,
  accessibilityRole = 'button',
}: SettingsRowProps) {
  const colors = useColors();
  const styles = createStyles(colors);
  const color = danger ? colors.errorText : colors.primaryBlack;

  const content = (
    <>
      <View style={styles.rowMain}>
        <View style={[styles.iconBox, danger && styles.iconBoxDanger]}>
          <MaterialIcons name={icon} size={20} color={color} />
        </View>
        <View style={styles.texts}>
          <Text style={[styles.label, { color }]}>{label}</Text>
          {hint ? <Text style={styles.hint}>{hint}</Text> : null}
        </View>
        {right ??
          (onPress && !danger ? (
            <MaterialIcons
              name="chevron-right"
              size={22}
              color={colors.textSecondary}
            />
          ) : null)}
      </View>
      {below ? <View style={styles.below}>{below}</View> : null}
    </>
  );

  if (!onPress) return <View style={styles.row}>{content}</View>;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed, hovered }: any) => [
        styles.row,
        (pressed || hovered) && styles.rowPressed,
      ]}
      accessibilityRole={accessibilityRole}
      accessibilityHint={hint}>
      {content}
    </Pressable>
  );
}

const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      marginBottom: 8,
      marginLeft: 4,
      fontFamily: 'Afacad-SemiBold',
      fontSize: 14,
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      color: colors.textSecondary,
    },
    card: {
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.borderColor,
      backgroundColor: colors.cardBackground,
      overflow: 'hidden',
    },
    divider: {
      height: 1,
      marginLeft: 64,
      backgroundColor: colors.divider,
    },
    row: {
      minHeight: 56,
      paddingVertical: 10,
      paddingHorizontal: 14,
      justifyContent: 'center',
      ...Platform.select({ web: { cursor: 'pointer' } as object }),
    },
    rowPressed: {
      backgroundColor: colors.inputBackground,
    },
    rowMain: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
    },
    iconBox: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.inputBackground,
    },
    iconBoxDanger: {
      backgroundColor: colors.errorBackground,
    },
    texts: {
      flex: 1,
      minWidth: 0,
    },
    label: {
      fontFamily: 'Afacad-SemiBold',
      fontSize: 17,
    },
    hint: {
      fontFamily: 'Afacad-Regular',
      fontSize: 14,
      color: colors.textSecondary,
    },
    below: {
      marginTop: 12,
    },
  });
