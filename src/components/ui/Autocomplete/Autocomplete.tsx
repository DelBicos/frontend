import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Keyboard,
  Platform,
} from 'react-native';
import CustomTextInput from '@components/ui/CustomTextInput';
import { useColors } from '@theme/ThemeProvider';
import { createStyles } from './styles';

export interface Option {
  label: string;
  value: string;
}

interface AutocompleteProps {
  label: string;
  data: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: any;
  disabled?: boolean;
  loading?: boolean;
}

const Autocomplete: React.FC<AutocompleteProps> = ({
  label,
  data,
  value,
  onChange,
  placeholder = 'Digite para buscar...',
  error,
  disabled = false,
  loading = false,
}) => {
  const colors = useColors();
  const styles = createStyles(colors);

  const [query, setQuery] = useState(value || '');
  const [showList, setShowList] = useState(false);

  useEffect(() => {
    if (value !== query) {
      setQuery(value || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const filteredData = useMemo(() => {
    if (!query) return data;
    const lowerQuery = query.toLowerCase();
    return data.filter((item) => item.label.toLowerCase().includes(lowerQuery));
  }, [data, query]);

  const handleSelect = (item: Option) => {
    setQuery(item.label);
    onChange(item.value);
    setShowList(false);
    Keyboard.dismiss();
  };

  const handleFocus = () => {
    if (!disabled) setShowList(true);
  };

  const handleChangeText = (text: string) => {
    setQuery(text);
    onChange('');
    setShowList(true);
  };

  return (
    <View style={[styles.container, Platform.OS === 'web' && { zIndex: 100 }]}>
      <View style={styles.inputContainer}>
        <CustomTextInput
          label={label}
          value={query}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          placeholder={placeholder}
          error={error}
          editable={!disabled}
        />
      </View>

      {/* Overlay invisível para fechar ao clicar fora (Web) */}
      {showList && Platform.OS === 'web' && (
        <TouchableOpacity
          style={styles.webOverlay}
          onPress={() => setShowList(false)}
          activeOpacity={1}
        />
      )}

      {showList && !disabled && (
        <View style={styles.dropdown}>
          {loading ? (
            <Text style={styles.emptyText}>Carregando...</Text>
          ) : filteredData.length > 0 ? (
            <FlatList
              data={filteredData}
              keyExtractor={(item) => item.value}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled={true}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.item}
                  onPress={() => handleSelect(item)}
                  activeOpacity={0.7}>
                  <Text style={styles.itemText}>{item.label}</Text>
                </TouchableOpacity>
              )}
              style={{ maxHeight: 200 }}
            />
          ) : (
            <Text style={styles.emptyText}>Nenhuma opção encontrada</Text>
          )}
        </View>
      )}
    </View>
  );
};

export default Autocomplete;
