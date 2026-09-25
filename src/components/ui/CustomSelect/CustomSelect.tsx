import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  Platform,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useColors } from '@theme/ThemeProvider';
import { createStyles } from './styles';

export interface Option {
  label: string;
  value: string;
}

interface CustomSelectProps {
  label?: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  placeholder?: string;
  error?: any;
  loading?: boolean;
  disabled?: boolean;

  containerStyle?: StyleProp<ViewStyle>;
  buttonStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  placeholderStyle?: StyleProp<TextStyle>;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  label,
  value,
  options,
  onChange,
  placeholder = 'Selecione...',
  error,
  loading = false,
  disabled = false,
  containerStyle,
  buttonStyle,
  textStyle,
  placeholderStyle,
}) => {
  const colors = useColors();
  const styles = createStyles(colors);
  const [modalVisible, setModalVisible] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayLabel = selectedOption ? selectedOption.label : placeholder;
  const isPlaceholder = !selectedOption;

  const renderWebSelect = () => {
    if (Platform.OS !== 'web') return null;

    return (
      <select
        style={styles.webSelect as any}
        value={value}
        disabled={disabled || loading}
        onChange={(e) => onChange(e.target.value)}>
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity
        style={[
          styles.selectButton,
          !!error && styles.errorBorder,
          disabled && { opacity: 0.6, backgroundColor: colors.secondaryBeige },
          buttonStyle,
        ]}
        onPress={() => !disabled && !loading && setModalVisible(true)}
        activeOpacity={0.7}
        disabled={disabled || Platform.OS === 'web'}>
        {loading ? (
          <ActivityIndicator size="small" color={colors.primaryOrange} />
        ) : (
          <>
            <Text
              style={[
                styles.selectButtonText,
                textStyle,
                isPlaceholder && [styles.placeholderText, placeholderStyle],
              ]}
              numberOfLines={1}>
              {displayLabel}
            </Text>

            <FontAwesome
              name="chevron-down"
              size={12}
              color={isPlaceholder ? colors.textTertiary : colors.primaryBlack}
            />
          </>
        )}

        {renderWebSelect()}
      </TouchableOpacity>

      {/* Exibição de Erro */}
      {!!error && (
        <Text style={styles.errorText}>
          {typeof error === 'string'
            ? error
            : error.message || 'Campo inválido'}
        </Text>
      )}

      {/* Modal Nativo (iOS/Android) */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{label || placeholder}</Text>

            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.optionItem}
                  onPress={() => {
                    onChange(item.value);
                    setModalVisible(false);
                  }}>
                  <Text
                    style={[
                      styles.optionText,
                      item.value === value && {
                        fontFamily: 'Afacad-Bold',
                        color: colors.primaryOrange,
                      },
                    ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CustomSelect;
