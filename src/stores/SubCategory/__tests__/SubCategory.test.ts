import { backendHttpClient } from '@lib/helpers/httpClient';
import { SubCategory } from '../types';
import { useSubCategoryStore } from '../SubCategory';

jest.mock('@lib/helpers/httpClient', () => ({
  backendHttpClient: { get: jest.fn() },
}));

const http = backendHttpClient as unknown as Record<string, jest.Mock>;

const sub = (id: number): SubCategory => ({
  id,
  title: `Sub ${id}`,
  category_id: 2,
});

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  useSubCategoryStore.setState({ subCategories: [sub(9)] });
});

describe('SubCategoryStore', () => {
  it('carrega a lista direta e a embrulhada', async () => {
    http.get.mockResolvedValueOnce({ data: [sub(1)] });
    await useSubCategoryStore.getState().fetchAllSubCategories();
    expect(http.get).toHaveBeenCalledWith('/api/subcategories');
    expect(useSubCategoryStore.getState().subCategories).toEqual([sub(1)]);

    http.get.mockResolvedValueOnce({ data: { subCategories: [sub(2)] } });
    await useSubCategoryStore.getState().fetchAllSubCategories();
    expect(useSubCategoryStore.getState().subCategories).toEqual([sub(2)]);
  });

  it('esvazia a lista quando a carga geral falha', async () => {
    http.get.mockRejectedValue(new Error('offline'));
    await useSubCategoryStore.getState().fetchAllSubCategories();
    expect(useSubCategoryStore.getState().subCategories).toEqual([]);
  });

  it('ignora busca por categoria sem id e mantem a lista', async () => {
    await useSubCategoryStore.getState().fetchSubCategoriesByCategoryId(0);
    expect(http.get).not.toHaveBeenCalled();
    expect(useSubCategoryStore.getState().subCategories).toEqual([sub(9)]);
  });

  it('substitui a lista pela categoria pedida', async () => {
    http.get.mockResolvedValue({ status: 200, data: [sub(3)] });
    await useSubCategoryStore.getState().fetchSubCategoriesByCategoryId(2);
    expect(http.get).toHaveBeenCalledWith('/api/subcategories/category/2');
    expect(useSubCategoryStore.getState().subCategories).toEqual([sub(3)]);
  });

  it('esvazia a lista quando o servidor recusa a categoria', async () => {
    http.get.mockResolvedValue({ status: 500, data: [sub(3)] });
    await useSubCategoryStore.getState().fetchSubCategoriesByCategoryId(2);
    expect(useSubCategoryStore.getState().subCategories).toEqual([]);
  });
});
