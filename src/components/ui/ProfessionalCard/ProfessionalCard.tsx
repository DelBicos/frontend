import React, { useState, useMemo } from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import type { ListedProfessional } from '@stores/Professional/types';
import { useColors } from '@theme/ThemeProvider';
import { createStyles } from './styles';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';

interface ProfessionalCardProps {
  professional: ListedProfessional;
}

function ProfessionalCard({ professional }: ProfessionalCardProps) {
  const navigation = useNavigation();
  const colors = useColors();
  const styles = createStyles(colors);

  const [isHovered, setIsHovered] = useState(false);

  const colorProps = useMemo(() => {
    return {
      bgColor: isHovered ? colors.cardBackground : colors.cardBackground,
      borderColor: isHovered ? colors.primaryBlue : colors.borderColor,
      nameColor: colors.primaryOrange,
      textColor: colors.primaryBlack,
      subTextColor: colors.textSecondary,
      locationColor: colors.primaryBlue,
    };
  }, [isHovered, colors]);

  const navigateToProfile = () => {
    // @ts-ignore
    navigation.navigate('PartnerProfile', { id: professional.id });
  };

  const servicesText =
    professional.offeredServices?.slice(0, 2).join(', ') ||
    professional.category;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colorProps.bgColor,
          borderColor: colorProps.borderColor,
          transform: [{ scale: pressed || isHovered ? 1.01 : 1 }],
        },
      ]}
      onPress={navigateToProfile}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      accessibilityRole="button"
      accessibilityLabel={`Profissional ${professional.name}`}>
      <Image
        source={{
          uri: professional.imageUrl || 'https://via.placeholder.com/100',
        }}
        style={styles.image}
        resizeMode="cover"
      />

      <View style={styles.content}>
        <Text
          style={[styles.name, { color: colorProps.nameColor }]}
          numberOfLines={1}>
          {professional.name}
        </Text>

        <Text
          style={[styles.services, { color: colorProps.textColor }]}
          numberOfLines={2}>
          {servicesText}
        </Text>

        <View style={styles.ratingContainer}>
          <FontAwesome name="star" color="#FFC107" size={14} />
          <Text style={[styles.rating, { color: colorProps.textColor }]}>
            {professional.rating.toFixed(1)}
            <Text
              style={[styles.ratingCount, { color: colorProps.subTextColor }]}>
              {' '}
              ({professional.ratingsCount})
            </Text>
          </Text>
        </View>

        <View style={styles.footer}>
          <Text
            style={[styles.location, { color: colorProps.locationColor }]}
            numberOfLines={1}
            ellipsizeMode="tail">
            {professional.location}
          </Text>

          {professional.distance !== undefined &&
            professional.distance !== null && (
              <View style={styles.distanceBadge}>
                <FontAwesome
                  name="map-marker"
                  size={10}
                  color={colors.primaryWhite}
                />
                <Text style={styles.distanceText}>
                  {professional.distance.toFixed(2)} km
                </Text>
              </View>
            )}
        </View>
      </View>
    </Pressable>
  );
}

export default React.memo(ProfessionalCard);
