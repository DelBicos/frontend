import { useWindowDimensions } from 'react-native';

/** Largura maxima do conteudo em telas grandes (evita linhas longas demais). */
export const CONTENT_MAX_WIDTH = 1200;

export const BREAKPOINTS = {
  /** A partir daqui: tablet / janela media. */
  medium: 600,
  /** A partir daqui: desktop. */
  expanded: 1024,
} as const;

export type Breakpoint = 'compact' | 'medium' | 'expanded';

export interface BreakpointInfo {
  width: number;
  breakpoint: Breakpoint;
  isCompact: boolean;
  isMedium: boolean;
  isExpanded: boolean;
  /** Margem lateral recomendada para o conteudo. */
  gutter: number;
  /** Largura util do conteudo (ja descontadas as margens e o limite maximo). */
  contentWidth: number;
  /**
   * Distancia da borda da janela ate o inicio do conteudo: a margem lateral
   * ou, em telas largas, a sobra de centralizar os 1200px. Use para alinhar
   * elementos de largura total (ex.: cabecalho) com o conteudo das paginas.
   */
  sideInset: number;
}

export function getBreakpoint(width: number): Breakpoint {
  if (width >= BREAKPOINTS.expanded) return 'expanded';
  if (width >= BREAKPOINTS.medium) return 'medium';
  return 'compact';
}

export function getBreakpointInfo(width: number): BreakpointInfo {
  const breakpoint = getBreakpoint(width);
  const gutter =
    breakpoint === 'expanded' ? 32 : breakpoint === 'medium' ? 24 : 16;
  return {
    width,
    breakpoint,
    isCompact: breakpoint === 'compact',
    isMedium: breakpoint === 'medium',
    isExpanded: breakpoint === 'expanded',
    gutter,
    contentWidth: Math.min(width - gutter * 2, CONTENT_MAX_WIDTH),
    sideInset: Math.max(gutter, (width - CONTENT_MAX_WIDTH) / 2),
  };
}

/** Breakpoint atual da janela (mobile, tablet ou desktop), reativo a redimensionamento. */
export function useBreakpoint(): BreakpointInfo {
  const { width } = useWindowDimensions();
  return getBreakpointInfo(width);
}
