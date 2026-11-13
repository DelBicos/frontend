import { initials } from '../initials';

describe('initials', () => {
  it('junta a primeira e a ultima iniciais', () => {
    expect(initials('Maria da Silva')).toBe('MS');
    expect(initials('  joao  ')).toBe('J');
  });

  it('usa interrogacao quando nao ha nome util', () => {
    expect(initials(null)).toBe('?');
    expect(initials(undefined)).toBe('?');
    expect(initials('')).toBe('?');
    expect(initials('   ')).toBe('?');
  });
});
