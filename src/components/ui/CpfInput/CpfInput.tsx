import React, { useMemo } from 'react';
import { View } from 'react-native';
import CustomTextInput from '@components/ui/CustomTextInput';
import { createStyles } from './styles';
import { useColors } from '@theme/ThemeProvider';

interface CpfInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  error?: string | boolean;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
}

export const maskCpf = (value: string | undefined) => {
  if (!value) return '';

  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
};

const CpfInput: React.FC<CpfInputProps> = ({
  value,
  onChangeText,
  onBlur,
  error,
  label = 'CPF',
  placeholder = '000.000.000-00',
  disabled = false,
}) => {
  const colors = useColors();
  const styles = createStyles(colors);

  const displayValue = useMemo(() => maskCpf(value), [value]);

  const handleChange = (text: string) => {
    const cleanValue = text.replace(/\D/g, '');
    onChangeText(cleanValue);
  };

  return (
    <View style={styles.container}>
      <CustomTextInput
        label={label}
        placeholder={placeholder}
        value={displayValue}
        onChangeText={handleChange}
        onBlur={onBlur}
        error={error as any}
        keyboardType="numeric"
        maxLength={14}
        editable={!disabled}
      />
    </View>
  );
};

export default CpfInput;
