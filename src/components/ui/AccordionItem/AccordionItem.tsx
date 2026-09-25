import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { createStyles } from './styles';
import { FontAwesome } from '@expo/vector-icons';
import { useColors } from '@theme/ThemeProvider';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type AccordionItemProps = {
  title: string;
  children: React.ReactNode;
};

const AccordionItem: React.FC<AccordionItemProps> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const colors = useColors();
  const styles = createStyles(colors);

  const toggleOpen = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen(!isOpen);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={toggleOpen}
        style={styles.header}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen }}>
        <Text style={styles.title}>{title}</Text>
        <FontAwesome
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={colors.primaryOrange}
          style={styles.icon}
        />
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.body}>
          {typeof children === 'string' ? (
            <Text style={styles.bodyText}>{children}</Text>
          ) : (
            children
          )}
        </View>
      )}
    </View>
  );
};

export default AccordionItem;
