import React, { useMemo } from 'react';
import { View } from 'react-native';
import CustomTextInput from '@components/ui/CustomTextInput';
import { createStyles } from './styles';
import { useColors } from '@theme/ThemeProvider';

interface PhoneInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  error?: string | boolean;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
}

const maskPhone = (value: string | undefined) => {
  if (!value) return '';
  let r = value.replace(/\D/g, '');
  r = r.replace(/^0/, '');

  if (r.length > 10) {
    r = r.replace(/^(\d\d)(\d{5})(\d{4}).*/, '($1) $2-$3');
  } else if (r.length > 5) {
    r = r.replace(/^(\d\d)(\d{4})(\d{0,4}).*/, '($1) $2-$3');
  } else if (r.length > 2) {
    r = r.replace(/^(\d\d)(\d{0,5})/, '($1) $2');
  } else if (r.trim() !== '') {
    r = r.replace(/^(\d*)/, '($1');
  }
  return r;
};

const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChangeText,
  onBlur,
  error,
  label = 'Telefone',
  placeholder = '(00) 00000-0000',
  disabled = false,
}) => {
  const colors = useColors();
  const styles = createStyles(colors);

  const handleChangeText = (text: string) => {
    const cleanText = text.replace(/\D/g, '');
    onChangeText(cleanText);
  };

  const displayValue = useMemo(() => maskPhone(value), [value]);

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
        maxLength={15}
        editable={!disabled}
      />
    </View>
  );
};

export default PhoneInput;
