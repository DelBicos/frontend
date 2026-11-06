import {
  ButtonStyleProps,
  ButtonStyles,
  ButtonColorVariantsKeys,
  ButtonSizeVariantsKeys,
  ButtonFontVariantsKeys,
} from './types';
import { TextStyle, ViewStyle, StyleSheet } from 'react-native';
import { ColorsType } from '@theme/types';

import {
  createButtonColorVariants,
  buttonSizeVariants,
  buttonFontVariants,
} from './variants';

export const baseStyles = StyleSheet.create({
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginLeft: 8,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export const createStyledButton = (props: ButtonStyleProps): ButtonStyles => {
  const {
    defaultColors,
    defaultSize,
    defaultFont,
    hoverColors,
    disabledColors,
    noWrap,
    variant = 'contained',
  } = props;

  const isOutlined = variant === 'outlined';

  const backgroundColor = isOutlined
    ? 'transparent'
    : defaultColors.backgroundColor;
  const color = isOutlined
    ? defaultColors.backgroundColor
    : defaultColors.color;

  const containerStyle: ViewStyle = {
    backgroundColor: backgroundColor,
    borderRadius: defaultSize.borderRadius,
    paddingVertical: defaultSize.paddingVertical,
    paddingHorizontal: defaultSize.paddingHorizontal,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...(isOutlined && {
      borderWidth: 1.5,
      borderColor: color,
    }),
  };

  const textStyle: TextStyle = {
    fontSize: defaultFont.fontSize,
    fontFamily: defaultFont.fontFamily,
    color: color,
    textAlign: 'center',
    ...(noWrap && { flexShrink: 1 }),
  };

  const startIconStyle: ViewStyle = { marginRight: 8 };
  const endIconStyle: ViewStyle = { marginLeft: 8 };

  const stateStyles = {
    hover: {
      container: {
        backgroundColor: hoverColors?.backgroundColor || backgroundColor,
        ...(isOutlined &&
          hoverColors?.color && {
            borderColor: hoverColors.color,
          }),
      } as ViewStyle,
      text: {
        color: hoverColors?.color || color,
      } as TextStyle,
    },
    disabled: {
      container: {
        backgroundColor: disabledColors?.backgroundColor || '#E0E0E0',
        borderColor: disabledColors?.backgroundColor || '#E0E0E0',
      } as ViewStyle,
      text: {
        color: disabledColors?.color || '#999',
      } as TextStyle,
    },
  };

  return {
    container: containerStyle,
    text: textStyle,
    startIcon: startIconStyle,
    endIcon: endIconStyle,
    state: stateStyles,
  };
};

export const getStyledButtonFromVariants = (
  colors: ColorsType,
  colorVariant: ButtonColorVariantsKeys = 'primary',
  sizeVariant: ButtonSizeVariantsKeys = 'medium',
  fontVariant: ButtonFontVariantsKeys = 'AfacadRegular20',
  variant: 'contained' | 'outlined' = 'contained',
  disabled: boolean = false,
  noWrap: boolean = false,
): ButtonStyles => {
  const buttonColorVariants = createButtonColorVariants(colors);

  const buttonColor =
    buttonColorVariants[colorVariant] || buttonColorVariants.primary;
  const buttonSize =
    buttonSizeVariants[sizeVariant] || buttonSizeVariants.medium;
  const buttonFont =
    buttonFontVariants[fontVariant] || buttonFontVariants.AfacadRegular20;

  const styleProps: ButtonStyleProps = {
    defaultColors: {
      backgroundColor: buttonColor.backgroundColor,
      color: buttonColor.color,
    },
    defaultSize: buttonSize,
    defaultFont: buttonFont,
    hoverColors: buttonColor.hover,
    disabledColors: buttonColor.disabled,
    noWrap,
    variant,
  };

  const styles = createStyledButton(styleProps);

  if (disabled) {
    return {
      container: { ...styles.container, ...styles.state.disabled.container },
      text: { ...styles.text, ...styles.state.disabled.text },
      startIcon: styles.startIcon,
      endIcon: styles.endIcon,
      state: styles.state,
    };
  }

  return styles;
};

export const Styled = {
  createButton: createStyledButton,
  fromVariants: getStyledButtonFromVariants,
};
