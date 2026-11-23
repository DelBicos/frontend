export type ColorsType = {
  primaryBlue: string;
  /** Azul da marca; no escuro e distinto do cinza de `primaryBlue` nos cards da Home. */
  brandBlue: string;
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
  /** Texto e icone sobre foto, faixa escura ou fundo azul (sempre claro). */
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

  /** Assistente (chatbot): superficie propria, com gradiente e efeito de vidro. */
  chat: {
    /** Topo do gradiente do fundo. */
    backgroundTop: string;
    /** Meio e base do gradiente do fundo. */
    backgroundMid: string;
    /** Brilho laranja no canto inferior direito. */
    glow: string;
    /** Mesmo tom do brilho, transparente (fim do gradiente sem acinzentar). */
    glowFade: string;
    /** Borda e divisoria sutis do efeito de vidro. */
    glassBorder: string;
    /** Preenchimento translucido (campo de texto, botoes secundarios). */
    glassFill: string;
    /** Superficie escura: balao do bot e indicador de digitacao. */
    surface: string;
    /** Circulo do microfone. */
    micSurface: string;
    micIcon: string;
    /** Avatar e balao do usuario. */
    accent: string;
    /** Laranja para texto e borda sobre o fundo do chat (contraste AA). */
    accentText: string;
    /** Texto sobre `accent`. */
    textOnAccent: string;
    /** Icone sobre `accent` (avatar). */
    iconOnAccent: string;
    textPrimary: string;
    textSecondary: string;
    placeholder: string;
    /** Pontos do indicador de digitacao. */
    typingDot: string;
  };
};
