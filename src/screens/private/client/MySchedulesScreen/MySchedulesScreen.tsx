import React from 'react';
import { View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { createStyles } from './styles';
import { useColors } from '@theme/ThemeProvider';
import { useThemeStore, ThemeMode } from '@stores/Theme';
import MeusAgendamentos from '../Profile/Tabs/MeusAgendamentos/MeusAgendamentos';

const MySchedulesScreen: React.FC = () => {
  const colors = useColors();
  const { theme } = useThemeStore();
  const isDark = theme === ThemeMode.DARK;
  const isHighContrast = theme === ThemeMode.LIGHT_HI_CONTRAST;
  const styles = createStyles(colors, isDark, isHighContrast);
  const route = useRoute();

  const role =
    route.name === 'ProfessionalSchedulesTab' ? 'professional' : 'client';

  return (
    <View style={styles.container}>
      <MeusAgendamentos role={role} />
    </View>
  );
};

export default MySchedulesScreen;
