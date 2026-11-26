import lightScheme from '@theme/light';
import { createStyles } from '../styles';

describe('createStyles', () => {
  it('cria a folha de estilos do container principal', () => {
    const styles = createStyles(lightScheme);
    expect(styles.container).toMatchObject({ flex: 1 });
    expect(Object.keys(styles).length).toBeGreaterThan(1);
  });
});
