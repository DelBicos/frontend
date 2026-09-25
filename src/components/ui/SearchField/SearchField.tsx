import React from 'react';
import { Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useColors } from '@theme/ThemeProvider';
import { ColorsType } from '@theme/types';

interface SearchFieldProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  accessibilityLabel: string;
  onSubmit?: () => void;
}

/** Campo de busca em pilula com icone e botao de limpar. */
function SearchField({
  value,
  onChangeText,
  placeholder,
  accessibilityLabel,
  onSubmit,
}: SearchFieldProps) {
  const colors = useColors();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <FontAwesome name="search" size={18} color={colors.textSecondary} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        accessibilityLabel={accessibilityLabel}
        returnKeyType="search"
        onSubmitEditing={onSubmit}
        autoCorrect={false}
      />
      {value.length > 0 && (
        <Pressable
          onPress={() => onChangeText('')}
          style={styles.clear}
          accessibilityRole="button"
          accessibilityLabel="Limpar busca"
          hitSlop={8}>
          <FontAwesome
            name="times-circle"
            size={18}
            color={colors.textSecondary}
          />
        </Pressable>
      )}
    </View>
  );
}

const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      minHeight: 52,
      paddingHorizontal: 18,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.borderColor,
      backgroundColor: colors.cardBackground,
      width: '100%',
      maxWidth: 640,
      ...Platform.select({
        web: { boxShadow: '0px 2px 10px rgba(0,0,0,0.06)' } as any,
        android: { elevation: 2 },
      }),
    },
    input: {
      flex: 1,
      fontSize: 17,
      fontFamily: 'Afacad-Regular',
      color: colors.primaryBlack,
      paddingVertical: 12,
      ...Platform.select({ web: { outlineStyle: 'none' } as any }),
    },
    clear: {
      padding: 4,
      ...Platform.select({ web: { cursor: 'pointer' } as any }),
    },
  });

export default SearchField;
