/**
 * Regras de qualidade do codigo de producao. `any` e `console` sao barrados
 * pelo ESLint; aqui ficam as que o ESLint nao cobre.
 */
import fs from 'fs';
import path from 'path';

const SRC = path.resolve(__dirname, '..');
const MAX_LINES = 600;

function productionFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return entry.name === '__tests__' ? [] : productionFiles(full);
    }
    return /\.(ts|tsx)$/.test(entry.name) &&
      !/\.test\.(ts|tsx)$/.test(entry.name)
      ? [full]
      : [];
  });
}

const files = productionFiles(SRC);

describe('qualidade do codigo', () => {
  it(`mantem cada arquivo abaixo de ${MAX_LINES} linhas`, () => {
    const offenders = files
      .map((file) => ({
        file: path.relative(SRC, file),
        lines: fs.readFileSync(file, 'utf8').split('\n').length,
      }))
      .filter(({ lines }) => lines > MAX_LINES);
    expect(offenders).toEqual([]);
  });
});
