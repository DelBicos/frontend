import { StyleSheet } from 'react-native';
import { ColorsType } from '@theme/types';

export const createInputBaseStyle = (colors: ColorsType) => ({
  input: {
    backgroundColor: colors.inputBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.borderColor,
    fontFamily: 'Afacad-Regular',
    color: colors.primaryBlack,
  },
  inputError: {
    borderColor: colors.errorText,
    borderWidth: 1.5,
  },
});

export const createStyles = (colors: ColorsType) => {
  const inputBaseStyle = createInputBaseStyle(colors);

  return StyleSheet.create({
    container: {
      width: '100%',
      marginBottom: 16,
    },
    label: {
      marginBottom: 8,
      fontSize: 16,
      color: colors.primaryBlack,
      fontFamily: 'Afacad-SemiBold',
    },
    input: {
      ...inputBaseStyle.input,
    },
    inputError: {
      ...inputBaseStyle.inputError,
    },
    errorText: {
      color: colors.errorText,
      fontSize: 14,
      marginTop: 6,
      fontFamily: 'Afacad-Regular',
    },
  });
};
