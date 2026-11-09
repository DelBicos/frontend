export interface CategoryPayload {
  id: number;
  title: string;
  description?: string;
  imageUrl?: string;
  active: boolean;
}

export interface Category extends CategoryPayload {
  /** Icone FontAwesome5 da categoria (o backend ainda nao envia o icone). */
  iconName: string;
}

export interface CategoryStore {
  categories: Category[];
  fetchCategories: () => Promise<void>;
}
