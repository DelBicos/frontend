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
  /** Comeca aberto (ex.: resultado de busca). */
  defaultOpen?: boolean;
};

const AccordionItem: React.FC<AccordionItemProps> = ({
  title,
  children,
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
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
        accessibilityLabel={title}
        accessibilityState={{ expanded: isOpen }}>
        <Text style={styles.title}>{title}</Text>
        <FontAwesome
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={16}
          // Cor do texto: o laranja nao tem contraste suficiente no fundo claro.
          color={colors.primaryBlack}
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
