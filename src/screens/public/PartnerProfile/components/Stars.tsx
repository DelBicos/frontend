import React from 'react';
import { View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

interface StarsProps {
  value: number;
  size?: number;
  color?: string;
}

/** Estrelas de 0 a 5 (com meia estrela). Decorativas: o texto ao lado diz a nota. */
function Stars({ value, size = 16, color = '#F5A524' }: StarsProps) {
  return (
    <View
      style={{ flexDirection: 'row', gap: 2 }}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants">
      {[1, 2, 3, 4, 5].map((n) => {
        const name =
          value >= n ? 'star' : value >= n - 0.5 ? 'star-half-o' : 'star-o';
        return <FontAwesome key={n} name={name} size={size} color={color} />;
      })}
    </View>
  );
}

export default Stars;
