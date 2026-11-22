import type { HighlightItem } from '@components/ui/HighlightCard';

type UnsplashCrop = 'entropy' | 'faces';

/** Foto do destaque com recorte Unsplash ajustado ao banner do carrossel. */
export type FeedHighlightPhoto = {
  photoId: string;
  crop?: UnsplashCrop;
};

export type FeedHighlight = {
  id: string;
  title: string;
  description: string;
  ctaLabel: string;
  categoryTitle: string;
  photos: FeedHighlightPhoto[];
};

const BANNER_SIZE = 'w=1600&h=900&fit=crop&q=85&auto=format';

export function buildHighlightBannerUrl(
  photoId: string,
  crop: UnsplashCrop = 'entropy',
): string {
  return `https://images.unsplash.com/${photoId}?${BANNER_SIZE}&crop=${crop}`;
}

/** Destaques com fotos indicadas pelo time (Unsplash). */
export const FEED_HIGHLIGHTS: FeedHighlight[] = [
  {
    id: '1',
    title: 'Reformas de Fim de Ano',
    description: 'Pintores e eletricistas com agenda aberta.',
    ctaLabel: 'Ver reformas',
    categoryTitle: 'Reformas & Reparos',
    photos: [
      { photoId: 'photo-1652829069862-87874e119527', crop: 'entropy' },
      { photoId: 'photo-1646640381839-02748ae8ddf0', crop: 'faces' },
      { photoId: 'photo-1760546120487-ccb54df9838c', crop: 'entropy' },
      { photoId: 'photo-1651195297119-afc97f14a40d', crop: 'entropy' },
    ],
  },
  {
    id: '2',
    title: 'Prepare-se para o Verão',
    description: 'Instalação de piscina e ar-condicionado.',
    ctaLabel: 'Ver serviços gerais',
    categoryTitle: 'Serviços Gerais',
    photos: [
      { photoId: 'photo-1506359585186-16ff29581308', crop: 'entropy' },
      { photoId: 'photo-1543489822-c49534f3271f', crop: 'entropy' },
      { photoId: 'photo-1724488751821-1415f5cf4960', crop: 'entropy' },
      { photoId: 'photo-1606043580455-bd22074d1e67', crop: 'entropy' },
    ],
  },
  {
    id: '3',
    title: 'Beleza & Estética',
    description: 'Manicures e cabeleireiros para as festas.',
    ctaLabel: 'Ver beleza',
    categoryTitle: 'Beleza & Estética',
    photos: [
      { photoId: 'photo-1632345031435-8727f6897d53', crop: 'faces' },
      { photoId: 'photo-1580618672591-eb180b1a973f', crop: 'faces' },
      { photoId: 'photo-1613966802194-d46a163af70d', crop: 'faces' },
      { photoId: 'photo-1647004692483-c5d942fe1137', crop: 'faces' },
    ],
  },
  {
    id: '4',
    title: 'Cuidados Pet',
    description: 'Dog walkers e pet sitters perto de você.',
    ctaLabel: 'Ver serviços pet',
    categoryTitle: 'Pet',
    photos: [
      { photoId: 'photo-1623387641168-d9803ddd3f35', crop: 'entropy' },
      { photoId: 'photo-1573435567032-ff5982925350', crop: 'entropy' },
      { photoId: 'photo-1719464454959-9cf304ef4774', crop: 'faces' },
      { photoId: 'photo-1494947665470-20322015e3a8', crop: 'entropy' },
    ],
  },
];

function pickOne<T>(items: readonly T[]): T {
  const index = Math.floor(Math.random() * items.length);
  return items[index];
}

/** Escolhe uma imagem por destaque (nova a cada montagem do Feed). */
export function pickHighlightImages(
  highlights: FeedHighlight[],
): (Omit<HighlightItem, 'link'> & { categoryTitle: string })[] {
  return highlights.map(
    ({ photos, categoryTitle, id, title, description, ctaLabel }) => {
      const photo = pickOne(photos);
      return {
        id,
        title,
        description,
        ctaLabel,
        categoryTitle,
        image: buildHighlightBannerUrl(photo.photoId, photo.crop),
      };
    },
  );
}
