import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { useSubCategoryStore } from '@stores/SubCategory';
import { useColors } from '@theme/ThemeProvider';
import { useThemeStore } from '@stores/Theme';
import { getIconForSubCategory } from '@utils/icons';
import { useBreakpoint } from '@lib/hooks/useBreakpoint';
import {
  formatLongDate,
  minBookingDate,
  MIN_ADVANCE_HOURS,
} from '@lib/booking';
import PageContainer, { PageHeader } from '@components/layout/PageContainer';
import { SectionHeader } from '@components/ui/SectionHeader/SectionHeader';
import BookingSteps from '@components/features/BookingSteps';
import { createStyles } from './styles';

type SubCategoryRouteParams = {
  categoryId: number;
  categoryTitle?: string;
  serviceId?: number;
  singleSubCategory?: { id: number; title: string };
  professionalId?: number;
  professionalName?: string;
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

/** Etapa 1 do agendamento: escolher o servico (subcategoria) e o dia. */
function SubCategoryScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const {
    categoryId,
    categoryTitle,
    serviceId,
    singleSubCategory,
    professionalId,
    professionalName,
  } = route.params as SubCategoryRouteParams;
  const colors = useColors();
  const theme = useThemeStore((s) => s.theme);
  const { isExpanded, isCompact } = useBreakpoint();
  const styles = createStyles(colors, isCompact);

  const { subCategories, fetchSubCategoriesByCategoryId } =
    useSubCategoryStore();
  const [isLoading, setIsLoading] = useState(!singleSubCategory);
  // Parametros vindos da URL (web) chegam como texto.
  const [selectedId, setSelectedId] = useState<number | null>(
    singleSubCategory?.id ?? (serviceId ? Number(serviceId) : null),
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    if (singleSubCategory || !categoryId) {
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    fetchSubCategoriesByCategoryId(Number(categoryId)).finally(() => {
      if (!cancelled) setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [categoryId, fetchSubCategoriesByCategoryId, singleSubCategory]);

  const options = useMemo(
    () => (singleSubCategory ? [singleSubCategory] : subCategories),
    [singleSubCategory, subCategories],
  );

  // Com uma unica opcao, ja deixa selecionada.
  useEffect(() => {
    if (!isLoading && options.length === 1) setSelectedId(options[0].id);
  }, [isLoading, options]);

  const selected = options.find((o) => o.id === selectedId) ?? null;
  const minDate = minBookingDate();
  const canContinue = !!selected && !!selectedDate;

  const handleContinue = () => {
    if (!selected || !selectedDate) return;
    navigation.navigate('SearchResult', {
      subCategoryId: selected.id,
      subCategoryTitle: selected.title,
      date: selectedDate,
      professionalId,
      professionalName,
    });
  };

  const markedDates = useMemo(
    () =>
      selectedDate
        ? {
            [selectedDate]: {
              selected: true,
              disableTouchEvent: true,
              selectedColor: colors.primaryOrange,
              selectedTextColor: '#000000',
            },
          }
        : {},
    [selectedDate, colors.primaryOrange],
  );

  const columns = isCompact ? 1 : 2;

  const serviceSection = (
    <View style={styles.section}>
      <SectionHeader
        title="1. Qual serviço?"
        subtitle={
          professionalName
            ? `Serviços de ${professionalName} nesta categoria.`
            : undefined
        }
      />
      {isLoading ? (
        <ActivityIndicator
          size="large"
          color={colors.primaryBlack}
          style={styles.loading}
        />
      ) : options.length === 0 ? (
        <Text style={styles.emptyText}>
          Nenhum serviço disponível nesta categoria por enquanto.
        </Text>
      ) : (
        <View
          style={styles.grid}
          accessibilityRole="radiogroup"
          accessibilityLabel="Serviço">
          {options.map((item) => {
            const isSelected = item.id === selectedId;
            return (
              <View
                key={item.id}
                style={[styles.gridItem, { width: `${100 / columns}%` }]}>
                <Pressable
                  onPress={() => setSelectedId(item.id)}
                  style={({ pressed, hovered }: any) => [
                    styles.option,
                    hovered && !isSelected && styles.optionHover,
                    isSelected && styles.optionSelected,
                    pressed && { opacity: 0.85 },
                  ]}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: isSelected }}
                  accessibilityLabel={item.title}>
                  <View style={styles.optionIcon}>
                    <FontAwesome5
                      name={getIconForSubCategory(item.title)}
                      size={18}
                      color={colors.primaryBlack}
                    />
                  </View>
                  <Text style={styles.optionText}>{item.title}</Text>
                  <View
                    style={[styles.radio, isSelected && styles.radioSelected]}>
                    {isSelected ? (
                      <FontAwesome name="check" size={12} color="#000000" />
                    ) : null}
                  </View>
                </Pressable>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );

  const dateSection = (
    <View style={styles.section}>
      <SectionHeader
        title="2. Para qual dia?"
        subtitle={`Agende com pelo menos ${MIN_ADVANCE_HOURS} horas de antecedência.`}
      />
      <View style={styles.calendarCard}>
        <Calendar
          key={theme}
          minDate={minDate}
          current={selectedDate ?? minDate}
          onDayPress={(day) => setSelectedDate(day.dateString)}
          markedDates={markedDates}
          enableSwipeMonths
          disableAllTouchEventsForDisabledDays
          theme={{
            calendarBackground: 'transparent',
            textDayFontFamily: 'Afacad-Regular',
            textMonthFontFamily: 'Afacad-Bold',
            textDayHeaderFontFamily: 'Afacad-SemiBold',
            textDayFontSize: 16,
            textMonthFontSize: 18,
            textDayHeaderFontSize: 14,
            monthTextColor: colors.primaryBlack,
            textSectionTitleColor: colors.textSecondary,
            dayTextColor: colors.primaryBlack,
            textDisabledColor: colors.textTertiary,
            todayTextColor: colors.primaryBlack,
            arrowColor: colors.primaryBlack,
            disabledArrowColor: colors.textTertiary,
            selectedDayBackgroundColor: colors.primaryOrange,
            selectedDayTextColor: '#000000',
          }}
        />
      </View>
    </View>
  );

  const summary = (
    <View style={styles.summary}>
      <View style={styles.summaryRow}>
        <FontAwesome name="wrench" size={16} color={colors.textSecondary} />
        <Text style={[styles.summaryText, !selected && styles.summaryMissing]}>
          {selected ? selected.title : 'Escolha um serviço'}
        </Text>
      </View>
      <View style={styles.summaryRow}>
        <FontAwesome name="calendar" size={16} color={colors.textSecondary} />
        <Text
          style={[styles.summaryText, !selectedDate && styles.summaryMissing]}>
          {selectedDate ? formatLongDate(selectedDate) : 'Escolha um dia'}
        </Text>
      </View>
      <Pressable
        onPress={handleContinue}
        disabled={!canContinue}
        style={({ pressed, hovered }: any) => [
          styles.continueButton,
          hovered && canContinue && styles.continueButtonHover,
          !canContinue && styles.continueButtonDisabled,
          pressed && { opacity: 0.85 },
        ]}
        accessibilityRole="button"
        accessibilityState={{ disabled: !canContinue }}
        accessibilityHint={
          canContinue ? undefined : 'Escolha um serviço e um dia para continuar'
        }>
        <Text
          style={[
            styles.continueText,
            !canContinue && styles.continueTextDisabled,
          ]}>
          Ver horários disponíveis
        </Text>
        <FontAwesome
          name="arrow-right"
          size={16}
          color={canContinue ? '#000000' : colors.textSecondary}
        />
      </Pressable>
    </View>
  );

  return (
    <PageContainer>
      <BookingSteps current={1} />
      <PageHeader
        eyebrow={categoryTitle}
        title="Agende um serviço"
        subtitle="Escolha o serviço e o dia. Em seguida você vê os profissionais e os horários livres."
      />
      {isExpanded ? (
        <View style={styles.columns}>
          <View style={styles.mainColumn}>{serviceSection}</View>
          <View style={styles.sideColumn}>
            {dateSection}
            {summary}
          </View>
        </View>
      ) : (
        <>
          {serviceSection}
          {dateSection}
          {summary}
        </>
      )}
    </PageContainer>
  );
}

export default SubCategoryScreen;
