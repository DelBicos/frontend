import React, { useCallback, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from 'react-native';
import { createStyles } from './styles';
import { useColors } from '@theme/ThemeProvider';

interface CodeInputProps {
  verificationCode: string[];
  setVerificationCode: React.Dispatch<React.SetStateAction<string[]>>;
  focusedIndex: number;
  setFocusedIndex: (index: number) => void;
  length?: number;
}

const CodeInput: React.FC<CodeInputProps> = ({
  verificationCode,
  setVerificationCode,
  focusedIndex,
  setFocusedIndex,
  length = 4,
}) => {
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const colors = useColors();
  const styles = createStyles(colors);

  const handleChange = (text: string, index: number) => {
    const newCode = [...verificationCode];

    if (text.length > 1) {
      const pastedCode = text.slice(0, length).split('');
      for (let i = 0; i < length; i++) {
        if (pastedCode[i]) newCode[i] = pastedCode[i];
      }
      setVerificationCode(newCode);
      setFocusedIndex(length - 1);
      return;
    }

    newCode[index] = text;
    setVerificationCode(newCode);

    if (text && index < length - 1) {
      setFocusedIndex(index + 1);
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number,
  ) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (!verificationCode[index] && index > 0) {
        setFocusedIndex(index - 1);
      }
    }
  };

  const indexValid = useCallback((i: number) => i >= 0 && i < length, [length]);

  useEffect(() => {
    if (indexValid(focusedIndex)) {
      inputRefs.current[focusedIndex]?.focus();
    }
  }, [focusedIndex, indexValid]);

  return (
    <View style={styles.codeContainer}>
      {Array.from({ length }).map((_, index) => (
        <TextInput
          key={index}
          ref={(ref) => {
            inputRefs.current[index] = ref;
          }}
          style={[
            styles.codeInput,
            focusedIndex === index && styles.codeInputFocused,
            !!verificationCode[index] && styles.codeInputFilled,
          ]}
          value={verificationCode[index] || ''}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          onFocus={() => setFocusedIndex(index)}
          keyboardType="number-pad"
          maxLength={length}
          selectTextOnFocus={true}
          cursorColor={colors.primaryOrange}
          testID={`code-input-${index}`}
          accessibilityLabel={`Dígito ${index + 1} de ${length}`}
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          textContentType={index === 0 ? 'oneTimeCode' : 'none'}
        />
      ))}
    </View>
  );
};

export default CodeInput;
