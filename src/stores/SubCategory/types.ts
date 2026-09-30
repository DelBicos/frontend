// Interface para uma subcategoria individual
export interface SubCategory {
  id: number;
  title: string;
  description?: string;
  category_id: number; // Para sabermos a qual categoria ela pertence
}

// Interface para o store
export interface SubCategoryStore {
  subCategories: SubCategory[];
  fetchSubCategoriesByCategoryId: (categoryId: number) => Promise<void>;
  fetchAllSubCategories: () => Promise<void>;
}
