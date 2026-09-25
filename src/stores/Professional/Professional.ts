import { create } from 'zustand';
import {
  ListedProfessional,
  ProfessionalStore,
  Professional,
} from '@stores/Professional/types';
import { backendHttpClient } from '@lib/helpers/httpClient';
import { ProfessionalResult } from '@components/features/ProfessionalResultCard';

export const useProfessionalStore = create<ProfessionalStore>((set) => ({
  professionals: [],
  selectedProfessional: null,

  fetchProfessionals: async (
    filter = '',
    page = 0,
    limit = 12,
    lat?: number,
    lng?: number,
  ) => {
    try {
      const params: any = {};
      if (!!filter?.length) {
        params.termo = filter;
      }
      if (page) {
        params.page = page;
      }
      if (limit) {
        params.limit = limit;
      }
      if (lat) params.lat = lat;
      if (lng) params.lng = lng;
      const response = await backendHttpClient.get('/api/professionals', {
        params,
      });

      const rawData = Array.isArray(response.data)
        ? response.data
        : response.data.professionals || [];

      // Helper to extract coordinates from various possible shapes returned by backend
      const extractCoords = (
        prof: any,
      ): { lat?: number; lng?: number } | null => {
        try {
          const addr =
            prof.MainAddress ||
            prof.Address ||
            prof.address ||
            prof.User?.MainAddress ||
            prof.User?.address;
          if (addr) {
            const lat = addr.lat ?? addr.latitude ?? addr.latitud ?? null;
            const lng =
              addr.lng ?? addr.longitude ?? addr.long ?? addr.lon ?? null;
            if (
              lat !== null &&
              lat !== undefined &&
              lng !== null &&
              lng !== undefined
            ) {
              return { lat: Number(lat), lng: Number(lng) };
            }
          }

          // try top-level fields
          const topLat = prof.lat ?? prof.latitude ?? prof.latitud;
          const topLng = prof.lng ?? prof.longitude ?? prof.long ?? prof.lon;
          if (topLat !== undefined && topLng !== undefined) {
            return { lat: Number(topLat), lng: Number(topLng) };
          }
        } catch (e) {
          // ignore
        }
        return null;
      };

      const mappedProfessionals: ListedProfessional[] = rawData.map(
        (prof: any) => {
          const rawDist =
            prof.distance_km ?? prof.dataValues?.distance_km ?? null;

          return {
            id: prof.id,
            name: prof.name || prof.User?.name || 'Profissional',
            rating: Number(prof.rating || 0),
            ratingsCount: Number(prof.ratings_count || 0),
            imageUrl:
              prof.avatar_uri ||
              prof.User?.avatar_uri ||
              'https://via.placeholder.com/150',
            location:
              prof.MainAddress && prof.MainAddress.city
                ? `${prof.MainAddress.city}, ${prof.MainAddress.state || 'BR'}`
                : 'Localização não informada',
            distance:
              rawDist !== null && rawDist !== undefined
                ? Number(rawDist)
                : undefined,
            offeredServices: prof.Services
              ? prof.Services.map((s: any) =>
                  typeof s === 'string' ? s : s.title,
                )
              : ['Serviços Gerais'],
            category: prof.Services?.[0]?.title || 'Serviços Diversos',
          };
        },
      );
      return mappedProfessionals;
    } catch (error) {
      console.error('[ProfessionalStore] Erro ao buscar profissionais:', error);
      return [];
    }
  },
  fetchProfessionalById: async (id: number): Promise<Professional | null> => {
    set({ selectedProfessional: null });

    try {
      const response = await backendHttpClient.get(`/api/professionals/${id}`);

      if (response.status !== 200 || !response.data) {
        throw new Error(`Profissional com ID ${id} não encontrado.`);
      }

      const professional: Professional = response.data;

      const ratings = professional.Appointments?.filter((a) => a.rating) || [];
      const averageRating =
        ratings.length > 0
          ? ratings.reduce((sum, a) => sum + (a.rating || 0), 0) /
            ratings.length
          : 0;

      const roundedRating = Math.round(averageRating * 10) / 10;

      const professionalWithRating = {
        ...professional,
        rating: roundedRating,
        ratings_count: ratings.length,
      };

      set({ selectedProfessional: professionalWithRating });
      return professionalWithRating;
    } catch (error) {
      console.error(
        `[ProfessionalStore] Error fetching professional by ID ${id}:`,
        error,
      );
      set({ selectedProfessional: null });
      return null;
    }
  },

  fetchProfessionalsByAvailability: async (
    subCategoryId: number,
    date: string,
    lat?: number,
    lng?: number,
  ): Promise<ProfessionalResult[]> => {
    try {
      const params: any = { subCategoryId, date };
      if (lat) params.lat = lat;
      if (lng) params.lng = lng;

      const response = await backendHttpClient.get(
        '/api/professionals/search-availability',
        {
          params,
        },
      );

      return (response.data as ProfessionalResult[]) ?? [];
    } catch (error) {
      // A tela mostra o erro (lista vazia pareceria "nenhum profissional").
      console.error('[ProfessionalStore] Error fetching availability:', error);
      throw error;
    }
  },

  updateRadius: async (professionalId: number, radiusKm: number) => {
    await backendHttpClient.put(`/api/professionals/${professionalId}/radius`, {
      service_radius_km: Math.floor(radiusKm),
    });
    const current = useProfessionalStore.getState().selectedProfessional;
    if (current && current.id === professionalId) {
      set({
        selectedProfessional: {
          ...current,
          service_radius_km: Math.floor(radiusKm),
        },
      });
    }
  },
}));
