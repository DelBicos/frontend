// Mantemos os ícones mapeados por enquanto, até que decida trazê-los do banco também!
const CATEGORY_ICONS: Record<number, string> = {
  1: 'heartbeat',
  2: 'cut',
  3: 'tools',
  4: 'lightbulb',
  5: 'home',
  6: 'paw',
};

export function getCategoryIconName(id: number): string {
  return CATEGORY_ICONS[id] || 'shapes';
}
