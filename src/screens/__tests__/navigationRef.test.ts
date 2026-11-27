import { navigate, navigationRef } from '../navigationRef';

describe('navigationRef.navigate', () => {
  afterEach(() => jest.restoreAllMocks());

  it('navega quando a navegacao esta pronta', () => {
    jest.spyOn(navigationRef, 'isReady').mockReturnValue(true);
    const spy = jest
      .spyOn(navigationRef, 'navigate')
      .mockImplementation(() => undefined);
    navigate('Login', { a: 1 });
    expect(spy).toHaveBeenCalledWith('Login', { a: 1 });
  });

  it('ignora a chamada antes de a navegacao ficar pronta', () => {
    jest.spyOn(navigationRef, 'isReady').mockReturnValue(false);
    const spy = jest
      .spyOn(navigationRef, 'navigate')
      .mockImplementation(() => undefined);
    navigate('Login');
    expect(spy).not.toHaveBeenCalled();
  });
});
