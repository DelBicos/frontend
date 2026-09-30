import React from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { FieldError } from 'react-hook-form';
import { createStyles } from './styles';
import { useColors } from '@theme/ThemeProvider';

interface CustomTextInputProps extends TextInputProps {
  label?: string;
  error?: FieldError | string | undefined;
  children?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
}

const CustomTextInput: React.FC<CustomTextInputProps> = ({
  label,
  error,
  children,
  containerStyle,
  style,
  ...rest
}) => {
  const colors = useColors();
  const styles = createStyles(colors);

  const errorMessage = typeof error === 'string' ? error : error?.message;
  const hasError = !!errorMessage;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View>
        {children ? (
          children
        ) : (
          <TextInput
            style={[styles.input, hasError && styles.inputError, style]}
            placeholderTextColor={colors.textTertiary}
            accessibilityLabel={label}
            {...rest}
          />
        )}
      </View>

      {hasError && <Text style={styles.errorText}>{errorMessage}</Text>}
    </View>
  );
};

export default CustomTextInput;
