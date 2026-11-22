import { describeCancellation } from '../CancelSheet';
import { reasonsFor } from '../DisputeSheet';
import { reaisToCents } from '@screens/private/admin/AdminDisputes/AdminDisputes';
import { AppointmentStatus } from '@stores/Appointment/types';

describe('describeCancellation', () => {
  const outcome = (
    tier: any,
    retentionPercent: number,
    retainedCents: number,
    refundCents: number,
  ) => ({
    tier,
    retentionPercent,
    retainedCents,
    refundCents,
  });

  it('explica cada faixa com os valores', () => {
    expect(
      describeCancellation(outcome('unconfirmed', 0, 0, 10000), 'client', true),
    ).toMatch(/nada foi cobrado/i);
    expect(
      describeCancellation(outcome('free', 0, 0, 10000), 'client', true),
    ).toMatch(/gratuito/i);
    const mid = describeCancellation(
      outcome('mid', 20, 2000, 8000),
      'client',
      true,
    );
    expect(mid).toMatch(/20%/);
    expect(mid).toMatch(/20,00/);
    expect(mid).toMatch(/80,00/);
    expect(
      describeCancellation(outcome('late', 30, 3000, 7000), 'client', true),
    ).toMatch(/30%/);
  });

  it('profissional ve que fica registrado no perfil', () => {
    expect(
      describeCancellation(
        outcome('full_refund', 0, 0, 10000),
        'professional',
        true,
      ),
    ).toMatch(/registrado no seu perfil/i);
  });

  it('sem pagamento nao ha cobranca', () => {
    expect(
      describeCancellation(outcome('mid', 20, 0, 0), 'client', false),
    ).toMatch(/não há nenhuma cobrança/i);
  });
});

describe('reasonsFor', () => {
  it('oferece motivos coerentes com o estado', () => {
    expect(reasonsFor(AppointmentStatus.NO_SHOW)).toContain('wrong_no_show');
    expect(reasonsFor(AppointmentStatus.CONFIRMED)).toContain(
      'professional_absent',
    );
    expect(reasonsFor(AppointmentStatus.COMPLETED)).toEqual(
      expect.arrayContaining([
        'service_not_done',
        'poor_quality',
        'wrong_charge',
      ]),
    );
  });
});

describe('reaisToCents', () => {
  it('converte reais para centavos', () => {
    expect(reaisToCents('25')).toBe(2500);
    expect(reaisToCents('25,5')).toBe(2550);
    expect(reaisToCents('12,34')).toBe(1234);
    expect(reaisToCents('1.234,56')).toBe(123456);
  });
  it('rejeita valores invalidos', () => {
    for (const v of ['', 'abc', '-5', '1,234', '0,001'])
      expect(reaisToCents(v)).toBeNull();
  });
});
