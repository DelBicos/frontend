import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import useServicesLastQuery from './useServicesLastQuery';
import { useColors } from '@theme/ThemeProvider';

const ServicesDebug: React.FC = () => {
  const lastQuery = useServicesLastQuery();
  const colors = useColors();
  const styles = createStyles(colors);

  if (!__DEV__) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Services.lastQuery</Text>
      <Text style={styles.value}>
        {JSON.stringify(lastQuery || {}, null, 2)}
      </Text>
    </View>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      padding: 8,
      backgroundColor: colors.cardBackground,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.borderColor,
      margin: 8,
    },
    title: { fontFamily: 'Afacad-SemiBold', color: colors.primaryOrange },
    value: {
      fontFamily: 'Afacad-Regular',
      color: colors.primaryBlack,
      marginTop: 6,
    },
  });

export default ServicesDebug;
