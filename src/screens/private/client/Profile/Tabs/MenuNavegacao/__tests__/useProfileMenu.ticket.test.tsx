import { renderHook, act } from '@testing-library/react-native';
import { useProfileMenu } from '../useProfileMenu';
import { ClientProfileSubRoutes } from '@screens/types';
import { useUserStore } from '@stores/User';

const mockNavigate = jest.fn();
const mockSetParams = jest.fn();
let mockRouteName = 'ProfileTab';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    setParams: mockSetParams,
    dispatch: jest.fn(),
  }),
  useRoute: () => ({ name: mockRouteName, params: {} }),
  CommonActions: { reset: jest.fn() },
}));

const findAjuda = (sections: ReturnType<typeof useProfileMenu>['sections']) =>
  sections
    .flatMap((section) =>
      section.items.map((item) => ({ ...item, section: section.title })),
    )
    .find((item) => item.id === ClientProfileSubRoutes.Ajuda);

describe('useProfileMenu — Central de Ajuda', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouteName = 'ProfileTab';
    useUserStore.setState({
      user: { id: 31, client_id: 31, name: 'Cliente Teste' },
    } as never);
  });

  it('deve ter o item "Central de Ajuda" na seção Atividade', () => {
    const { result } = renderHook(() => useProfileMenu());
    const item = findAjuda(result.current.sections);

    expect(item).toMatchObject({
      label: 'Central de Ajuda',
      icon: 'help-outline',
      section: 'Atividade',
    });
  });

  it('deve mostrar o item também para o prestador', () => {
    mockRouteName = 'ProfessionalProfileTab';
    useUserStore.setState({
      user: { id: 7, client_id: 7, professional_id: 3, name: 'Prestador' },
    } as never);

    const { result } = renderHook(() => useProfileMenu());
    expect(findAjuda(result.current.sections)).toBeTruthy();
  });

  it('deve abrir a lista de chamados em vez de trocar a subrota', () => {
    const { result } = renderHook(() => useProfileMenu());

    act(() => {
      result.current.open(ClientProfileSubRoutes.Ajuda);
    });

    expect(mockNavigate).toHaveBeenCalledWith('TicketsList');
    expect(mockSetParams).not.toHaveBeenCalled();
  });

  it('deve manter o comportamento das outras opções', () => {
    const { result } = renderHook(() => useProfileMenu());

    act(() => {
      result.current.open(ClientProfileSubRoutes.Favoritos);
    });

    expect(mockSetParams).toHaveBeenCalledWith({
      subroute: ClientProfileSubRoutes.Favoritos,
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
