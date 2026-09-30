import { StyleProp, ViewStyle, TextStyle } from 'react-native';

export interface ButtonStyleProps {
  defaultColors: {
    backgroundColor: string;
    color: string;
  };
  defaultFont: {
    fontSize: number;
    fontFamily: string;
  };
  defaultSize: {
    borderRadius: number;
    paddingVertical: number;
    paddingHorizontal: number;
  };
  hoverColors?: {
    backgroundColor: string;
    color: string;
  };
  disabledColors?: {
    backgroundColor: string;
    color: string;
  };
  noWrap?: boolean;
  variant?: 'contained' | 'outlined';
}

export interface ButtonProps {
  onPress: () => void;
  colorVariant?:
    | 'primary'
    | 'primaryBlue'
    | 'secondary'
    | 'primaryWhite'
    | 'primaryGreen'
    | 'modalPrimary'
    | 'primaryOrange';
  sizeVariant?:
    | 'medium'
    | 'large'
    | 'xLarge'
    | 'smallPill'
    | 'largePill'
    | 'default'
    | 'modalButton';
  fontVariant?:
    | 'AfacadRegular32'
    | 'AfacadRegular20'
    | 'AfacadRegular15'
    | 'AfacadSemiBold14'
    | 'AfacadBold16';
  disabled?: boolean;
  variant?: 'contained' | 'outlined';
  noWrap?: boolean;
  children?: React.ReactNode;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

export interface ButtonStyles {
  container: ViewStyle;
  text: TextStyle;
  startIcon: ViewStyle;
  endIcon: ViewStyle;
  state: {
    hover: {
      container: ViewStyle;
      text: TextStyle;
    };
    disabled: {
      container: ViewStyle;
      text: TextStyle;
    };
  };
}

export type ButtonColorVariantsKeys =
  | 'primary'
  | 'primaryBlue'
  | 'secondary'
  | 'primaryWhite'
  | 'primaryGreen'
  | 'modalPrimary'
  | 'primaryOrange';
export type ButtonSizeVariantsKeys =
  | 'medium'
  | 'large'
  | 'xLarge'
  | 'smallPill'
  | 'largePill'
  | 'default'
  | 'modalButton';
export type ButtonFontVariantsKeys =
  | 'AfacadRegular32'
  | 'AfacadRegular20'
  | 'AfacadRegular15'
  | 'AfacadSemiBold14'
  | 'AfacadBold16';
