import { UNSPLASH_API_KEY } from '@config/varEnvs';
import { create } from 'zustand';

import { logger } from '@lib/logger';
interface UnsplashStore {
  fetchRandomPhoto: (query: string) => Promise<string | null>;
}

export const useUnsplashStore = create<UnsplashStore>()((set) => ({
  fetchRandomPhoto: async (query: string) => {
    try {
      const response = await fetch(
        `https://api.unsplash.com/photos/random?query=${query}&client_id=${UNSPLASH_API_KEY}`,
      );

      if (!response.ok) {
        logger.error(
          'Failed to fetch image from Unsplash:',
          response.statusText,
        );
        return null;
      }

      const data = await response.json();
      return data.urls.small as string;
    } catch (error) {
      logger.error('Error fetching image from Unsplash:', error);
      return null;
    }
  },
}));
