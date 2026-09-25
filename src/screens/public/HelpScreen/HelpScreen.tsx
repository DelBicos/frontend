import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { createStyles } from './styles';
import { useColors } from '@theme/ThemeProvider';
import { useThemeStore, ThemeMode } from '@stores/Theme';
import { FontAwesome } from '@expo/vector-icons';
import AccordionItem from '@components/ui/AccordionItem';

const FAQ_DATA = [
  {
    category: 'Conta e Perfil',
    questions: [
      {
        id: 'c1',
        q: 'Como faço para alterar minha senha?',
        a: 'Você pode alterar sua senha na tela "Meu Perfil", clicando na aba "Segurança". Você precisará da sua senha atual para definir uma nova.',
      },
      {
        id: 'c2',
        q: 'Como atualizo meu endereço de cadastro?',
        a: 'Na tela "Meu Perfil", acesse a aba "Endereços". Lá você pode editar seu endereço principal ou adicionar novos.',
      },
      {
        id: 'c3',
        q: 'Esqueci minha senha, e agora?',
        a: 'Na tela de login, clique em "Esqueci minha senha" e siga as instruções enviadas para o seu e-mail.',
      },
    ],
  },
  {
    category: 'Agendamentos e Pagamentos',
    questions: [
      {
        id: 'p1',
        q: 'Como funciona o pagamento?',
        a: 'O pagamento é processado de forma segura através do Stripe. Aceitamos Cartão de Crédito e Pix. O valor é pré-autorizado no agendamento e cobrado após a confirmação do serviço.',
      },
      {
        id: 'p2',
        q: 'Posso cancelar um agendamento?',
        a: 'Sim, você pode cancelar um agendamento na tela "Meus Agendamentos". Note que podem haver taxas de cancelamento dependendo da antecedência.',
      },
      {
        id: 'p3',
        q: 'Onde encontro meu recibo?',
        a: 'Após o pagamento, o recibo fica disponível na tela "Meus Agendamentos", no card do serviço concluído, clicando em "Ver Recibo".',
      },
    ],
  },
];

function HelpScreen() {
  const [searchTerm, setSearchTerm] = useState('');
  const colors = useColors();
  const { theme } = useThemeStore();
  const isDark = theme === ThemeMode.DARK;
  const isHighContrast = theme === ThemeMode.LIGHT_HI_CONTRAST;
  const styles = createStyles(colors, isDark, isHighContrast);

  const filteredData = useMemo(() => {
    if (!searchTerm) {
      return FAQ_DATA;
    }
    const lowerCaseSearch = searchTerm.toLowerCase();

    return FAQ_DATA.map((section) => {
      const filteredQuestions = section.questions.filter(
        (item) =>
          item.q.toLowerCase().includes(lowerCaseSearch) ||
          item.a.toLowerCase().includes(lowerCaseSearch),
      );
      return { ...section, questions: filteredQuestions };
    }).filter((section) => section.questions.length > 0);
  }, [searchTerm]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.mainContent}>
          <Text style={styles.title}>Central de Ajuda</Text>

          <View style={styles.searchBarContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Sobre o que você precisa de ajuda?"
              placeholderTextColor={colors.textTertiary}
              value={searchTerm}
              onChangeText={setSearchTerm}
              accessibilityLabel="Buscar ajuda"
            />
            <TouchableOpacity
              style={styles.searchButton}
              onPress={() => {}}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Pesquisar">
              <FontAwesome
                name="search"
                size={20}
                color={colors.primaryWhite}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.faqSection}>
            {filteredData.length > 0 ? (
              filteredData.map((section) => (
                <View key={section.category} style={styles.faqSection}>
                  <Text style={styles.categoryTitle}>{section.category}</Text>
                  {section.questions.map((item) => (
                    <AccordionItem key={item.id} title={item.q}>
                      {item.a}
                    </AccordionItem>
                  ))}
                </View>
              ))
            ) : (
              <Text style={styles.notFoundText}>
                {`Nenhum resultado encontrado para "${searchTerm}"`}
              </Text>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

export default HelpScreen;
