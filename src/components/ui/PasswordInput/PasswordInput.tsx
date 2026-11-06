import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  TextInput,
  TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createStyles } from './styles';
import { useColors } from '@theme/ThemeProvider';

interface PasswordInputProps extends TextInputProps {
  error?: boolean | string;
}

const PasswordInput = React.forwardRef<TextInput, PasswordInputProps>(
  ({ error, ...props }, ref) => {
    const [visible, setVisible] = useState(false);
    const colors = useColors();
    const styles = createStyles(colors);

    const hasError = !!error;

    return (
      <View style={[styles.container, hasError && styles.inputError]}>
        <TextInput
          ref={ref}
          style={styles.input}
          secureTextEntry={!visible}
          placeholderTextColor={colors.textTertiary}
          accessibilityLabel="Campo de senha"
          {...props}
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => setVisible(!visible)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={visible ? 'Ocultar senha' : 'Exibir senha'}>
          <Ionicons
            name={visible ? 'eye-off' : 'eye'}
            size={24}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      </View>
    );
  },
);

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;
