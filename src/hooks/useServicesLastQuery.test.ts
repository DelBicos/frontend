import { act, renderHook } from '@testing-library/react-native';
import { useServicesStore } from '@stores/Services/Services';
import useServicesLastQuery from './useServicesLastQuery';

describe('useServicesLastQuery', () => {
  it('acompanha a ultima busca de servicos do store', () => {
    const { result } = renderHook(() => useServicesLastQuery());
    const lastQuery = { q: 'pintor' };
    act(() => useServicesStore.setState({ lastQuery }));
    expect(result.current).toBe(lastQuery);
  });
});
