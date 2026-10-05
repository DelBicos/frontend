import { getBottomNavState, getFocusedRouteName } from '../bottomNavState';

const tabs = (name: string, focused: string, index = 0) => ({
  name,
  state: { index, routes: [{ name: focused }] },
});

describe('getBottomNavState', () => {
  it('destaca a aba em foco dentro de Home (cliente)', () => {
    const state = { index: 0, routes: [tabs('Home', 'CategoryTab')] };
    const nav = getBottomNavState(state as any, false);
    expect(nav.mode).toBe('client');
    expect(nav.container).toBe('Home');
    expect(nav.activeTab).toBe('CategoryTab');
  });

  it('usa as abas de parceiro quando o usuario e profissional', () => {
    const state = { index: 0, routes: [{ name: 'Home' }] };
    const nav = getBottomNavState(state as any, true);
    expect(nav.mode).toBe('professional');
    expect(nav.activeTab).toBe('ProfessionalHomeTab');
  });

  it('mantem a barra em telas empilhadas, destacando a secao da tela', () => {
    const state = {
      index: 2,
      routes: [
        tabs('Home', 'FeedTab'),
        { name: 'Category' },
        { name: 'SubCategoryScreen' },
      ],
    };
    const nav = getBottomNavState(state as any, false);
    expect(nav.container).toBe('Home');
    expect(nav.activeTab).toBe('CategoryTab');
  });

  it('parceiro no modo cliente (MainTabs) usa as abas de cliente', () => {
    const state = {
      index: 1,
      routes: [{ name: 'Home' }, tabs('MainTabs', 'SchedulesTab')],
    };
    const nav = getBottomNavState(state as any, true);
    expect(nav.mode).toBe('client');
    expect(nav.container).toBe('MainTabs');
    expect(nav.activeTab).toBe('SchedulesTab');
  });

  it('sem abas no stack (link direto) volta para Home', () => {
    const state = { index: 0, routes: [{ name: 'MySchedules' }] };
    const nav = getBottomNavState(state as any, false);
    expect(nav.container).toBe('Home');
    expect(nav.activeTab).toBe('SchedulesTab');
  });
});

describe('getFocusedRouteName', () => {
  it('retorna a rota mais interna em foco', () => {
    const state = {
      index: 1,
      routes: [{ name: 'Home' }, tabs('MainTabs', 'ProfileTab')],
    };
    expect(getFocusedRouteName(state as any)).toBe('ProfileTab');
  });
});
