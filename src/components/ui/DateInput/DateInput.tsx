import React, { useMemo } from 'react';
import { View } from 'react-native';
import CustomTextInput from '@components/ui/CustomTextInput';
import { createStyles } from './styles';
import { useColors } from '@theme/ThemeProvider';

interface DateInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  error?: string | boolean;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
}

const maskDate = (value: string) => {
  if (!value) return '';
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\d{4})\d+?$/, '$1');
};

const DateInput: React.FC<DateInputProps> = ({
  value,
  onChangeText,
  onBlur,
  error,
  label = 'Data',
  placeholder = 'DD/MM/AAAA',
  disabled = false,
}) => {
  const colors = useColors();
  const styles = createStyles(colors);

  const handleChangeText = (text: string) => {
    const formatted = maskDate(text);
    onChangeText(formatted);
  };

  const displayValue = useMemo(() => maskDate(value || ''), [value]);

  return (
    <View style={styles.container}>
      <CustomTextInput
        label={label}
        placeholder={placeholder}
        value={displayValue}
        onChangeText={handleChangeText}
        onBlur={onBlur}
        error={error as any}
        keyboardType="number-pad"
        maxLength={10}
        editable={!disabled}
      />
    </View>
  );
};

export default DateInput;
