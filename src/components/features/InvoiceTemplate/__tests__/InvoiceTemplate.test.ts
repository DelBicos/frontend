import InvoiceTemplate from '..';
import { logger } from '@lib/logger';
import type { InvoiceData } from '@stores/Appointment/types';

jest.mock('@lib/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

const baseInvoice: InvoiceData = {
  invoiceNumber: 'NF-0001',
  date: '2026-11-20',
  customerName: 'Maria Souza',
  customerCpf: '123.456.789-00',
  customerAddress: 'Rua das Flores, 123',
  professionalName: 'João Lima',
  professionalCpf: '987.654.321-00',
  serviceName: 'Corte de cabelo',
  serviceDescription: 'Corte masculino',
  servicePrice: 50,
  serviceDate: '20/11/2026',
  serviceTime: '14:00',
  total: 55.5,
};

// Normaliza o espaco nao separavel que o Intl usa entre "R$" e o valor.
const normalize = (html: string) => html.replace(/ /g, ' ');

describe('InvoiceTemplate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve gerar o HTML com os dados da nota', () => {
    const html = normalize(InvoiceTemplate(baseInvoice));

    expect(html).toContain('Nº NF-0001');
    expect(html).toContain('Maria Souza');
    expect(html).toContain('123.456.789-00');
    expect(html).toContain('Rua das Flores, 123');
    expect(html).toContain('João Lima');
    expect(html).toContain('Corte masculino');
    expect(html).toContain('R$ 50,00');
    expect(html).toContain('R$ 55,50');
  });

  it('deve usar textos padrão para endereço e descrição vazios', () => {
    const html = InvoiceTemplate({
      ...baseInvoice,
      customerAddress: '',
      serviceDescription: undefined as unknown as string,
    });

    expect(html).toContain('Não informado');
    expect(html).toContain('<span class="info-value">-</span>');
  });

  it('deve escapar HTML dos campos para evitar injeção', () => {
    const html = InvoiceTemplate({
      ...baseInvoice,
      customerName: '<script>alert("x")</script> & \'cia\'',
    });

    expect(html).not.toContain('<script>');
    expect(html).toContain(
      '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; &#039;cia&#039;',
    );
  });

  it('deve lançar erro e registrar quando faltam campos obrigatórios', () => {
    const invalid = {
      ...baseInvoice,
      customerCpf: null,
    } as unknown as InvoiceData;

    expect(() => InvoiceTemplate(invalid)).toThrow(
      'Dados obrigatórios da nota fiscal estão ausentes',
    );
    expect(logger.error).toHaveBeenCalledWith(
      'Dados inválidos para geração de NF:',
      invalid,
    );
  });
});
