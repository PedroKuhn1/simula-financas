// Funções puras de cálculo financeiro. Não dependem de React nem do DOM,
// o que permite testá-las isoladamente com alta cobertura.

export type AmortizationSystem = 'sac' | 'price';
export type JobType = 'clt' | 'autonomo' | 'publico';

export interface CompoundInput {
  initial: number;
  monthlyContribution: number;
  annualRatePct: number;
  months: number;
}

export interface CompoundPoint {
  month: number;
  invested: number;
  balance: number;
}

export interface CompoundResult {
  finalBalance: number;
  totalInvested: number;
  totalInterest: number;
  timeline: CompoundPoint[];
}

export interface LoanInput {
  principal: number;
  annualRatePct: number;
  months: number;
  system: AmortizationSystem;
}

export interface LoanRow {
  month: number;
  payment: number;
  interest: number;
  amortization: number;
  balance: number;
}

export interface LoanResult {
  rows: LoanRow[];
  firstPayment: number;
  lastPayment: number;
  totalPaid: number;
  totalInterest: number;
}

export interface EmergencyInput {
  monthlyExpenses: number;
  jobType: JobType;
  currentSavings: number;
  monthlySaving: number;
}

export interface EmergencyResult {
  recommendedMonths: number;
  target: number;
  missing: number;
  progressPct: number;
  monthsToReach: number | null;
}

export const MAX_MONTHS = 600;

// Meses de despesas recomendados como reserva, por estabilidade de renda.
export const RESERVE_MONTHS: Record<JobType, number> = {
  publico: 3,
  clt: 6,
  autonomo: 12,
};

function assertNonNegative(value: number, field: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${field} deve ser um número maior ou igual a zero.`);
  }
}

function assertMonths(months: number): void {
  if (!Number.isInteger(months) || months < 1 || months > MAX_MONTHS) {
    throw new RangeError(`O prazo deve ser um número inteiro de 1 a ${MAX_MONTHS} meses.`);
  }
}

export function roundCents(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Converte uma taxa anual efetiva (em %) na taxa mensal equivalente (fração). */
export function annualToMonthlyRate(annualRatePct: number): number {
  assertNonNegative(annualRatePct, 'A taxa de juros');
  return Math.pow(1 + annualRatePct / 100, 1 / 12) - 1;
}

export function compoundInterest(input: CompoundInput): CompoundResult {
  assertNonNegative(input.initial, 'O valor inicial');
  assertNonNegative(input.monthlyContribution, 'O aporte mensal');
  assertMonths(input.months);
  const rate = annualToMonthlyRate(input.annualRatePct);

  let balance = input.initial;
  let invested = input.initial;
  const timeline: CompoundPoint[] = [{ month: 0, invested, balance }];

  for (let month = 1; month <= input.months; month++) {
    balance = balance * (1 + rate) + input.monthlyContribution;
    invested += input.monthlyContribution;
    timeline.push({ month, invested: roundCents(invested), balance: roundCents(balance) });
  }

  return {
    finalBalance: roundCents(balance),
    totalInvested: roundCents(invested),
    totalInterest: roundCents(balance - invested),
    timeline,
  };
}

export function amortize(input: LoanInput): LoanResult {
  assertNonNegative(input.principal, 'O valor financiado');
  if (input.principal === 0) {
    throw new RangeError('O valor financiado deve ser maior que zero.');
  }
  assertMonths(input.months);
  const rate = annualToMonthlyRate(input.annualRatePct);
  const { principal, months } = input;

  const pricePayment = rate === 0 ? principal / months : (principal * rate) / (1 - Math.pow(1 + rate, -months));
  const sacAmortization = principal / months;

  const rows: LoanRow[] = [];
  let balance = principal;

  for (let month = 1; month <= months; month++) {
    const interest = balance * rate;
    const amortization = input.system === 'sac' ? sacAmortization : pricePayment - interest;
    const payment = amortization + interest;
    balance = month === months ? 0 : balance - amortization;
    rows.push({
      month,
      payment: roundCents(payment),
      interest: roundCents(interest),
      amortization: roundCents(amortization),
      balance: roundCents(Math.max(balance, 0)),
    });
  }

  const totalPaid = rows.reduce((sum, row) => sum + row.payment, 0);
  return {
    rows,
    firstPayment: rows[0]!.payment,
    lastPayment: rows[rows.length - 1]!.payment,
    totalPaid: roundCents(totalPaid),
    totalInterest: roundCents(totalPaid - principal),
  };
}

export function emergencyFund(input: EmergencyInput): EmergencyResult {
  assertNonNegative(input.monthlyExpenses, 'O gasto mensal');
  assertNonNegative(input.currentSavings, 'O valor já guardado');
  assertNonNegative(input.monthlySaving, 'O valor poupado por mês');

  const recommendedMonths = RESERVE_MONTHS[input.jobType];
  const target = roundCents(input.monthlyExpenses * recommendedMonths);
  const missing = roundCents(Math.max(target - input.currentSavings, 0));
  const progressPct = target === 0 ? 100 : Math.min(100, roundCents((input.currentSavings / target) * 100));

  let monthsToReach: number | null;
  if (missing === 0) {
    monthsToReach = 0;
  } else if (input.monthlySaving === 0) {
    monthsToReach = null;
  } else {
    monthsToReach = Math.ceil(missing / input.monthlySaving);
  }

  return { recommendedMonths, target, missing, progressPct, monthsToReach };
}

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function formatBRL(value: number): string {
  return brl.format(value);
}

/** Converte texto digitado ("1.234,56" ou "1234.56") em número. Retorna NaN se inválido. */
export function parseDecimal(text: string): number {
  const trimmed = text.trim();
  if (trimmed === '') return NaN;
  const normalized = trimmed.includes(',') ? trimmed.replace(/\./g, '').replace(',', '.') : trimmed;
  if (!/^-?\d+(\.\d+)?$/.test(normalized)) return NaN;
  return Number(normalized);
}
