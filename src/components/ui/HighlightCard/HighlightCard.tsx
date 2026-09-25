import React from 'react';
import {
  Text,
  ImageBackground,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '@theme/ThemeProvider';
import { createStyles } from './styles';

export interface HighlightItem {
  id: string;
  title: string;
  description: string;
  image: string;
  link?: () => void;
}

interface HighlightCardProps {
  item: HighlightItem;
}

const HighlightCardComponent: React.FC<HighlightCardProps> = ({ item }) => {
  const colors = useColors();
  const styles = createStyles(colors);
  const { width } = useWindowDimensions();

  const handlePress = () => {
    if (item.link) {
      item.link();
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.9}
      style={[styles.card, { width: width }]}
      accessibilityRole="button"
      accessibilityLabel={`${item.title}, ${item.description}`}>
      <ImageBackground
        source={{ uri: item.image }}
        style={styles.image}
        imageStyle={styles.imageStyle}
        resizeMode="cover">
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.9)']}
          locations={[0, 0.6, 1]}
          style={styles.gradient}>
          <View style={styles.textContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.description} numberOfLines={2}>
              {item.description}
            </Text>
          </View>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );
};

export const HighlightCard = React.memo(HighlightCardComponent);
HighlightCard.displayName = 'HighlightCard';
