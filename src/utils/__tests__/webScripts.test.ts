import { initClarityWeb } from '../clarity';
import { initGAWeb } from '../ga-web';

type FakeScript = {
  id: string;
  async?: boolean;
  src?: string;
  innerHTML: string;
};

const g = global as unknown as { window?: unknown; document?: unknown };
const originalWindow = g.window;
const originalDocument = g.document;

/** Documento minimo: guarda os scripts inseridos no head. */
const fakeDocument = () => {
  const head: FakeScript[] = [];
  return {
    head: { appendChild: jest.fn((el: FakeScript) => head.push(el)) },
    createElement: jest.fn((): FakeScript => ({ id: '', innerHTML: '' })),
    getElementById: jest.fn(
      (id: string) => head.find((el) => el.id === id) ?? null,
    ),
    inserted: head,
  };
};

afterEach(() => {
  g.window = originalWindow;
  g.document = originalDocument;
});

describe('initClarityWeb', () => {
  it('nao faz nada fora do navegador', () => {
    delete g.window;
    const doc = fakeDocument();
    g.document = doc;
    initClarityWeb('abc');
    expect(doc.createElement).not.toHaveBeenCalled();
  });

  it('insere o script do Clarity uma unica vez', () => {
    g.window = {};
    const doc = fakeDocument();
    g.document = doc;

    initClarityWeb('abc');
    initClarityWeb('abc');

    expect(doc.inserted).toHaveLength(1);
    expect(doc.inserted[0].id).toBe('clarity-script');
    expect(doc.inserted[0].innerHTML).toContain('"abc"');
  });
});

describe('initGAWeb', () => {
  it('nao faz nada fora do navegador', () => {
    delete g.window;
    const doc = fakeDocument();
    g.document = doc;
    initGAWeb('G-1');
    expect(doc.createElement).not.toHaveBeenCalled();
  });

  it('insere o gtag e a configuracao uma unica vez', () => {
    g.window = {};
    const doc = fakeDocument();
    g.document = doc;

    initGAWeb('G-1');
    initGAWeb('G-1');

    expect(doc.inserted).toHaveLength(2);
    expect(doc.inserted[0]).toMatchObject({
      id: 'ga4-script',
      async: true,
      src: 'https://www.googletagmanager.com/gtag/js?id=G-1',
    });
    expect(doc.inserted[1].innerHTML).toContain("gtag('config', 'G-1')");
  });
});
