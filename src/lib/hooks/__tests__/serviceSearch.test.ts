import { backendHttpClient } from '@lib/helpers/httpClient';
import {
  filterSubCategories,
  loadAllSubCategories,
  resetSubCategoryCache,
} from '../useServiceSearch';
import { getBreakpointInfo } from '../useBreakpoint';

jest.mock('@lib/helpers/httpClient', () => ({
  backendHttpClient: { get: jest.fn() },
}));

const get = backendHttpClient.get as jest.Mock;
const sub = (id: number, title: string) =>
  ({ id, title, category_id: 1 }) as any;

beforeEach(() => {
  jest.clearAllMocks();
  resetSubCategoryCache();
});

describe('busca de servicos', () => {
  it('filtra sem diferenciar maiusculas e limita resultados', () => {
    const all = [sub(1, 'Eletricista'), sub(2, 'Encanador'), sub(3, 'Pintor')];
    expect(filterSubCategories(all, ' ELE ').map((s) => s.id)).toEqual([1]);
    expect(filterSubCategories(all, 'n', 1)).toHaveLength(1);
    expect(filterSubCategories(all, '   ')).toEqual([]);
  });

  it('busca todas as subcategorias uma unica vez (com cache)', async () => {
    get.mockResolvedValue({ data: [sub(1, 'Pintor')] });
    await Promise.all([loadAllSubCategories(), loadAllSubCategories()]);
    await loadAllSubCategories();
    expect(get).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledWith('/api/subcategories');
  });
});

describe('breakpoints', () => {
  it('classifica larguras e calcula margem e area util', () => {
    expect(getBreakpointInfo(375)).toMatchObject({
      breakpoint: 'compact',
      gutter: 16,
      contentWidth: 343,
    });
    expect(getBreakpointInfo(768)).toMatchObject({
      isMedium: true,
      gutter: 24,
    });
    expect(getBreakpointInfo(1920)).toMatchObject({
      isExpanded: true,
      contentWidth: 1200,
    });
  });
});
