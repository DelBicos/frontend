export type ColorsType = {
  primaryBlue: string;
  primaryOrange: string;
  primaryBlack: string;
  primaryGreen: string;
  primaryWhite: string;
  primaryRed: string;
  secondaryGray: string;
  secondaryBeige: string;
  primaryWhiteHover: string;
  primaryOrangeHover: string;

  cardBackground: string;
  borderColor: string;
  textSecondary: string;
  textTertiary: string;
  backgroundElevated: string;
  /** Fundo das paginas (Inicio, Categorias, Subcategorias...). */
  pageBackground: string;
  /** Texto e icone sobre o laranja da marca (preto: contraste AA). */
  textOnAccent: string;
  /** Texto e icone sobre foto ou faixa escura (sempre claro). */
  textOnImage: string;

  successBackground: string;
  successText: string;
  errorBackground: string;
  errorText: string;
  warningBackground: string;
  warningText: string;

  inputBackground: string;
  placeholder: string;
  divider: string;
  overlay: string;

  badgeBackground: string;
  badgeText: string;

  notification: {
    unreadBorder: string;
    unreadTitle: string;
    unreadMessage: string;
    readTitle: string;
    readMessage: string;
    cardBackground: string;
    modalBackground: string;
  };
};
