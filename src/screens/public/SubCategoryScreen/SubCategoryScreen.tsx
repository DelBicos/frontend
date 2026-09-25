import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  Pressable,
  ActivityIndicator,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { createStyles } from './styles';
import { useSubCategoryStore } from '@stores/SubCategory';
import { SubCategory } from '@stores/SubCategory/types';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { useColors } from '@theme/ThemeProvider';
import { useThemeStore, ThemeMode } from '@stores/Theme';
import { FontAwesome5 } from '@expo/vector-icons';

import { getIconForSubCategory } from '@utils/icons';

type SubCategoryRouteParams = {
  categoryId: number;
  categoryTitle: string;
  serviceId?: number;
  singleSubCategory?: { id: number; title: string };
};

LocaleConfig.locales['pt-br'] = {
  monthNames: [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ],
  monthNamesShort: [
    'Jan.',
    'Fev.',
    'Mar.',
    'Abr.',
    'Mai.',
    'Jun.',
    'Jul.',
    'Ago.',
    'Set.',
    'Out.',
    'Nov.',
    'Dez.',
  ],
  dayNames: [
    'Domingo',
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado',
  ],
  dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
  today: 'Hoje',
} as any;
LocaleConfig.defaultLocale = 'pt-br';

const SubCategoryButton: React.FC<{
  item: SubCategory;
  onPress: () => void;
  isActive: boolean;
}> = ({ item, onPress, isActive }) => {
  const { theme } = useThemeStore();
  const isHighContrast = theme === ThemeMode.LIGHT_HI_CONTRAST;
  const isDark = theme === ThemeMode.DARK;
  const [isHovered, setIsHovered] = useState(false);
  const colors = useColors();
  const styles = createStyles(colors, isDark, isHighContrast);

  const styleProps = useMemo(() => {
    let bg = colors.cardBackground;
    let border = colors.borderColor;
    let text = colors.primaryOrange;

    if (isActive) {
      bg = colors.primaryBlue;
      border = colors.primaryBlue;
      text = colors.primaryWhite;
    } else if (isHovered) {
      bg = colors.backgroundElevated;
      border = colors.primaryOrange;
    }

    if (isHighContrast) {
      border = colors.primaryBlack;
      if (isActive) {
        bg = colors.primaryBlack;
        text = colors.primaryWhite;
      }
    }

    return { bg, border, text };
  }, [isActive, isHovered, isHighContrast, colors]);

  return (
    <Pressable
      style={[
        styles.subCategoryButton,
        {
          backgroundColor: styleProps.bg,
          borderColor: styleProps.border,
          borderWidth: isHighContrast ? 2 : 1,
        },
      ]}
      onPress={onPress}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}>
      <FontAwesome5
        name={getIconForSubCategory(item.title)}
        size={20}
        color={styleProps.text}
        style={styles.subCategoryIcon as any}
      />
      <Text style={[styles.subCategoryText, { color: styleProps.text }]}>
        {item.title}
      </Text>
    </Pressable>
  );
};

function SubCategoryScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { categoryId, categoryTitle, serviceId, singleSubCategory } =
    route.params as SubCategoryRouteParams;
  const { width } = useWindowDimensions();
  const { theme } = useThemeStore();

  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubCategory, setSelectedSubCategory] = useState<number | null>(
    serviceId || (singleSubCategory ? singleSubCategory.id : null),
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isButtonHovered, setIsButtonHovered] = useState(false);

  const { subCategories, fetchSubCategoriesByCategoryId } =
    useSubCategoryStore();
  const colors = useColors();
  const isDark = theme === ThemeMode.DARK;
  const isHighContrast = theme === ThemeMode.LIGHT_HI_CONTRAST;
  const styles = createStyles(colors, isDark, isHighContrast);

  useEffect(() => {
    if (singleSubCategory) {
      setIsLoading(false);
      return;
    }
    if (!categoryId) {
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    const loadSubCategories = async () => {
      setIsLoading(true);
      await fetchSubCategoriesByCategoryId(categoryId);
      if (!cancelled) setIsLoading(false);
    };
    loadSubCategories();
    return () => {
      cancelled = true;
    };
  }, [categoryId, fetchSubCategoriesByCategoryId, singleSubCategory]);

  const subCategoriesToDisplay = singleSubCategory
    ? [singleSubCategory]
    : subCategories;

  const handleContinue = () => {
    if (!selectedSubCategory || !selectedDate) {
      Alert.alert('Atenção', 'Por favor, selecione um serviço e uma data.');
      return;
    }
    // @ts-ignore
    navigation.navigate('SearchResult', {
      subCategoryId: selectedSubCategory,
      date: selectedDate,
    });
  };

  const markedDates = useMemo(
    () => ({
      [selectedDate || '']: {
        selected: true,
        disableTouchEvent: true,
      },
    }),
    [selectedDate],
  );

  const numColumns = width > 768 ? 2 : 1;
  const isButtonDisabled = !selectedSubCategory || !selectedDate;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}>
      <View style={styles.mainContent}>
        <View style={styles.leftColumn}>
          <Text style={styles.pageTitle}>{categoryTitle || 'Serviços'}</Text>

          {isLoading ? (
            <ActivityIndicator size="large" color={colors.primaryBlue} />
          ) : (
            <FlatList
              data={subCategoriesToDisplay}
              keyExtractor={(item) => item.id.toString()}
              numColumns={numColumns}
              key={`grid-${numColumns}`}
              scrollEnabled={false}
              contentContainerStyle={styles.subCategoryListContainer}
              renderItem={({ item }) => (
                <SubCategoryButton
                  item={item as SubCategory}
                  isActive={selectedSubCategory === item.id}
                  onPress={() => setSelectedSubCategory(item.id)}
                />
              )}
            />
          )}
        </View>

        <View style={styles.rightColumn}>
          <Text style={styles.pageTitle}>Qual Data?</Text>

          <View style={styles.calendarContainer}>
            <Calendar
              key={isDark ? 'dark-cal' : 'light-cal'}
              theme={{
                // --- FUNDO ---
                calendarBackground: 'transparent',

                // --- TEXTOS ---
                textDayFontFamily: 'Afacad-Regular',
                textMonthFontFamily: 'Afacad-Bold',
                textDayHeaderFontFamily: 'Afacad-SemiBold',

                monthTextColor: '#ffffff',
                textSectionTitleColor: '#ffffff',
                dayTextColor: '#ffffff',
                textDisabledColor: 'rgba(255, 255, 255, 0.4)',

                // --- SETAS ---
                arrowColor: '#ffffff',
                disabledArrowColor: 'rgba(255, 255, 255, 0.4)',

                // --- HOJE ---
                // Como sempre exige 12h de antecedência, "hoje" sempre estará desabilitado.
                todayTextColor: 'rgba(255, 255, 255, 0.4)',
                todayDotColor: 'rgba(255, 255, 255, 0.4)',

                // --- SELEÇÃO ---
                selectedDayBackgroundColor: '#ffffff',
                selectedDayTextColor: colors.primaryOrange,
              }}
              onDayPress={(day) => setSelectedDate(day.dateString)}
              markedDates={markedDates}
              minDate={(() => {
                const minTime = new Date(Date.now() + 12 * 60 * 60 * 1000);
                const y = minTime.getFullYear();
                const m = String(minTime.getMonth() + 1).padStart(2, '0');
                const d = String(minTime.getDate()).padStart(2, '0');
                return `${y}-${m}-${d}`;
              })()}
              enableSwipeMonths={true}
            />
          </View>

          <Pressable
            style={[
              styles.continueButton,
              isButtonDisabled && styles.continueButtonDisabled,
              isButtonHovered &&
                !isButtonDisabled && {
                  backgroundColor: colors.primaryOrangeHover || '#CC6800',
                },
            ]}
            onPress={handleContinue}
            disabled={isButtonDisabled}
            onHoverIn={() => setIsButtonHovered(true)}
            onHoverOut={() => setIsButtonHovered(false)}>
            <Text style={styles.continueButtonText}>Continuar</Text>
          </Pressable>
        </View>
      </View>

      <Text style={styles.footer}>
        © DelBicos - {new Date().getFullYear()} - Todos os direitos reservados.
      </Text>
    </ScrollView>
  );
}

export default SubCategoryScreen;
