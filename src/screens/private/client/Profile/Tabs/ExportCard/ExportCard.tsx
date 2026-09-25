import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '@theme/ThemeProvider';
import { createStyles } from './styles';

interface ExportCardProps {
  title: string;
  description: string;
  icon: 'file-excel-o' | 'file-text-o';
  onPress: () => void;
  isLoading?: boolean;
}

export const ExportCard: React.FC<ExportCardProps> = ({
  title,
  description,
  icon,
  onPress,
  isLoading = false,
}) => {
  const colors = useColors();
  const styles = createStyles(colors);

  const themeProps = useMemo(() => {
    if (icon === 'file-excel-o') {
      return {
        bg: colors.successBackground || '#E8F5E9',
        iconColor: colors.successText || '#2E7D32',
      };
    }
    return {
      bg: colors.badgeBackground || '#E3F2FD',
      iconColor: colors.primaryBlue,
    };
  }, [icon, colors]);

  return (
    <TouchableOpacity
      style={[styles.card, isLoading && styles.cardDisabled]}
      onPress={onPress}
      disabled={isLoading}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Exportar ${title}`}
      accessibilityState={{ busy: isLoading }}>
      <View style={[styles.iconContainer, { backgroundColor: themeProps.bg }]}>
        <FontAwesome name={icon} size={24} color={themeProps.iconColor} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.desc} numberOfLines={2}>
          {description}
        </Text>
      </View>

      <View style={styles.actionIcon}>
        {isLoading ? (
          <ActivityIndicator size="small" color={colors.primaryOrange} />
        ) : (
          <MaterialCommunityIcons
            name="download"
            size={24}
            color={colors.textSecondary}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};
