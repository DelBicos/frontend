import { User } from '@stores/User/types';
import { ProfessionalResult } from '@components/features/ProfessionalResultCard';

export interface ListedProfessional {
  id: number;
  name: string;
  category: string;
  rating: number;
  ratingsCount: number;
  imageUrl: string;
  location: string;
  distance?: number;
  offeredServices: string[];
}

export interface Address {
  id: number;
  lat?: number;
  lng?: number;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipcode: string;
}

export interface Subcategory {
  id: number;
  name: string;
}

export interface Service {
  id: number;
  title: string;
  description?: string;
  price: string;
  price_cents?: number;
  duration: number;
  banner_uri?: string;
  active: boolean;
  subcategory_id: number;
  professional_id: number;
  Subcategory?: Subcategory;
  createdAt: string;
  updatedAt: string;
}

export interface ClientUser {
  name: string;
  avatar_uri?: string;
}

export interface AppointmentClient {
  User: ClientUser;
}

export interface Review {
  id: number;
  rating?: number;
  review?: string;
  start_time: string;
  Client: AppointmentClient;
}

export interface GalleryItem {
  id: number;
  professional_id: number;
  url: string;
  description?: string;
  active?: boolean;
}

export interface AmenityItem {
  id: number;
  name: string;
  icon?: string;
}

export interface Professional {
  id: number;
  user_id: number;
  main_address_id?: number;
  cpf: string;
  cnpj?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;

  // Relacionamentos
  User: User;
  MainAddress?: Address;
  Services: Service[];
  Appointments: Review[];
  Gallery?: GalleryItem[];
  Amenities?: AmenityItem[];

  // Raio de atendimento
  service_radius_km?: number;

  // Dados calculados
  rating?: number;
  ratings_count?: number;
}

export interface ProfessionalStore {
  professionals: ListedProfessional[];
  selectedProfessional: Professional | null;
  fetchProfessionals: (
    filter?: string,
    page?: number,
    limit?: number,
    lat?: number,
    lng?: number,
  ) => Promise<ListedProfessional[]>;
  fetchProfessionalById: (id: number) => Promise<Professional | null>;
  fetchProfessionalsByAvailability: (
    subCategoryId: number,
    date: string,
    lat?: number,
    lng?: number,
  ) => Promise<ProfessionalResult[] | null>;
  updateRadius: (professionalId: number, radiusKm: number) => Promise<void>;
}
