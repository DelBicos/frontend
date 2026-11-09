import type { FC } from 'react';
import type { SvgProps } from 'react-native-svg';

import beautySVG from '@assets/categories/beauty.svg';
import healthSVG from '@assets/categories/health.svg';
import homeSVG from '@assets/categories/home.svg';
import miscSVG from '@assets/categories/miscellaneous.svg';
import petsSVG from '@assets/categories/pets.svg';
import repairSVG from '@assets/categories/repair.svg';

export type CategorySvgInfo = {
  IconComponent: FC<SvgProps>;
  width: number;
  height: number;
};

const CATEGORY_SVGS: Record<number, CategorySvgInfo> = {
  1: { IconComponent: healthSVG, width: 72, height: 70 },
  2: { IconComponent: beautySVG, width: 63, height: 87 },
  3: { IconComponent: repairSVG, width: 70, height: 75 },
  4: { IconComponent: miscSVG, width: 51, height: 69 },
  5: { IconComponent: homeSVG, width: 61, height: 50 },
  6: { IconComponent: petsSVG, width: 74, height: 74 },
};

const FALLBACK = CATEGORY_SVGS[4];

/** Ilustracao SVG da categoria (ids do backend ate vir do servidor). */
export function getCategorySvg(id: number): CategorySvgInfo {
  return CATEGORY_SVGS[id] ?? FALLBACK;
}
