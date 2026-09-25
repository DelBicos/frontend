// Identidade visual das categorias (icone + cores) ate que venham do backend.

const CATEGORY_ICONS: Record<number, string> = {
  1: 'heartbeat',
  2: 'cut',
  3: 'tools',
  4: 'lightbulb',
  5: 'home',
  6: 'paw',
};

/** Gradientes usados quando a categoria nao tem imagem (ou ela falha). */
export const CATEGORY_GRADIENTS: [string, string][] = [
  ['#005A93', '#0B7FC4'],
  ['#C75B00', '#FC8200'],
  ['#1F6F54', '#2E9E74'],
  ['#5B3A99', '#7F5AC8'],
  ['#8A2E4B', '#C0476B'],
  ['#34495E', '#52708D'],
];

export function getCategoryIconName(id: number) {
  return CATEGORY_ICONS[id] || 'shapes';
}

export function getCategoryGradient(id: number): [string, string] {
  const index =
    (((id - 1) % CATEGORY_GRADIENTS.length) + CATEGORY_GRADIENTS.length) %
    CATEGORY_GRADIENTS.length;
  return CATEGORY_GRADIENTS[index];
}
