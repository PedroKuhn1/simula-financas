import { describe, expect, it } from 'vitest';
import {
  MAX_MONTHS,
  amortize,
  annualToMonthlyRate,
  compoundInterest,
  emergencyFund,
  formatBRL,
  parseDecimal,
  roundCents,
} from './finance';

// 12,6825% a.a. equivale exatamente a 1% a.m. (1,01^12 = 1,126825), o que deixa os casos conferíveis à mão.
const ONE_PCT_MONTHLY_AS_ANNUAL = 12.682503013197;

describe('annualToMonthlyRate', () => {
  it('converte taxa anual efetiva em taxa mensal equivalente', () => {
    expect(annualToMonthlyRate(ONE_PCT_MONTHLY_AS_ANNUAL)).toBeCloseTo(0.01, 10);
  });

  it('retorna zero para taxa zero', () => {
    expect(annualToMonthlyRate(0)).toBe(0);
  });

  it('rejeita taxa negativa', () => {
    expect(() => annualToMonthlyRate(-1)).toThrow(RangeError);
  });
});

describe('roundCents', () => {
  it('arredonda para duas casas decimais', () => {
    expect(roundCents(10.005)).toBe(10.01);
    expect(roundCents(3.14159)).toBe(3.14);
  });
});

describe('compoundInterest', () => {
  it('sem juros, soma o valor inicial e os aportes', () => {
    const result = compoundInterest({ initial: 1000, monthlyContribution: 100, annualRatePct: 0, months: 12 });
    expect(result.finalBalance).toBe(2200);
    expect(result.totalInvested).toBe(2200);
    expect(result.totalInterest).toBe(0);
  });

  it('aplica juros compostos mês a mês', () => {
    const result = compoundInterest({
      initial: 1000,
      monthlyContribution: 0,
      annualRatePct: ONE_PCT_MONTHLY_AS_ANNUAL,
      months: 12,
    });
    expect(result.finalBalance).toBeCloseTo(1126.83, 2);
    expect(result.totalInterest).toBeCloseTo(126.83, 2);
  });

  it('gera uma linha do tempo com um ponto por mês, começando no mês zero', () => {
    const result = compoundInterest({ initial: 500, monthlyContribution: 50, annualRatePct: 10, months: 24 });
    expect(result.timeline).toHaveLength(25);
    expect(result.timeline[0]).toEqual({ month: 0, invested: 500, balance: 500 });
    expect(result.timeline[24]?.invested).toBe(1700);
  });

  it.each([
    [{ initial: -1, monthlyContribution: 0, annualRatePct: 10, months: 12 }],
    [{ initial: 0, monthlyContribution: Number.NaN, annualRatePct: 10, months: 12 }],
    [{ initial: 0, monthlyContribution: 0, annualRatePct: 10, months: 0 }],
    [{ initial: 0, monthlyContribution: 0, annualRatePct: 10, months: 1.5 }],
    [{ initial: 0, monthlyContribution: 0, annualRatePct: 10, months: MAX_MONTHS + 1 }],
  ])('rejeita entrada inválida %o', (input) => {
    expect(() => compoundInterest(input)).toThrow(RangeError);
  });
});

describe('amortize', () => {
  it('SAC: amortização constante e parcelas decrescentes', () => {
    const result = amortize({ principal: 120000, annualRatePct: ONE_PCT_MONTHLY_AS_ANNUAL, months: 120, system: 'sac' });
    expect(result.rows).toHaveLength(120);
    expect(result.rows.every((row) => row.amortization === 1000)).toBe(true);
    expect(result.firstPayment).toBeCloseTo(2200, 2);
    expect(result.lastPayment).toBeCloseTo(1010, 2);
    expect(result.rows[119]?.balance).toBe(0);
  });

  it('Price: parcelas fixas calculadas pela fórmula PMT', () => {
    const result = amortize({ principal: 100000, annualRatePct: ONE_PCT_MONTHLY_AS_ANNUAL, months: 12, system: 'price' });
    expect(result.firstPayment).toBeCloseTo(8884.88, 2);
    expect(result.lastPayment).toBeCloseTo(8884.88, 2);
    expect(result.rows[11]?.balance).toBe(0);
    expect(result.totalInterest).toBeCloseTo(6618.55, 1);
  });

  it('com mesmo valor, prazo e taxa, o SAC paga menos juros que a Price', () => {
    const base = { principal: 200000, annualRatePct: 11, months: 360 };
    const sac = amortize({ ...base, system: 'sac' });
    const price = amortize({ ...base, system: 'price' });
    expect(sac.totalInterest).toBeLessThan(price.totalInterest);
    expect(sac.firstPayment).toBeGreaterThan(price.firstPayment);
  });

  it.each(['sac', 'price'] as const)('%s sem juros divide o valor em parcelas iguais', (system) => {
    const result = amortize({ principal: 1200, annualRatePct: 0, months: 12, system });
    expect(result.rows.every((row) => row.payment === 100)).toBe(true);
    expect(result.totalInterest).toBe(0);
  });

  it('rejeita valor financiado zero ou negativo', () => {
    expect(() => amortize({ principal: 0, annualRatePct: 10, months: 12, system: 'sac' })).toThrow(/maior que zero/);
    expect(() => amortize({ principal: -5, annualRatePct: 10, months: 12, system: 'sac' })).toThrow(RangeError);
  });

  it('rejeita prazo inválido', () => {
    expect(() => amortize({ principal: 1000, annualRatePct: 10, months: 0, system: 'price' })).toThrow(RangeError);
  });
});

describe('emergencyFund', () => {
  it('recomenda 6 meses para CLT e calcula quanto falta e em quanto tempo', () => {
    const result = emergencyFund({ monthlyExpenses: 3000, jobType: 'clt', currentSavings: 6000, monthlySaving: 1000 });
    expect(result).toEqual({
      recommendedMonths: 6,
      target: 18000,
      missing: 12000,
      progressPct: 33.33,
      monthsToReach: 12,
    });
  });

  it('recomenda 3 meses para servidor público e 12 para autônomo', () => {
    const base = { monthlyExpenses: 1000, currentSavings: 0, monthlySaving: 100 };
    expect(emergencyFund({ ...base, jobType: 'publico' }).target).toBe(3000);
    expect(emergencyFund({ ...base, jobType: 'autonomo' }).target).toBe(12000);
  });

  it('arredonda o tempo para cima', () => {
    const result = emergencyFund({ monthlyExpenses: 1000, jobType: 'publico', currentSavings: 0, monthlySaving: 700 });
    expect(result.monthsToReach).toBe(5);
  });

  it('indica meta atingida quando já há o suficiente guardado', () => {
    const result = emergencyFund({ monthlyExpenses: 1000, jobType: 'clt', currentSavings: 9000, monthlySaving: 0 });
    expect(result.missing).toBe(0);
    expect(result.monthsToReach).toBe(0);
    expect(result.progressPct).toBe(100);
  });

  it('retorna null quando falta dinheiro e nada é poupado por mês', () => {
    const result = emergencyFund({ monthlyExpenses: 1000, jobType: 'clt', currentSavings: 0, monthlySaving: 0 });
    expect(result.monthsToReach).toBeNull();
  });

  it('considera 100% de progresso quando o gasto mensal é zero', () => {
    const result = emergencyFund({ monthlyExpenses: 0, jobType: 'clt', currentSavings: 0, monthlySaving: 0 });
    expect(result.progressPct).toBe(100);
  });

  it('rejeita valores negativos', () => {
    expect(() =>
      emergencyFund({ monthlyExpenses: -1, jobType: 'clt', currentSavings: 0, monthlySaving: 0 }),
    ).toThrow(RangeError);
  });
});

describe('formatBRL', () => {
  it('formata em reais no padrão brasileiro', () => {
    expect(formatBRL(1234.56)).toMatch(/^R\$\s1\.234,56$/);
  });
});

describe('parseDecimal', () => {
  it.each([
    ['1.234,56', 1234.56],
    ['10,5', 10.5],
    ['1234.56', 1234.56],
    [' 300 ', 300],
    ['-2', -2],
  ])('converte "%s" em %d', (text, expected) => {
    expect(parseDecimal(text)).toBe(expected);
  });

  it.each(['', '   ', 'abc', '1,2,3', '12a'])('retorna NaN para "%s"', (text) => {
    expect(parseDecimal(text)).toBeNaN();
  });
});
