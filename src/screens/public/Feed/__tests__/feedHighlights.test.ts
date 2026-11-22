import {
  FEED_HIGHLIGHTS,
  pickHighlightImages,
  buildHighlightBannerUrl,
} from '../feedHighlights';

describe('feedHighlights', () => {
  it('cada destaque tem exatamente 4 fotos', () => {
    for (const h of FEED_HIGHLIGHTS) {
      expect(h.photos).toHaveLength(4);
    }
  });

  it('buildHighlightBannerUrl aplica recorte para o banner', () => {
    const url = buildHighlightBannerUrl('photo-test-id', 'faces');
    expect(url).toContain('photo-test-id');
    expect(url).toContain('w=1600');
    expect(url).toContain('h=900');
    expect(url).toContain('crop=faces');
  });

  it('pickHighlightImages define image por destaque', () => {
    const picked = pickHighlightImages(FEED_HIGHLIGHTS);
    expect(picked).toHaveLength(FEED_HIGHLIGHTS.length);
    for (const item of picked) {
      expect(item.image).toMatch(/^https:\/\/images\.unsplash\.com\//);
      expect(item.title.length).toBeGreaterThan(0);
    }
  });
});
